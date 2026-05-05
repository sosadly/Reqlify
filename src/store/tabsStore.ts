import { create } from "zustand";

import { STORAGE_KEYS } from "../constants/storage";
import { loadJson, saveJson } from "../lib/storage";
import type { RequestDraft } from "../types/http";
import type { RequestStatus, RequestTab } from "../types/tabs";
import { createId } from "../utils/id";
import { emptyAuth, emptyDraft, tabTitleFromUrl } from "../utils/request";

interface PersistedTabs {
  tabs: Array<Pick<RequestTab, "id" | "title" | "draft">>;
  activeId: string | null;
}

interface TabsState {
  tabs: RequestTab[];
  activeId: string | null;
  newTab: () => void;
  closeTab: (id: string) => void;
  selectTab: (id: string) => void;
  updateDraft: (id: string, patch: Partial<RequestDraft>) => void;
  setStatus: (id: string, status: RequestStatus) => void;
  setResponse: (id: string, response: RequestTab["response"]) => void;
  setError: (id: string, error: RequestTab["error"]) => void;
}

function makeTab(): RequestTab {
  return {
    id: createId(),
    title: "New Request",
    draft: emptyDraft(),
    status: "idle",
    response: null,
    error: null,
  };
}

function hydrate(): { tabs: RequestTab[]; activeId: string | null } {
  const persisted = loadJson<PersistedTabs | null>(STORAGE_KEYS.tabs, null);
  if (!persisted || persisted.tabs.length === 0) {
    const fresh = makeTab();
    return { tabs: [fresh], activeId: fresh.id };
  }
  const tabs: RequestTab[] = persisted.tabs.map((t) => ({
    id: t.id,
    title: t.title,
    // Merge with emptyDraft so any fields added in newer versions (e.g. auth)
    // always exist even when loading old persisted data.
    draft: { ...emptyDraft(t.draft?.method), ...t.draft, auth: t.draft?.auth ?? emptyAuth() },
    status: "idle",
    response: null,
    error: null,
  }));
  const activeId =
    persisted.activeId && tabs.some((t) => t.id === persisted.activeId)
      ? persisted.activeId
      : tabs[0].id;
  return { tabs, activeId };
}

const initial = hydrate();

export const useTabsStore = create<TabsState>((set) => ({
  tabs: initial.tabs,
  activeId: initial.activeId,

  newTab: () => {
    const tab = makeTab();
    set((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id }));
  },

  closeTab: (id) => {
    set((s) => {
      const remaining = s.tabs.filter((t) => t.id !== id);
      // Don't strand the user with no tabs — always keep at least one.
      if (remaining.length === 0) {
        const fresh = makeTab();
        return { tabs: [fresh], activeId: fresh.id };
      }
      const activeId =
        s.activeId === id ? remaining[remaining.length - 1].id : s.activeId;
      return { tabs: remaining, activeId };
    });
  },

  selectTab: (id) => set({ activeId: id }),

  updateDraft: (id, patch) => {
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.id !== id) return t;
        const draft = { ...t.draft, ...patch };
        // Re-derive the tab title whenever the URL changes so the strip
        // stays informative without the user having to rename anything.
        const title =
          patch.url !== undefined ? tabTitleFromUrl(draft.url) : t.title;
        return { ...t, draft, title };
      }),
    }));
  },

  setStatus: (id, status) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  setResponse: (id, response) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, response, error: null, status: "success" } : t,
      ),
    })),

  setError: (id, error) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, error, response: null, status: "error" } : t,
      ),
    })),
}));

// Persist drafts on any change. We strip transient fields (response, status)
// because they shouldn't survive an app restart.
useTabsStore.subscribe((state) => {
  const payload: PersistedTabs = {
    activeId: state.activeId,
    tabs: state.tabs.map((t) => ({ id: t.id, title: t.title, draft: t.draft })),
  };
  saveJson(STORAGE_KEYS.tabs, payload);
});
