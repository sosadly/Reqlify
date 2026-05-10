import { create } from "zustand";

import { STORAGE_KEYS } from "../constants/storage";
import { loadJson, saveJson } from "../lib/storage";
import type { HttpResponse, RequestDraft, RequestError } from "../types/http";
import type { RequestStatus, RequestTab } from "../types/tabs";
import { createId } from "../utils/id";
import { emptyAuth, emptyDraft, tabTitleFromUrl } from "../utils/request";

interface PersistedTab {
  id: string;
  title: string;
  draft: RequestDraft;
  response?: HttpResponse | null;
  error?: RequestError | null;
}

interface PersistedTabs {
  tabs: PersistedTab[];
  activeId: string | null;
}

interface TabsState {
  tabs: RequestTab[];
  activeId: string | null;
  newTab: () => void;
  closeTab: (id: string) => void;
  closeOthers: (id: string) => void;
  closeToRight: (id: string) => void;
  closeToLeft: (id: string) => void;
  closeAll: () => void;
  duplicateTab: (id: string) => void;
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
  const tabs: RequestTab[] = persisted.tabs.map((t) => {
    const response = t.response ?? null;
    const error = t.error ?? null;
    const status: RequestStatus = response ? "success" : error ? "error" : "idle";
    return {
      id: t.id,
      title: t.title,
      // Merge with emptyDraft so any fields added in newer versions (e.g. auth)
      // always exist even when loading old persisted data.
      draft: { ...emptyDraft(t.draft?.method), ...t.draft, auth: t.draft?.auth ?? emptyAuth() },
      status,
      response,
      error,
    };
  });
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
      if (remaining.length === 0) {
        const fresh = makeTab();
        return { tabs: [fresh], activeId: fresh.id };
      }
      const activeId =
        s.activeId === id ? remaining[remaining.length - 1].id : s.activeId;
      return { tabs: remaining, activeId };
    });
  },

  closeOthers: (id) => {
    set((s) => {
      const tab = s.tabs.find((t) => t.id === id);
      if (!tab) return s;
      return { tabs: [tab], activeId: id };
    });
  },

  closeToRight: (id) => {
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === id);
      if (idx === -1) return s;
      const tabs = s.tabs.slice(0, idx + 1);
      const activeId = tabs.some((t) => t.id === s.activeId)
        ? s.activeId
        : tabs[tabs.length - 1].id;
      return { tabs, activeId };
    });
  },

  closeToLeft: (id) => {
    set((s) => {
      const idx = s.tabs.findIndex((t) => t.id === id);
      if (idx === -1) return s;
      const tabs = s.tabs.slice(idx);
      const activeId = tabs.some((t) => t.id === s.activeId) ? s.activeId : id;
      return { tabs, activeId };
    });
  },

  closeAll: () => {
    const fresh = makeTab();
    set({ tabs: [fresh], activeId: fresh.id });
  },

  duplicateTab: (id) => {
    set((s) => {
      const src = s.tabs.find((t) => t.id === id);
      if (!src) return s;
      const copy: RequestTab = {
        ...src,
        id: createId(),
        status: "idle",
        response: null,
        error: null,
      };
      const idx = s.tabs.findIndex((t) => t.id === id);
      const tabs = [...s.tabs.slice(0, idx + 1), copy, ...s.tabs.slice(idx + 1)];
      return { tabs, activeId: copy.id };
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

useTabsStore.subscribe((state) => {
  const payload: PersistedTabs = {
    activeId: state.activeId,
    tabs: state.tabs.map((t) => ({
      id: t.id,
      title: t.title,
      draft: t.draft,
      response: t.response,
      error: t.error,
    })),
  };
  saveJson(STORAGE_KEYS.tabs, payload);
});
