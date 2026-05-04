import type { HttpMethod } from "./http";

export interface HistoryEntry {
  id: string;
  method: HttpMethod;
  url: string;
  status: number;
  timeMs: number;
  /** ISO timestamp of when the request finished. */
  at: string;
}
