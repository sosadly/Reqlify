import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HTTP_METHODS, METHOD_THEME } from "../../constants/http";
import type { HttpMethod } from "../../types/http";

interface MethodPickerProps {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

/**
 * Custom method chip + dropdown. We don't use a native <select> because
 * we want the closed state to look like a colored pill (themed per method),
 * not a system control.
 */
export function MethodPicker({ value, onChange }: MethodPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const theme = METHOD_THEME[value];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 min-w-27.5 items-center justify-between gap-2 rounded-l-lg border px-3 text-sm font-mono font-bold transition-colors ${theme.chip}`}
      >
        <span>{value}</span>
        <ChevronDown size={14} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-md border border-stone-800 bg-stone-900 shadow-lg shadow-black/40">
          {HTTP_METHODS.map((m) => {
            const t = METHOD_THEME[m];
            const active = m === value;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs font-bold ${t.text} ${
                  active ? "bg-stone-800/80" : "hover:bg-stone-800/60"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${t.accent}`} />
                {m}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
