import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Layers,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";

import { IconButton } from "../../components/ui/IconButton";
import { METHOD_THEME } from "../../constants/http";
import { useCollectionsStore } from "../../store/collectionsStore";
import { useTabsStore } from "../../store/tabsStore";
import type { RequestDraft } from "../../types/http";
import { tabTitleFromUrl } from "../../utils/request";
import { SaveToCollectionModal } from "./SaveToCollectionModal";

export function CollectionsPanel() {
  const { collections, createCollection, deleteCollection, renameCollection, deleteRequest } =
    useCollectionsStore();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const activeDraft = useTabsStore((s) => {
    const tab = s.tabs.find((t) => t.id === s.activeId);
    return tab?.draft ?? null;
  });
  const hasActiveUrl = (activeDraft?.url ?? "").trim() !== "";

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openRequest = (draft: RequestDraft) => {
    const tabsState = useTabsStore.getState();
    const active = tabsState.tabs.find((t) => t.id === tabsState.activeId);
    if (active && active.draft.url.trim() === "") {
      tabsState.updateDraft(active.id, draft);
      return;
    }
    tabsState.newTab();
    const newId = useTabsStore.getState().activeId;
    if (newId) tabsState.updateDraft(newId, draft);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createCollection(newName.trim());
    setExpanded((prev) => new Set([...prev, id]));
    setNewName("");
    setIsCreating(false);
  };

  const handleRename = () => {
    if (renamingId && renameValue.trim()) renameCollection(renamingId, renameValue.trim());
    setRenamingId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3.5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
            Collections
          </div>
          <div className="mt-0.5 text-[11px] text-stone-500">
            {collections.length === 0
              ? "No collections"
              : `${collections.length} collection${collections.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasActiveUrl && (
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              title="Save active request to a collection"
              className="flex items-center gap-1.5 rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-1 text-[11px] font-medium text-fuchsia-300 transition-colors hover:bg-fuchsia-500/20"
            >
              <Bookmark size={12} />
              Save
            </button>
          )}
          <IconButton label="New collection" onClick={() => setIsCreating(true)}>
            <Plus size={15} />
          </IconButton>
        </div>
      </header>

      <div className="border-t border-stone-800/80" />

      {isCreating && (
        <div className="flex items-center gap-2 border-b border-stone-800/60 bg-stone-900/40 px-4 py-2.5">
          <Layers size={14} className="shrink-0 text-fuchsia-400" />
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewName("");
              }
            }}
            placeholder="Collection name…"
            className="min-w-0 flex-1 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-600"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setNewName("");
            }}
            className="text-stone-500 hover:text-stone-300"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {collections.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900">
              <FolderOpen size={26} className="text-stone-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-300">No collections yet</div>
              <div className="mt-1.5 text-xs leading-relaxed text-stone-500">
                Collections let you save and organise requests by project or API.
              </div>
            </div>
            <div className="w-full rounded-lg border border-stone-800 bg-stone-900/40 p-3 text-left">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                How to save a request
              </div>
              <ol className="space-y-2">
                {[
                  "Build a request in any tab",
                  'Click the "Save" button in the request toolbar',
                  "Pick or create a collection, then confirm",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-stone-400">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-fuchsia-500/20 text-[9px] font-bold text-fuchsia-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-stone-700 py-1.5 text-xs text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-200"
              >
                <Plus size={12} />
                New collection
              </button>
            </div>
          </div>
        ) : (
          <ul className="px-2 py-2">
            {collections.map((col) => {
              const isOpen = expanded.has(col.id);
              return (
                <li key={col.id} className="mb-0.5">
                  <div className="group flex items-center gap-1.5 rounded-lg px-2 py-2 transition-colors hover:bg-stone-900">
                    <button
                      type="button"
                      onClick={() => toggle(col.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <span className="shrink-0 text-stone-500">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                      <Layers size={14} className="shrink-0 text-fuchsia-400/70" />
                      {renamingId === col.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename();
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onBlur={handleRename}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-0 flex-1 rounded bg-stone-800 px-1.5 py-0.5 text-sm text-stone-100 outline-none"
                        />
                      ) : (
                        <span className="truncate text-sm font-medium text-stone-200">
                          {col.name}
                        </span>
                      )}
                    </button>

                    <span className="text-[11px] text-stone-600 group-hover:hidden">
                      {col.requests.length > 0 ? col.requests.length : ""}
                    </span>

                    <div className="hidden items-center gap-1 group-hover:flex">
                      {renamingId !== col.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(col.id);
                            setRenameValue(col.name);
                          }}
                          className="text-stone-500 hover:text-stone-300"
                          aria-label="Rename"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCollection(col.id)}
                        className="text-stone-500 hover:text-rose-400"
                        aria-label="Delete collection"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <ul className="ml-6 border-l border-stone-800/60 pl-2 pb-1">
                      {col.requests.length === 0 ? (
                        <li className="py-2 text-xs text-stone-600">
                          No requests — use the Save button to add one.
                        </li>
                      ) : (
                        col.requests.map((req) => {
                          const theme = METHOD_THEME[req.draft.method];
                          return (
                            <li
                              key={req.id}
                              onClick={() => openRequest(req.draft)}
                              className="group mb-0.5 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-stone-900"
                            >
                              <span
                                className={`shrink-0 font-mono text-[10px] font-bold ${theme.text}`}
                              >
                                {req.draft.method}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm text-stone-300">
                                  {req.name}
                                </div>
                                <div className="truncate text-[10px] text-stone-600">
                                  {tabTitleFromUrl(req.draft.url)}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  type="button"
                                  title="Open in tab"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRequest(req.draft);
                                  }}
                                  className="text-stone-500 hover:text-fuchsia-300"
                                  aria-label="Open request"
                                >
                                  <ArrowRight size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteRequest(col.id, req.id);
                                  }}
                                  className="text-stone-500 hover:text-rose-400"
                                  aria-label="Delete request"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showSaveModal && activeDraft && (
        <SaveToCollectionModal
          draft={activeDraft}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
