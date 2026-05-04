import type { HttpResponse, RequestDraft, RequestError } from "./http";

export type RequestStatus = "idle" | "sending" | "success" | "error";

export interface RequestTab {
  id: string;
  title: string;
  draft: RequestDraft;
  status: RequestStatus;
  response: HttpResponse | null;
  error: RequestError | null;
}
