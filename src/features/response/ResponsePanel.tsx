import { AlertOctagon, FileText, ListTree, Loader2, Send } from "lucide-react";
import { useState } from "react";

import type { RequestTab } from "../../types/tabs";
import { ResponseBody } from "./ResponseBody";
import { ResponseHeaders } from "./ResponseHeaders";
import { StatTiles } from "./StatTiles";

type View = "body" | "headers";

interface ResponsePanelProps {
  tab: RequestTab;
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-stone-500">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-fuchsia-400">
        <Send size={22} />
      </div>
      <div className="text-sm font-medium text-stone-300">Ready when you are</div>
      <div className="max-w-xs text-xs">
        Hit <kbd className="mx-0.5 rounded bg-stone-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-300">Send</kbd>
        {" "}or press
        <kbd className="mx-0.5 rounded bg-stone-800 px-1.5 py-0.5 font-mono text-[10px] text-stone-300">Ctrl + Enter</kbd>
        to fire the request. The response will appear here.
      </div>
    </div>
  );
}

function SendingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-stone-400">
      <Loader2 size={22} className="animate-spin text-fuchsia-400" />
      <div className="text-sm">In flight…</div>
      <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-300">
        <AlertOctagon size={22} />
      </div>
      <div className="text-sm font-semibold text-rose-300">Request failed</div>
      <div className="max-w-md wrap-break-word font-mono text-xs text-stone-400">
        {message}
      </div>
    </div>
  );
}

export function ResponsePanel({ tab }: ResponsePanelProps) {
  const [view, setView] = useState<View>("body");

  if (tab.status === "sending") return <SendingState />;
  if (tab.error) return <ErrorState message={tab.error.message} />;
  if (!tab.response) return <EmptyState />;

  const { response } = tab;
  const tabs: { value: View; label: string; icon: typeof FileText; meta?: number }[] = [
    { value: "body", label: "Body", icon: FileText },
    { value: "headers", label: "Headers", icon: ListTree, meta: response.headers.length },
  ];

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <StatTiles response={response} />

      <div className="flex items-center gap-1 rounded-md border border-stone-800 bg-stone-950/60 p-0.5 self-start">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.value === view;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setView(t.value)}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-stone-800 text-fuchsia-300"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Icon size={13} />
              {t.label}
              {t.meta !== undefined && t.meta > 0 && (
                <span className="rounded bg-stone-700/60 px-1 text-[10px] text-stone-300">
                  {t.meta}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1">
        {view === "body" ? (
          <ResponseBody response={response} />
        ) : (
          <ResponseHeaders headers={response.headers} />
        )}
      </div>
    </div>
  );
}
