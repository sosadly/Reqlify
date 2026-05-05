import type { RequestDraft } from "../types/http";
import { activePairs } from "../utils/request";

/** Wrap a string in single quotes, escaping any embedded single quotes. */
function sq(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

/**
 * Export a request draft as a cURL command string — the same format browsers
 * use for "Copy as cURL" in DevTools, so it can be pasted straight into a
 * terminal or shared with a colleague.
 */
export function exportAsCurl(draft: RequestDraft): string {
  const parts: string[] = ["curl"];

  // Method (skip -X GET since curl defaults to GET).
  if (draft.method !== "GET" || (draft.bodyMode !== "none" && draft.body.trim())) {
    parts.push(`-X ${draft.method}`);
  }

  // Build the URL including active query params.
  let url = draft.url.trim();
  const queryPairs = activePairs(draft.params);
  if (queryPairs.length > 0) {
    const qs = queryPairs
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    url += (url.includes("?") ? "&" : "?") + qs;
  }
  parts.push(sq(url));

  // Auth header.
  if (draft.auth.mode === "bearer" && draft.auth.bearerToken.trim()) {
    parts.push(`-H ${sq(`Authorization: Bearer ${draft.auth.bearerToken.trim()}`)}`);
  } else if (draft.auth.mode === "basic" && draft.auth.basicUser.trim()) {
    parts.push(`-u ${sq(`${draft.auth.basicUser}:${draft.auth.basicPassword}`)}`);
  }

  // User-defined headers.
  for (const [key, value] of activePairs(draft.headers)) {
    parts.push(`-H ${sq(`${key}: ${value}`)}`);
  }

  // Body.
  if (draft.bodyMode !== "none" && draft.body.trim()) {
    parts.push(`--data-raw ${sq(draft.body)}`);
  }

  // Join with space + backslash-newline for readability (same as Chrome DevTools).
  return parts.join(" \\\n  ");
}
