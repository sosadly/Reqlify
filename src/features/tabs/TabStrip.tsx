import { Plus, X } from "lucide-react";

import { IconButton } from "../../components/ui/IconButton";
import { METHOD_THEME } from "../../constants/http";
import { useTabsStore } from "../../store/tabsStore";

export function TabStrip() {
  const tabs = useTabsStore((s) => s.tabs);
  const activeId = useTabsStore((s) => s.activeId);
  const select = useTabsStore((s) => s.selectTab);
  const close = useTabsStore((s) => s.closeTab);
  const newTab = useTabsStore((s) => s.newTab);

  return (
    <div className="flex items-center gap-1.5 border-b border-stone-800/80 bg-stone-950 px-2 py-1.5">
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.id === activeId;
          const theme = METHOD_THEME[t.draft.method];
          return (
            <div
              key={t.id}
              onClick={() => select(t.id)}
              className={`group flex h-8 max-w-[240px] cursor-pointer items-center gap-2 rounded-full border px-3 text-xs transition-colors ${
                active
                  ? "border-stone-700 bg-stone-900 text-stone-100"
                  : "border-transparent text-stone-400 hover:bg-stone-900/60 hover:text-stone-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.accent}`}
              />
              <span
                className={`font-mono text-[10px] font-bold ${theme.text}`}
              >
                {t.draft.method}
              </span>
              <span className="truncate">{t.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  close(t.id);
                }}
                className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded text-stone-500 hover:bg-stone-700 hover:text-stone-100"
                aria-label="Close tab"
              >
                <X size={11} />
              </button>
            </div>
          );
        })}
      </div>
      <IconButton label="New request" onClick={newTab}>
        <Plus size={16} />
      </IconButton>
    </div>
  );
}
