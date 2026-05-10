import { Clock, Eraser, Inbox, Trash2 } from "lucide-react";

import { IconButton } from "../../components/ui/IconButton";
import { METHOD_THEME } from "../../constants/http";
import { useHistoryStore } from "../../store/historyStore";
import { useTabsStore } from "../../store/tabsStore";
import { formatMs } from "../../utils/format";
import { tabTitleFromUrl } from "../../utils/request";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function HistoryPanel() {
  const entries = useHistoryStore((s) => s.entries);
  const clear = useHistoryStore((s) => s.clear);
  const remove = useHistoryStore((s) => s.remove);

  const replay = (url: string, method: (typeof entries)[number]["method"]) => {
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
      <header className="flex items-center justify-between px-4 py-3.5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
            History
          </div>
          <div className="mt-0.5 text-[11px] text-stone-500">
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
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center text-stone-500">
            <Inbox size={32} className="opacity-40" />
            <div className="text-sm text-stone-400">No requests yet</div>
            <div className="text-xs leading-relaxed">
              Sent requests appear here automatically. Click any entry to replay it.
            </div>
          </div>
        ) : (
          <ul className="px-2 py-2">
            {entries.map((e) => {
              const theme = METHOD_THEME[e.method];
              const statusOk = e.status >= 200 && e.status < 300;
              const statusErr = e.status >= 400 || e.status === 0;
              return (
                <li
                  key={e.id}
                  onClick={() => replay(e.url, e.method)}
                  className="group mb-1 flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-stone-900"
                >
                  <span
                    className={`mt-0.5 min-w-12 rounded px-1.5 py-0.5 text-center font-mono text-[10px] font-semibold ${theme.chip} border shrink-0`}
                  >
                    {e.method}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm text-stone-200">
                      {tabTitleFromUrl(e.url)}
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={
                          e.status === 0
                            ? "text-rose-400"
                            : statusOk
                              ? "text-emerald-400"
                              : statusErr
                                ? "text-amber-400"
                                : "text-stone-400"
                        }
                      >
                        {e.status === 0 ? "failed" : e.status}
                      </span>
                      {e.status !== 0 && (
                        <span className="text-stone-600">·</span>
                      )}
                      {e.status !== 0 && (
                        <span className="text-stone-500">{formatMs(e.timeMs)}</span>
                      )}
                      <span className="text-stone-600">·</span>
                      <span className="flex items-center gap-1 text-stone-600">
                        <Clock size={10} />
                        {formatTime(e.at)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      remove(e.id);
                    }}
                    className="mt-0.5 shrink-0 opacity-0 text-stone-600 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                    aria-label="Remove from history"
                  >
                    <Trash2 size={14} />
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
