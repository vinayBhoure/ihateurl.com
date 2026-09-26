"use client";

import { useId, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { PrefixedInput } from "@/components/prefixed-input";
import { SocialIcon } from "@/components/social-icon";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useActionForm } from "@/hooks/use-action-form";
import {
  EXTRA_LINKS_MAX,
  HANDLE_PLATFORMS,
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_URL_MAX_LENGTH,
  URL_PLATFORMS,
  buildUrl,
  isHandlePlatform,
  normalizeHandle,
  socialValueError,
  type HandlePlatform,
  type SocialPlatform,
  type UrlPlatform,
} from "@/lib/social-platforms";
import { ensureScheme } from "@/lib/url/ensure-scheme";
import { socialFieldKey, socialLinksSchema } from "@/lib/validations/social";
import { updateSocialLinks } from "@/server/actions/profile";

type Extra = { key: number; platform: UrlPlatform; value: string };

/**
 * Plan 7 S7.5. Handle rows are sent first in `HANDLE_PLATFORMS` order (empty ones included),
 * then the extra rows, so a row's field-error key is `links.{its index}` and the saved
 * order matches what is shown here.
 */
export function SocialLinksForm({
  links,
}: {
  links: { platform: SocialPlatform; value: string }[];
}) {
  const [handles, setHandles] = useState(() => initialHandles(links));
  const [extras, setExtras] = useState<Extra[]>(() =>
    links.flatMap((link, key) =>
      isHandlePlatform(link.platform) ? [] : [{ key, platform: link.platform, value: link.value }]
    )
  );
  const nextKey = useRef(links.length);
  const { pending, fieldErrors, submit } = useActionForm({
    schema: socialLinksSchema,
    action: updateSocialLinks,
    successMessage: "Social links saved",
    onSuccess: () =>
      setHandles((current) => mapHandles((p) => normalizeHandle(p, current[p]))),
  });

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          links: [
            ...HANDLE_PLATFORMS.map((platform) => ({ platform, value: handles[platform] })),
            ...extras.map(({ platform, value }) => ({ platform, value })),
          ],
        });
      }}
    >
      <p className="text-sm text-muted-foreground">
        Filled links show as icons on your public profile.
      </p>

      <div className="grid gap-4">
        {HANDLE_PLATFORMS.map((platform, index) => (
          <HandleField
            key={platform}
            platform={platform}
            value={handles[platform]}
            error={fieldErrors[socialFieldKey(index)]?.[0]}
            onChange={(value) => setHandles((current) => ({ ...current, [platform]: value }))}
          />
        ))}
      </div>

      <ExtraLinks
        extras={extras}
        errorFor={(index) => fieldErrors[socialFieldKey(HANDLE_PLATFORMS.length + index)]?.[0]}
        onAdd={(platform, value) => {
          const key = nextKey.current++;
          setExtras((current) => [...current, { key, platform, value }]);
        }}
        onRemove={(key) => setExtras((current) => current.filter((e) => e.key !== key))}
      />

      <div className="grid gap-2">
        {fieldErrors.links && <p className="text-sm text-destructive">{fieldErrors.links[0]}</p>}
        <div>
          <SubmitButton pending={pending}>Save social links</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function initialHandles(links: { platform: SocialPlatform; value: string }[]) {
  return mapHandles(
    (platform) => links.find((link) => link.platform === platform)?.value ?? ""
  );
}

function mapHandles(fn: (platform: HandlePlatform) => string): Record<HandlePlatform, string> {
  return Object.fromEntries(HANDLE_PLATFORMS.map((p) => [p, fn(p)])) as Record<
    HandlePlatform,
    string
  >;
}

function HandleField({
  platform,
  value,
  error,
  onChange,
}: {
  platform: HandlePlatform;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const { label, prefix } = SOCIAL_PLATFORM_CONFIG[platform];
  const id = `social-${platform.toLowerCase()}`;
  const handle = normalizeHandle(platform, value);
  const describedBy = [error && `${id}-error`, handle && `${id}-preview`].filter(Boolean).join(" ");

  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={id}>{label}</Label>
      <PrefixedInput
        id={id}
        prefix={prefix}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={SOCIAL_URL_MAX_LENGTH}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {handle && (
        <p id={`${id}-preview`} className="font-mono text-xs break-all text-muted-foreground">
          {buildUrl(platform, handle)}
        </p>
      )}
    </div>
  );
}

function ExtraLinks({
  extras,
  errorFor,
  onAdd,
  onRemove,
}: {
  extras: Extra[];
  errorFor: (index: number) => string | undefined;
  onAdd: (platform: UrlPlatform, value: string) => void;
  onRemove: (key: number) => void;
}) {
  const id = useId();
  const [platform, setPlatform] = useState<UrlPlatform>("WEBSITE");
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const websiteUsed = extras.some((e) => e.platform === "WEBSITE");
  const full = extras.length >= EXTRA_LINKS_MAX;
  const selected: UrlPlatform = platform === "WEBSITE" && websiteUsed ? "OTHER" : platform;
  const inputId = `${id}-url`;

  function add() {
    const value = ensureScheme(draft);
    if (value === "") return;
    const error = socialValueError(selected, value);
    if (error) {
      setDraftError(error);
      return;
    }
    onAdd(selected, value);
    setDraft("");
    setDraftError(null);
    if (selected === "WEBSITE") setPlatform("OTHER");
  }

  return (
    <div className="grid gap-4">
      {extras.length > 0 && (
        <ul aria-label="Extra links" className="divide-y rounded-lg border">
          {extras.map((extra, index) => {
            const error = errorFor(index);
            const removeLabel = `Remove ${extra.value}`;
            return (
              <li key={extra.key} className="flex min-h-11 items-center gap-3 py-1 pr-1 pl-4">
                <SocialIcon platform={extra.platform} className="text-muted-foreground" />
                <div className="min-w-0 flex-1 py-1">
                  <p className="text-sm">{SOCIAL_PLATFORM_CONFIG[extra.platform].label}</p>
                  <p className="font-mono text-xs break-all text-muted-foreground">{extra.value}</p>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={removeLabel}
                      onClick={() => onRemove(extra.key)}
                    >
                      <X />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}

      <div className="grid gap-2">
        <Label htmlFor={inputId}>Add a link</Label>
        <div className="flex gap-2">
          <Select
            value={selected}
            onValueChange={(value) => setPlatform(value as UrlPlatform)}
            disabled={full}
          >
            <SelectTrigger aria-label="Link type" className="w-28 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URL_PLATFORMS.map((p) => (
                <SelectItem key={p} value={p} disabled={p === "WEBSITE" && websiteUsed}>
                  {SOCIAL_PLATFORM_CONFIG[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id={inputId}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDraftError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            disabled={full}
            maxLength={SOCIAL_URL_MAX_LENGTH}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 font-mono"
            aria-invalid={draftError ? true : undefined}
            aria-describedby={draftError ? `${inputId}-error` : `${inputId}-hint`}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label="Add link"
                onClick={add}
                disabled={full || draft.trim() === ""}
              >
                <Check />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add link</TooltipContent>
          </Tooltip>
        </div>
        {draftError ? (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {draftError}
          </p>
        ) : (
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {full
              ? `You've added ${EXTRA_LINKS_MAX} extra links, the most allowed.`
              : `Website or any other https:// link, up to ${EXTRA_LINKS_MAX}. Save to publish.`}
          </p>
        )}
      </div>
    </div>
  );
}
