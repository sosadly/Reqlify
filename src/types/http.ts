export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface KeyValueEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export type BodyMode = "none" | "json" | "text";

export interface RequestDraft {
  method: HttpMethod;
  url: string;
  params: KeyValueEntry[];
  headers: KeyValueEntry[];
  bodyMode: BodyMode;
  body: string;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Array<[string, string]>;
  body: string;
  timeMs: number;
  sizeBytes: number;
}

export interface RequestError {
  message: string;
}
