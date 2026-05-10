import type { RequestDraft } from "./http";

export interface CollectionRequest {
  id: string;
  name: string;
  draft: RequestDraft;
}

export interface Collection {
  id: string;
  name: string;
  requests: CollectionRequest[];
}
