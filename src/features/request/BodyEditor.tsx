import { Wand2 } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { BODY_MODES } from "../../constants/http";
import type { BodyMode } from "../../types/http";
import { tryFormatJson } from "../../utils/format";

interface BodyEditorProps {
  mode: BodyMode;
  value: string;
  onModeChange: (mode: BodyMode) => void;
  onValueChange: (value: string) => void;
}

export function BodyEditor({
  mode,
  value,
  onModeChange,
  onValueChange,
}: BodyEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <div className="flex rounded-md border border-stone-800 bg-stone-950/60 p-0.5">
          {BODY_MODES.map((m) => {
            const active = m.value === mode;
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => onModeChange(m.value)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-stone-800 text-fuchsia-300"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
        {mode === "json" && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon={<Wand2 size={13} />}
            onClick={() => onValueChange(tryFormatJson(value))}
            disabled={value.trim() === ""}
            className="ml-auto"
          >
            Beautify
          </Button>
        )}
      </div>
      {mode === "none" ? (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-stone-800 text-xs text-stone-500">
          This request has no body.
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={
            mode === "json"
              ? '{\n  "name": "Reqlify"\n}'
              : "Plain text body…"
          }
          spellCheck={false}
          rows={8}
          className="resize-y rounded-md border border-stone-800 bg-stone-950/60 p-3 font-mono text-xs leading-relaxed text-stone-100 outline-none focus:border-fuchsia-500/50"
        />
      )}
    </div>
  );
}
