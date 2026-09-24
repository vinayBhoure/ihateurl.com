import dns from "node:dns";
import net from "node:net";
import { Agent, fetch, type Response } from "undici";
import { env } from "@/config/env";

const TIMEOUT_MS = 5_000;
const MAX_BYTES = 1024 * 1024;
const MAX_REDIRECTS = 3;
const ALLOWED_PORTS = new Set([80, 443]);
const USER_AGENT = `ihateurl-bot/1.0 (+${env.appUrl})`;

export class MetadataFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetadataFetchError";
  }
}

// Private, loopback, link-local (incl. 169.254.169.254), CGNAT, multicast,
// documentation and reserved ranges. BlockList checks `::ffff:a.b.c.d` against the
// IPv4 rules, so mapped addresses need no IPv6 rule (adding `::ffff:0:0/96` would
// match every IPv4 address).
const blocked = new net.BlockList();
for (const [net4, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(net4, prefix, "ipv4");
}
for (const [net6, prefix] of [
  ["::", 96],
  ["64:ff9b::", 96],
  ["64:ff9b:1::", 48],
  ["100::", 64],
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["fc00::", 7],
  ["fe80::", 10],
  ["fec0::", 10],
  ["ff00::", 8],
] as const) {
  blocked.addSubnet(net6, prefix, "ipv6");
}

function isBlockedAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 0) return true;
  return blocked.check(address, family === 4 ? "ipv4" : "ipv6");
}

type LookupCallback = (
  err: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number
) => void;

/** Runs at connect time for every connection, so DNS rebinding can't slip past an earlier check. */
function safeLookup(hostname: string, options: dns.LookupOptions, callback: LookupCallback): void {
  dns.lookup(hostname, { all: true, family: options.family ?? 0 }, (err, addresses) => {
    if (err) return callback(err, []);
    if (addresses.length === 0 || addresses.some((a) => isBlockedAddress(a.address))) {
      return callback(new MetadataFetchError("Blocked address"), []);
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

const agent = new Agent({
  connect: { lookup: safeLookup as unknown as net.LookupFunction },
  connectTimeout: TIMEOUT_MS,
});

function assertFetchableUrl(url: URL): void {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new MetadataFetchError("Unsupported protocol");
  }
  if (url.username || url.password) throw new MetadataFetchError("Credentials in URL");
  const port = url.port ? Number(url.port) : url.protocol === "https:" ? 443 : 80;
  if (!ALLOWED_PORTS.has(port)) throw new MetadataFetchError("Port not allowed");

  // IP literals never reach the lookup hook, so check them here.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) && isBlockedAddress(host)) throw new MetadataFetchError("Blocked address");
}

async function readCapped(res: Response): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (!res.body) return new Uint8Array();
  for await (const chunk of res.body) {
    const remaining = MAX_BYTES - size;
    chunks.push(chunk.byteLength > remaining ? chunk.subarray(0, remaining) : chunk);
    size += Math.min(chunk.byteLength, remaining);
    if (size >= MAX_BYTES) break;
  }
  const out = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function decode(bytes: Uint8Array, contentType: string): string {
  const charset = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];
  try {
    return new TextDecoder(charset ?? "utf-8").decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/**
 * The only way the app fetches a user-supplied URL. http(s) on 80/443 only, blocked
 * address ranges checked at connect time, ≤ 3 re-validated redirects, 5 s total,
 * first 1 MB of `text/html` only. Throws `MetadataFetchError` (or an abort error).
 */
export async function fetchHtml(input: string): Promise<{ finalUrl: string; html: string }> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let url = new URL(input);

  for (let hop = 0; ; hop++) {
    assertFetchableUrl(url);
    const res = await fetch(url, {
      dispatcher: agent,
      redirect: "manual",
      signal,
      headers: { "user-agent": USER_AGENT, accept: "text/html" },
    });

    if (res.status >= 300 && res.status < 400) {
      await res.body?.cancel();
      const location = res.headers.get("location");
      if (!location) throw new MetadataFetchError("Redirect without location");
      if (hop >= MAX_REDIRECTS) throw new MetadataFetchError("Too many redirects");
      url = new URL(location, url);
      continue;
    }

    if (!res.ok) {
      await res.body?.cancel();
      throw new MetadataFetchError(`HTTP ${res.status}`);
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("text/html")) {
      await res.body?.cancel();
      throw new MetadataFetchError("Not HTML");
    }

    const bytes = await readCapped(res);
    return { finalUrl: url.toString(), html: decode(bytes, contentType) };
  }
}
