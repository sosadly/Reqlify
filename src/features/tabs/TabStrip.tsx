import { Copy, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { IconButton } from "../../components/ui/IconButton";
import { METHOD_THEME } from "../../constants/http";
import { useTabsStore } from "../../store/tabsStore";

interface CtxMenu {
  tabId: string;
  x: number;
  y: number;
}

function TabContextMenu({
  menu,
  tabs,
  onClose,
}: {
  menu: CtxMenu;
  tabs: { id: string }[];
  onClose: () => void;
}) {
  const { closeTab, closeOthers, closeToRight, closeToLeft, closeAll, duplicateTab } =
    useTabsStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const idx = tabs.findIndex((t) => t.id === menu.tabId);
  const hasLeft = idx > 0;
  const hasRight = idx < tabs.length - 1;
  const hasOthers = tabs.length > 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  const act = (fn: () => void) => {
    fn();
    onClose();
  };

  const Item = ({
    label,
    icon: Icon,
    danger,
    disabled,
    onClick,
  }: {
    label: string;
    icon?: typeof X;
    danger?: boolean;
    disabled?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        danger
          ? "text-rose-300 hover:bg-rose-500/10"
          : "text-stone-200 hover:bg-stone-800"
      }`}
    >
      {Icon && <Icon size={14} className="shrink-0 text-stone-500" />}
      {label}
    </button>
  );

  const Sep = () => <div className="my-1 border-t border-stone-800" />;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: menu.y, left: menu.x, zIndex: 9999 }}
      className="min-w-52 overflow-hidden rounded-lg border border-stone-700 bg-stone-900 py-1 shadow-2xl"
    >
      <Item label="Close Tab" icon={X} onClick={() => act(() => closeTab(menu.tabId))} />
      <Item
        label="Duplicate Tab"
        icon={Copy}
        onClick={() => act(() => duplicateTab(menu.tabId))}
      />
      <Sep />
      <Item
        label="Close Others"
        disabled={!hasOthers}
        onClick={() => act(() => closeOthers(menu.tabId))}
      />
      <Item
        label="Close Tabs to the Right"
        disabled={!hasRight}
        onClick={() => act(() => closeToRight(menu.tabId))}
      />
      <Item
        label="Close Tabs to the Left"
        disabled={!hasLeft}
        onClick={() => act(() => closeToLeft(menu.tabId))}
      />
      <Sep />
      <Item
        label="Close All Tabs"
        icon={Trash2}
        danger
        onClick={() => act(() => closeAll())}
      />
    </div>,
    document.body,
  );
}

export function TabStrip() {
  const tabs = useTabsStore((s) => s.tabs);
  const activeId = useTabsStore((s) => s.activeId);
  const select = useTabsStore((s) => s.selectTab);
  const close = useTabsStore((s) => s.closeTab);
  const newTab = useTabsStore((s) => s.newTab);

  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);

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
              onContextMenu={(e) => {
                e.preventDefault();
                setCtxMenu({ tabId: t.id, x: e.clientX, y: e.clientY });
              }}
              className={`group flex h-8 max-w-60 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs transition-colors ${
                active
                  ? "border-stone-700 bg-stone-900 text-stone-100"
                  : "border-transparent text-stone-400 hover:bg-stone-900/60 hover:text-stone-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.accent}`} />
              <span className={`font-mono text-[10px] font-bold ${theme.text}`}>
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

      {ctxMenu && (
        <TabContextMenu
          menu={ctxMenu}
          tabs={tabs}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}
