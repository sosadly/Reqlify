import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/ui/Button";
import { parseCurl } from "../../lib/curlParser";
import type { RequestDraft } from "../../types/http";

interface CurlImportModalProps {
  onImport: (draft: Partial<RequestDraft>) => void;
  onClose: () => void;
}

const EXAMPLE = `curl -X POST 'https://api.example.com/v1/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer my-token' \\
  --data-raw '{"name": "Alice"}'`;

export function CurlImportModal({ onImport, onClose }: CurlImportModalProps) {
  const [value, setValue] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea immediately so the user can paste without clicking.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on Escape.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleImport = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const { draft, warnings: w } = parseCurl(trimmed);
    setWarnings(w);
    onImport(draft);
    if (w.length === 0) onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-[560px] flex-col gap-4 rounded-xl border border-stone-700 bg-stone-950 p-5 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-stone-100">Import cURL</div>
            <div className="text-xs text-stone-500">
              Paste a cURL command copied from your browser or terminal.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setWarnings([]); }}
          placeholder={EXAMPLE}
          rows={8}
          spellCheck={false}
          className="resize-none rounded-lg border border-stone-800 bg-stone-900/60 p-3 font-mono text-xs leading-relaxed text-stone-100 placeholder:text-stone-700 outline-none focus:border-fuchsia-500/50"
        />

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="flex flex-col gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <AlertTriangle size={13} />
              Imported with warnings
            </div>
            {warnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-200/70">
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={value.trim() === ""}
            onClick={handleImport}
          >
            Import
          </Button>
        </div>
      </div>
    </div>
  );
}
