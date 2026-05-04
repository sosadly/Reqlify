import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";

import type { HttpResponse } from "../../types/http";
import { isJsonContentType, tryFormatJson } from "../../utils/format";

interface ResponseBodyProps {
  response: HttpResponse;
}

export function ResponseBody({ response }: ResponseBodyProps) {
  const [pretty, setPretty] = useState(true);
  const [copied, setCopied] = useState(false);
  const isJson = isJsonContentType(response.headers);

  const text = useMemo(() => {
    if (pretty && isJson) return tryFormatJson(response.body);
    return response.body;
  }, [pretty, isJson, response.body]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // The "Copied" confirmation flips back automatically — no need for
      // the user to dismiss it.
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex rounded-md border border-stone-800 bg-stone-950/60 p-0.5">
          <button
            type="button"
            onClick={() => setPretty(true)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              pretty ? "bg-stone-800 text-fuchsia-300" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Pretty
          </button>
          <button
            type="button"
            onClick={() => setPretty(false)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              !pretty ? "bg-stone-800 text-fuchsia-300" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Raw
          </button>
        </div>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs text-stone-400 hover:text-stone-100"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="flex-1 overflow-auto rounded-lg border border-stone-800/80 bg-stone-950/60 p-3 font-mono text-xs leading-relaxed text-stone-100">
        {text || <span className="text-stone-500">(empty response body)</span>}
      </pre>
    </div>
  );
}
