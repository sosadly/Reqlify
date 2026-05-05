import { invoke } from "@tauri-apps/api/core";

import type { AuthConfig, HttpResponse, RequestDraft } from "../types/http";
import { activePairs } from "../utils/request";

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
  const userHeaders = activePairs(draft.headers);
  const authHeader = resolveAuthHeader(draft.auth);

  // Auth header wins over a manually set Authorization if both exist.
  const headers: Array<[string, string]> = authHeader
    ? [authHeader, ...userHeaders.filter(([k]) => k.toLowerCase() !== "authorization")]
    : userHeaders;

  const raw = await invoke<RustHttpResponse>("send_http_request", {
    input: {
      method: draft.method,
      url: draft.url.trim(),
      headers,
      query: activePairs(draft.params),
      body: draft.bodyMode === "none" ? null : draft.body,
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
