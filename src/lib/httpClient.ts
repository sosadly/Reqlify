import { invoke } from "@tauri-apps/api/core";

import { useEnvStore } from "../store/envStore";
import type { AuthConfig, HttpResponse, RequestDraft } from "../types/http";
import { activePairs } from "../utils/request";

function applyEnvVars(text: string, vars: Record<string, string>): string {
  if (Object.keys(vars).length === 0) return text;
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => vars[key.trim()] ?? `{{${key}}}`);
}

function applyEnvToEntries(
  entries: Array<[string, string]>,
  vars: Record<string, string>,
): Array<[string, string]> {
  return entries.map(([k, v]) => [applyEnvVars(k, vars), applyEnvVars(v, vars)]);
}

interface RustHttpResponse {
  status: number;
  status_text: string;
  headers: Array<[string, string]>;
  body: string;
  time_ms: number;
  size_bytes: number;
}

/** Build the Authorization header value from auth config, or null if inactive. */
function resolveAuthHeader(auth: AuthConfig): [string, string] | null {
  if (auth.mode === "bearer" && auth.bearerToken.trim()) {
    return ["Authorization", `Bearer ${auth.bearerToken.trim()}`];
  }
  if (auth.mode === "basic" && auth.basicUser.trim()) {
    const encoded = btoa(`${auth.basicUser}:${auth.basicPassword}`);
    return ["Authorization", `Basic ${encoded}`];
  }
  return null;
}

/**
 * Sends a request through the Rust side. We do it there so we get to bypass
 * CORS and get accurate timing — the browser's `fetch` would lie to us about
 * both.
 *
 * Auth is resolved here rather than in the UI so the Headers tab always shows
 * what the user typed, never the injected Authorization value.
 */
export async function sendRequest(draft: RequestDraft): Promise<HttpResponse> {
  const vars = useEnvStore.getState().activeVars();

  const userHeaders = activePairs(draft.headers);
  const resolvedAuth: AuthConfig = {
    ...draft.auth,
    bearerToken: applyEnvVars(draft.auth.bearerToken, vars),
    basicUser: applyEnvVars(draft.auth.basicUser, vars),
    basicPassword: applyEnvVars(draft.auth.basicPassword, vars),
  };
  const authHeader = resolveAuthHeader(resolvedAuth);

  // Auth header wins over a manually set Authorization if both exist.
  const headers: Array<[string, string]> = authHeader
    ? [authHeader, ...userHeaders.filter(([k]) => k.toLowerCase() !== "authorization")]
    : userHeaders;

  const raw = await invoke<RustHttpResponse>("send_http_request", {
    input: {
      method: draft.method,
      url: applyEnvVars(draft.url.trim(), vars),
      headers: applyEnvToEntries(headers, vars),
      query: applyEnvToEntries(activePairs(draft.params), vars),
      body: draft.bodyMode === "none" ? null : applyEnvVars(draft.body, vars),
    },
  });

  return {
    status: raw.status,
    statusText: raw.status_text,
    headers: raw.headers,
    body: raw.body,
    timeMs: raw.time_ms,
    sizeBytes: raw.size_bytes,
  };
}
