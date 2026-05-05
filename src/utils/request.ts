import type { AuthConfig, HttpMethod, KeyValueEntry, RequestDraft } from "../types/http";
import { createId } from "./id";

export function makeKvEntry(partial: Partial<KeyValueEntry> = {}): KeyValueEntry {
  return {
    id: createId(),
    key: "",
    value: "",
    enabled: true,
    ...partial,
  };
}

export function emptyAuth(): AuthConfig {
  return { mode: "none", bearerToken: "", basicUser: "", basicPassword: "" };
}

export function emptyDraft(method: HttpMethod = "GET"): RequestDraft {
  return {
    method,
    url: "",
    params: [makeKvEntry()],
    headers: [makeKvEntry()],
    bodyMode: "none",
    body: "",
    auth: emptyAuth(),
  };
}

/** Drop empty/disabled rows and return [key, value] pairs ready for the wire. */
export function activePairs(entries: KeyValueEntry[]): Array<[string, string]> {
  return entries
    .filter((e) => e.enabled && e.key.trim() !== "")
    .map((e) => [e.key, e.value]);
}

export function tabTitleFromUrl(url: string, fallback = "New Request"): string {
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  try {
    const u = new URL(trimmed);
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.host}${path}`;
  } catch {
    return trimmed.length > 32 ? `${trimmed.slice(0, 32)}…` : trimmed;
  }
}
