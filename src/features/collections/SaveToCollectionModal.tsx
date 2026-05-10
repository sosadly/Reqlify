import { Bookmark, Check, ChevronDown, Layers, Plus, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useCollectionsStore } from "../../store/collectionsStore";
import type { RequestDraft } from "../../types/http";
import { tabTitleFromUrl } from "../../utils/request";

const NEW_COLLECTION_ID = "__new__";

interface CollectionDropdownProps {
  collections: { id: string; name: string; requests: { length: number } }[];
  value: string;
  onChange: (id: string) => void;
}

function CollectionDropdown({ collections, value, onChange }: CollectionDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [listStyle, setListStyle] = useState<React.CSSProperties>({});

  // Position the portal list directly below the trigger button
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setListStyle({
      position: "fixed",
      top: r.bottom + 4,
      left: r.left,
      width: r.width,
      zIndex: 9999,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current?.contains(target) ||
        listRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const allOptions = [
    ...collections.map((c) => ({ id: c.id, label: c.name, sub: `${c.requests.length} requests` })),
    { id: NEW_COLLECTION_ID, label: "New collection…", sub: "" },
  ];

  const selected = allOptions.find((o) => o.id === value);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-stone-950/60 px-3 text-sm text-stone-200 transition-colors hover:border-stone-600 focus:outline-none ${open ? "border-fuchsia-500/60" : "border-stone-700"}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {value === NEW_COLLECTION_ID ? (
            <Plus size={14} className="shrink-0 text-fuchsia-400" />
          ) : (
            <Layers size={14} className="shrink-0 text-fuchsia-400/70" />
          )}
          <span className="truncate">{selected?.label ?? "Select…"}</span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={listRef}
            style={listStyle}
            className="overflow-hidden rounded-lg border border-stone-700 bg-stone-900 py-1 shadow-2xl"
          >
            {allOptions.map((opt) => {
            const isActive = opt.id === value;
            const isNew = opt.id === NEW_COLLECTION_ID;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  isActive ? "bg-fuchsia-500/10" : "hover:bg-stone-800"
                }`}
              >
                {isNew ? (
                  <Plus size={14} className="shrink-0 text-fuchsia-400" />
                ) : (
                  <Layers size={14} className="shrink-0 text-fuchsia-400/60" />
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm ${isNew ? "text-fuchsia-300" : "text-stone-200"}`}
                  >
                    {opt.label}
                  </div>
                  {opt.sub && (
                    <div className="text-[11px] text-stone-600">{opt.sub}</div>
                  )}
                </div>
                {isActive && <Check size={13} className="shrink-0 text-fuchsia-400" />}
              </button>
            );
          })}
          </div>,
          document.body,
        )}
    </>
  );
}

interface SaveToCollectionModalProps {
  draft: RequestDraft;
  initialName?: string;
  onClose: () => void;
}

export function SaveToCollectionModal({
  draft,
  initialName,
  onClose,
}: SaveToCollectionModalProps) {
  const { collections, createCollection, saveRequest } = useCollectionsStore();
  const [name, setName] = useState(initialName ?? tabTitleFromUrl(draft.url));
  const [collectionId, setCollectionId] = useState<string>(
    collections[0]?.id ?? NEW_COLLECTION_ID,
  );
  const [newColName, setNewColName] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSave = () => {
    let colId = collectionId;
    if (colId === NEW_COLLECTION_ID) {
      if (!newColName.trim()) return;
      colId = createCollection(newColName.trim());
    }
    saveRequest(colId, name.trim() || tabTitleFromUrl(draft.url), draft);
    onClose();
  };

  const canSave =
    name.trim() !== "" &&
    (collectionId !== NEW_COLLECTION_ID || newColName.trim() !== "");

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-96 overflow-hidden rounded-xl border border-stone-700 bg-stone-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/15">
              <Bookmark size={16} className="text-fuchsia-400" />
            </div>
            <span className="text-sm font-semibold text-stone-100">
              Save to Collection
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-800 hover:text-stone-300"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-400">
              Request name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Get all users"
              className="h-9 w-full rounded-lg border border-stone-700 bg-stone-950/60 px-3 text-sm text-stone-100 outline-none transition-colors focus:border-fuchsia-500/60 placeholder:text-stone-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-stone-400">
              Collection
            </label>
            <CollectionDropdown
              collections={collections}
              value={collectionId}
              onChange={setCollectionId}
            />
          </div>

          {collectionId === NEW_COLLECTION_ID && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-stone-400">
                New collection name
              </label>
              <input
                autoFocus
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. Auth API"
                className="h-9 w-full rounded-lg border border-stone-700 bg-stone-950/60 px-3 text-sm text-stone-100 outline-none transition-colors focus:border-fuchsia-500/60 placeholder:text-stone-600"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-stone-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-lg px-3.5 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-fuchsia-500 px-4 text-sm font-medium text-stone-950 transition-colors hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
