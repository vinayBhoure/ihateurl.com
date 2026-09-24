import { parse, type HTMLElement } from "node-html-parser";
import { fetchHtml } from "@/server/metadata/fetch";

const MAX_TITLE = 300;
const MAX_DESCRIPTION = 1000;
const MAX_URL = 2048;

export type LinkMetadata = {
  domain: string;
  title?: string;
  description?: string;
  faviconUrl?: string;
  imageUrl?: string;
};

function clean(value: string | undefined, max: number): string | undefined {
  const text = value?.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, max) : undefined;
}

/** Resolves against the final page URL; keeps only http(s) (no `javascript:` / `data:`). */
function safeUrl(value: string | undefined, base: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim(), base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    const href = url.toString();
    return href.length <= MAX_URL ? href : undefined;
  } catch {
    return undefined;
  }
}

function metaContent(root: HTMLElement, keys: string[]): string | undefined {
  for (const key of keys) {
    for (const attr of ["property", "name"]) {
      const content = root.querySelector(`meta[${attr}="${key}"]`)?.getAttribute("content");
      if (content?.trim()) return content;
    }
  }
  return undefined;
}

function iconHref(root: HTMLElement): string | undefined {
  for (const link of root.querySelectorAll("link")) {
    const rel = (link.getAttribute("rel") ?? "").toLowerCase().split(/\s+/);
    const href = link.getAttribute("href");
    if (rel.includes("icon") && href?.trim()) return href;
  }
  return undefined;
}

export function parseMetadata(html: string, pageUrl: string): Omit<LinkMetadata, "domain"> {
  const root = parse(html);
  return {
    title: clean(
      metaContent(root, ["og:title", "twitter:title"]) ?? root.querySelector("title")?.text,
      MAX_TITLE
    ),
    description: clean(metaContent(root, ["og:description", "description"]), MAX_DESCRIPTION),
    imageUrl: safeUrl(metaContent(root, ["og:image", "twitter:image"]), pageUrl),
    faviconUrl: safeUrl(iconHref(root), pageUrl) ?? safeUrl("/favicon.ico", pageUrl),
  };
}

/** Never throws: on any fetch or parse failure only `domain` is returned (P6). */
export async function getMetadata(url: string): Promise<LinkMetadata> {
  let domain = "";
  try {
    domain = new URL(url).hostname;
  } catch {
    return { domain };
  }
  try {
    const { finalUrl, html } = await fetchHtml(url);
    return { domain, ...parseMetadata(html, finalUrl) };
  } catch {
    return { domain };
  }
}
