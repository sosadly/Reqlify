import { useCallback } from "react";

import { sendRequest } from "../../lib/httpClient";
import { useHistoryStore } from "../../store/historyStore";
import { useTabsStore } from "../../store/tabsStore";

/**
 * Centralizes the "send" side-effect: flips status, runs the request,
 * stores the response, and records the result in history.
 */
export function useSendRequest() {
  return useCallback(async (tabId: string) => {
    const state = useTabsStore.getState();
    const tab = state.tabs.find((t) => t.id === tabId);
    if (!tab || tab.draft.url.trim() === "") return;

    state.setStatus(tabId, "sending");

    try {
      const response = await sendRequest(tab.draft);
      state.setResponse(tabId, response);
      useHistoryStore.getState().record({
        method: tab.draft.method,
        url: tab.draft.url.trim(),
        status: response.status,
        timeMs: response.timeMs,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      state.setError(tabId, { message });
      useHistoryStore.getState().record({
        method: tab.draft.method,
        url: tab.draft.url.trim(),
        status: 0,
        timeMs: 0,
      });
    }
  }, []);
}
