import { create } from "zustand";

import { HISTORY_LIMIT, STORAGE_KEYS } from "../constants/storage";
import { loadJson, saveJson } from "../lib/storage";
import type { HistoryEntry } from "../types/history";
import type { HttpMethod } from "../types/http";
import { createId } from "../utils/id";

interface HistoryState {
  entries: HistoryEntry[];
  record: (input: {
    method: HttpMethod;
    url: string;
    status: number;
    timeMs: number;
  }) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const initial = loadJson<HistoryEntry[]>(STORAGE_KEYS.history, []);

export const useHistoryStore = create<HistoryState>((set) => ({
  entries: initial,

  record: ({ method, url, status, timeMs }) => {
    set((s) => {
      const entry: HistoryEntry = {
        id: createId(),
        method,
        url,
        status,
        timeMs,
        at: new Date().toISOString(),
      };
      const next = [entry, ...s.entries].slice(0, HISTORY_LIMIT);
      return { entries: next };
    });
  },

  remove: (id) =>
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

  clear: () => set({ entries: [] }),
}));

useHistoryStore.subscribe((state) => {
  saveJson(STORAGE_KEYS.history, state.entries);
});
