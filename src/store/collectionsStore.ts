import { create } from "zustand";

import { STORAGE_KEYS } from "../constants/storage";
import { loadJson, saveJson } from "../lib/storage";
import type { Collection, CollectionRequest } from "../types/collection";
import type { RequestDraft } from "../types/http";
import { createId } from "../utils/id";

interface CollectionsState {
  collections: Collection[];
  createCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  saveRequest: (collectionId: string, name: string, draft: RequestDraft) => void;
  deleteRequest: (collectionId: string, requestId: string) => void;
}

const initial = loadJson<Collection[]>(STORAGE_KEYS.collections, []);

export const useCollectionsStore = create<CollectionsState>((set) => ({
  collections: initial,

  createCollection: (name) => {
    const id = createId();
    set((s) => ({ collections: [...s.collections, { id, name, requests: [] }] }));
    return id;
  },

  deleteCollection: (id) =>
    set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),

  renameCollection: (id, name) =>
    set((s) => ({
      collections: s.collections.map((c) => (c.id === id ? { ...c, name } : c)),
    })),

  saveRequest: (collectionId, name, draft) => {
    const req: CollectionRequest = { id: createId(), name, draft };
    set((s) => ({
      collections: s.collections.map((c) =>
        c.id === collectionId ? { ...c, requests: [...c.requests, req] } : c,
      ),
    }));
  },

  deleteRequest: (collectionId, requestId) =>
    set((s) => ({
      collections: s.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
          : c,
      ),
    })),
}));

useCollectionsStore.subscribe((state) => {
  saveJson(STORAGE_KEYS.collections, state.collections);
});
