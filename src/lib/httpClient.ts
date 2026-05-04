import { invoke } from "@tauri-apps/api/core";

import type { HttpResponse, RequestDraft } from "../types/http";
import { activePairs } from "../utils/request";

interface RustHttpResponse {
  status: number;
  status_text: string;
  headers: Array<[string, string]>;
  body: string;
  time_ms: number;
  size_bytes: number;
}

/**
 * Sends a request through the Rust side. We do it there so we get to bypass
 * CORS and get accurate timing — the browser's `fetch` would lie to us about
 * both.
 */
export async function sendRequest(draft: RequestDraft): Promise<HttpResponse> {
  const raw = await invoke<RustHttpResponse>("send_http_request", {
    input: {
      method: draft.method,
      url: draft.url.trim(),
      headers: activePairs(draft.headers),
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
