import { Trash2 } from "lucide-react";

import { Input } from "../../components/ui/Input";
import type { KeyValueEntry } from "../../types/http";
import { makeKvEntry } from "../../utils/request";

interface KeyValueEditorProps {
  entries: KeyValueEntry[];
  onChange: (entries: KeyValueEntry[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

/**
 * Auto-grows: editing the last (always-empty) row appends a new blank row,
 * so the user never has to click "add" — feels more like editing a
 * spreadsheet than a form.
 */
export function KeyValueEditor({
  entries,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  const update = (id: string, patch: Partial<KeyValueEntry>) => {
    const next = entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    const last = next[next.length - 1];
    if (last && (last.key !== "" || last.value !== "")) {
      next.push(makeKvEntry());
    }
    onChange(next);
  };

  const remove = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    onChange(next.length === 0 ? [makeKvEntry()] : next);
  };

  return (
    <div className="overflow-hidden rounded-md border border-stone-800/80">
      <div className="grid grid-cols-[28px_1fr_1fr_28px] items-center bg-stone-950/60 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
        <div />
        <div className="px-2">{keyPlaceholder}</div>
        <div className="px-2">{valuePlaceholder}</div>
        <div />
      </div>
      <div>
        {entries.map((e, idx) => {
          const isLast = idx === entries.length - 1;
          return (
            <div
              key={e.id}
              className="grid grid-cols-[28px_1fr_1fr_28px] items-center border-t border-stone-800/60"
            >
              <label className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={e.enabled}
                  onChange={(ev) => update(e.id, { enabled: ev.target.checked })}
                  className="h-3 w-3 cursor-pointer accent-fuchsia-500"
                />
              </label>
              <Input
                invisible
                value={e.key}
                placeholder={keyPlaceholder}
                onChange={(ev) => update(e.id, { key: ev.target.value })}
              />
              <Input
                invisible
                value={e.value}
                placeholder={valuePlaceholder}
                onChange={(ev) => update(e.id, { value: ev.target.value })}
              />
              {isLast ? (
                <span />
              ) : (
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="flex h-7 w-7 items-center justify-center text-stone-500 hover:text-rose-300"
                  aria-label="Remove row"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
