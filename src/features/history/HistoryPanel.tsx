import { Eraser, Inbox, Trash2 } from "lucide-react";

import { IconButton } from "../../components/ui/IconButton";
import { METHOD_THEME } from "../../constants/http";
import { useHistoryStore } from "../../store/historyStore";
import { useTabsStore } from "../../store/tabsStore";
import { formatMs } from "../../utils/format";
import { tabTitleFromUrl } from "../../utils/request";

export function HistoryPanel() {
  const entries = useHistoryStore((s) => s.entries);
  const clear = useHistoryStore((s) => s.clear);
  const remove = useHistoryStore((s) => s.remove);

  const replay = (url: string, method: (typeof entries)[number]["method"]) => {
    // Replays load into the active tab if it's empty, otherwise spawn a new
    // tab — keeps the user from accidentally overwriting in-progress work.
    const tabsState = useTabsStore.getState();
    const active = tabsState.tabs.find((t) => t.id === tabsState.activeId);
    if (active && active.draft.url.trim() === "") {
      tabsState.updateDraft(active.id, { url, method });
      return;
    }
    tabsState.newTab();
    const newId = useTabsStore.getState().activeId;
    if (newId) tabsState.updateDraft(newId, { url, method });
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-3 py-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300">
            History
          </div>
          <div className="text-[10px] text-stone-500">
            {entries.length === 0
              ? "No requests yet"
              : `${entries.length} recent request${entries.length === 1 ? "" : "s"}`}
          </div>
        </div>
        {entries.length > 0 && (
          <IconButton label="Clear history" onClick={clear}>
            <Eraser size={15} />
          </IconButton>
        )}
      </header>

      <div className="border-t border-stone-800/80" />

      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-stone-500">
            <Inbox size={28} className="opacity-50" />
            <div className="text-xs">Sent requests will land here.</div>
          </div>
        ) : (
          <ul className="px-1.5 py-1.5">
            {entries.map((e) => {
              const theme = METHOD_THEME[e.method];
              return (
                <li
                  key={e.id}
                  onClick={() => replay(e.url, e.method)}
                  className="group mb-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-stone-900/80"
                >
                  <span
                    className={`min-w-11 rounded px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold ${theme.chip} border`}
                  >
                    {e.method}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-stone-200">
                      {tabTitleFromUrl(e.url)}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {e.status === 0
                        ? "failed"
                        : `${e.status} · ${formatMs(e.timeMs)}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      remove(e.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-300"
                    aria-label="Remove from history"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
