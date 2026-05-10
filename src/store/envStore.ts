import { create } from "zustand";

import { STORAGE_KEYS } from "../constants/storage";
import { loadJson, saveJson } from "../lib/storage";
import type { EnvSet } from "../types/env";
import type { KeyValueEntry } from "../types/http";
import { createId } from "../utils/id";
import { makeKvEntry } from "../utils/request";

interface PersistedEnv {
  sets: EnvSet[];
  activeId: string | null;
}

interface EnvState {
  sets: EnvSet[];
  activeId: string | null;
  activeVars: () => Record<string, string>;
  createSet: (name: string) => void;
  deleteSet: (id: string) => void;
  renameSet: (id: string, name: string) => void;
  selectSet: (id: string | null) => void;
  updateVariables: (setId: string, variables: KeyValueEntry[]) => void;
}

const persisted = loadJson<PersistedEnv>(STORAGE_KEYS.env, { sets: [], activeId: null });

export const useEnvStore = create<EnvState>((set, get) => ({
  sets: persisted.sets,
  activeId: persisted.activeId,

  activeVars: () => {
    const { sets, activeId } = get();
    const active = sets.find((s) => s.id === activeId);
    if (!active) return {};
    return Object.fromEntries(
      active.variables
        .filter((v) => v.enabled && v.key.trim() !== "")
        .map((v) => [v.key.trim(), v.value]),
    );
  },

  createSet: (name) => {
    const newSet: EnvSet = { id: createId(), name, variables: [makeKvEntry()] };
    set((s) => ({ sets: [...s.sets, newSet], activeId: newSet.id }));
  },

  deleteSet: (id) => {
    set((s) => {
      const sets = s.sets.filter((e) => e.id !== id);
      const activeId = s.activeId === id ? (sets[0]?.id ?? null) : s.activeId;
      return { sets, activeId };
    });
  },

  renameSet: (id, name) =>
    set((s) => ({
      sets: s.sets.map((e) => (e.id === id ? { ...e, name } : e)),
    })),

  selectSet: (id) => set({ activeId: id }),

  updateVariables: (setId, variables) =>
    set((s) => ({
      sets: s.sets.map((e) => (e.id === setId ? { ...e, variables } : e)),
    })),
}));

useEnvStore.subscribe((state) => {
  saveJson(STORAGE_KEYS.env, { sets: state.sets, activeId: state.activeId });
});
