import { Check, ChevronDown, FlaskConical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { IconButton } from "../../components/ui/IconButton";
import { useEnvStore } from "../../store/envStore";
import type { KeyValueEntry } from "../../types/http";
import { makeKvEntry } from "../../utils/request";
import { KeyValueEditor } from "../request/KeyValueEditor";

interface EnvDropdownProps {
  sets: { id: string; name: string }[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

function EnvDropdown({ sets, activeId, onSelect }: EnvDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [listStyle, setListStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setListStyle({ position: "fixed", top: r.bottom + 4, left: r.left, width: r.width, zIndex: 9999 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const active = sets.find((s) => s.id === activeId);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-stone-950/60 px-3 text-sm transition-colors hover:border-stone-600 focus:outline-none ${open ? "border-fuchsia-500/60 text-stone-100" : "border-stone-700 text-stone-200"}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-fuchsia-400" : "bg-stone-700"}`} />
          <span className="truncate">{active ? active.name : "None (no substitution)"}</span>
        </div>
        <ChevronDown size={14} className={`shrink-0 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <div ref={listRef} style={listStyle} className="overflow-hidden rounded-lg border border-stone-700 bg-stone-900 py-1 shadow-2xl">
          {/* None option */}
          <button
            type="button"
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${!activeId ? "bg-fuchsia-500/10" : "hover:bg-stone-800"}`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-stone-700" />
            <span className={!activeId ? "text-fuchsia-300" : "text-stone-400"}>None (no substitution)</span>
            {!activeId && <Check size={13} className="ml-auto shrink-0 text-fuchsia-400" />}
          </button>

          {sets.length > 0 && <div className="my-1 border-t border-stone-800" />}

          {sets.map((s) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => { onSelect(s.id); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-fuchsia-500/10" : "hover:bg-stone-800"}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-fuchsia-400" : "bg-stone-600"}`} />
                <span className={isActive ? "text-fuchsia-300" : "text-stone-200"}>{s.name}</span>
                {isActive && <Check size={13} className="ml-auto shrink-0 text-fuchsia-400" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

export function EnvPanel() {
  const { sets, activeId, createSet, deleteSet, renameSet, selectSet, updateVariables } =
    useEnvStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const activeSet = sets.find((s) => s.id === activeId) ?? null;

  const handleCreate = () => {
    if (!newName.trim()) return;
    createSet(newName.trim());
    setNewName("");
    setIsCreating(false);
  };

  const handleRename = () => {
    if (renamingId && renameValue.trim()) renameSet(renamingId, renameValue.trim());
    setRenamingId(null);
  };

  const handleVariablesChange = (variables: KeyValueEntry[]) => {
    if (activeSet) updateVariables(activeSet.id, variables);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 py-3.5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-300">
            Environments
          </div>
          <div className="mt-0.5 text-[11px] text-stone-500">
            {sets.length === 0
              ? "No environments"
              : activeSet
                ? `Active: ${activeSet.name}`
                : "No environment active"}
          </div>
        </div>
        <IconButton label="New environment" onClick={() => setIsCreating(true)}>
          <Plus size={15} />
        </IconButton>
      </header>

      <div className="border-t border-stone-800/80" />

      {isCreating && (
        <div className="flex items-center gap-2 border-b border-stone-800/60 bg-stone-900/40 px-4 py-2.5">
          <FlaskConical size={14} className="shrink-0 text-fuchsia-400" />
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
            placeholder="Environment name…"
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
        {sets.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900">
              <FlaskConical size={26} className="text-stone-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-stone-300">No environments yet</div>
              <div className="mt-1.5 text-xs leading-relaxed text-stone-500">
                Environments let you switch between dev, staging, and prod without editing
                your requests.
              </div>
            </div>
            <div className="w-full rounded-lg border border-stone-800 bg-stone-900/40 p-3 text-left">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                How it works
              </div>
              <p className="text-xs leading-relaxed text-stone-400">
                Define variables like{" "}
                <code className="rounded bg-stone-800 px-1 font-mono text-fuchsia-400">
                  BASE_URL
                </code>{" "}
                or{" "}
                <code className="rounded bg-stone-800 px-1 font-mono text-fuchsia-400">
                  TOKEN
                </code>
                , then use{" "}
                <code className="rounded bg-stone-800 px-1 font-mono text-fuchsia-400">
                  {"{{BASE_URL}}"}
                </code>{" "}
                anywhere in your requests.
              </p>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-stone-700 py-1.5 text-xs text-stone-400 transition-colors hover:border-stone-600 hover:text-stone-200"
              >
                <Plus size={12} />
                New environment
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Env list + selector */}
            <div className="border-b border-stone-800/60 px-4 py-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Active environment
              </div>
              <EnvDropdown sets={sets} activeId={activeId} onSelect={selectSet} />

              {!activeSet && sets.length > 0 && (
                <p className="mt-2 text-[11px] text-amber-500/80">
                  No active environment — variables like{" "}
                  <code className="font-mono">{"{{TOKEN}}"}</code> won't be substituted.
                </p>
              )}
            </div>

            {/* All envs */}
            <ul className="px-2 py-2">
              {sets.map((s) => {
                const isActive = s.id === activeId;
                const varCount = s.variables.filter(
                  (v) => v.enabled && v.key.trim() !== "",
                ).length;
                return (
                  <li
                    key={s.id}
                    className={`group mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors ${
                      isActive ? "bg-fuchsia-500/10" : "hover:bg-stone-900"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectSet(isActive ? null : s.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <div
                        className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-fuchsia-400" : "bg-stone-700"}`}
                      />
                      {renamingId === s.id ? (
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
                        <div className="min-w-0">
                          <div
                            className={`truncate text-sm font-medium ${isActive ? "text-fuchsia-300" : "text-stone-200"}`}
                          >
                            {s.name}
                          </div>
                          <div className="text-[11px] text-stone-600">
                            {varCount} variable{varCount !== 1 ? "s" : ""}
                          </div>
                        </div>
                      )}
                    </button>

                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {renamingId !== s.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(s.id);
                            setRenameValue(s.name);
                          }}
                          className="text-stone-500 hover:text-stone-300"
                          aria-label="Rename"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteSet(s.id)}
                        className="text-stone-500 hover:text-rose-400"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Variable editor for active set */}
            {activeSet && (
              <div className="border-t border-stone-800/60 px-4 py-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-fuchsia-400" />
                  <div className="text-xs font-semibold text-stone-300">
                    {activeSet.name} — Variables
                  </div>
                </div>
                <div className="mb-2 text-[11px] text-stone-500">
                  Use{" "}
                  <code className="rounded bg-stone-800 px-1 font-mono text-fuchsia-400">
                    {"{{KEY}}"}
                  </code>{" "}
                  in URL, headers, params, body, or auth.
                </div>
                <KeyValueEditor
                  entries={
                    activeSet.variables.length > 0
                      ? activeSet.variables
                      : [makeKvEntry()]
                  }
                  onChange={handleVariablesChange}
                  keyPlaceholder="Variable"
                  valuePlaceholder="Value"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
