import { Bookmark, Braces, Check, Copy, FileCode2, ListFilter, Lock, Terminal } from "lucide-react";
import { useState } from "react";

import { Section } from "../../components/ui/Section";
import { exportAsCurl } from "../../lib/curlExporter";
import { SaveToCollectionModal } from "../collections/SaveToCollectionModal";
import { useTabsStore } from "../../store/tabsStore";
import { useEnvStore } from "../../store/envStore";
import type { RequestDraft } from "../../types/http";
import type { RequestTab } from "../../types/tabs";
import { AuthEditor } from "./AuthEditor";
import { BodyEditor } from "./BodyEditor";
import { CurlImportModal } from "./CurlImportModal";
import { KeyValueEditor } from "./KeyValueEditor";
import { UrlBar } from "./UrlBar";
import { useSendRequest } from "./useSendRequest";

interface RequestPanelProps {
  tab: RequestTab;
}

function activeCount(entries: { key: string; enabled: boolean }[]): string {
  const n = entries.filter((e) => e.enabled && e.key.trim() !== "").length;
  return n === 0 ? "" : String(n);
}

export function RequestPanel({ tab }: RequestPanelProps) {
  const updateDraft = useTabsStore((s) => s.updateDraft);
  const send = useSendRequest();
  const { draft } = tab;

  const activeEnvName = useEnvStore((s) => {
    const active = s.sets.find((e) => e.id === s.activeId);
    return active?.name ?? null;
  });

  const [showImport, setShowImport] = useState(false);
  const [curlCopied, setCurlCopied] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const paramCount = activeCount(draft.params);
  const headerCount = activeCount(draft.headers);
  const hasAuth = draft.auth.mode !== "none";
  const hasUrl = draft.url.trim() !== "";

  const copyAsCurl = async () => {
    try {
      await navigator.clipboard.writeText(exportAsCurl(draft));
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleImport = (patch: Partial<RequestDraft>) => {
    updateDraft(tab.id, patch);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Toolbar row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowImport(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-800 bg-stone-900/40 px-2.5 py-1.5 text-xs text-stone-400 transition-colors hover:border-stone-700 hover:text-stone-200"
        >
          <Terminal size={13} />
          Import cURL
        </button>
        <button
          type="button"
          onClick={copyAsCurl}
          disabled={!hasUrl}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-800 bg-stone-900/40 px-2.5 py-1.5 text-xs text-stone-400 transition-colors hover:border-stone-700 hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {curlCopied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy as cURL
            </>
          )}
        </button>

        {/* Save to collection — visually distinct */}
        <button
          type="button"
          onClick={() => setShowSave(true)}
          disabled={!hasUrl}
          className="inline-flex items-center gap-1.5 rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-2.5 py-1.5 text-xs font-medium text-fuchsia-300 transition-colors hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Bookmark size={13} />
          Save
        </button>

        {/* Active env badge */}
        {activeEnvName && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-stone-800/80 px-2 py-1 text-[10px] text-stone-400">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            {activeEnvName}
          </span>
        )}
      </div>

      <UrlBar
        method={draft.method}
        url={draft.url}
        sending={tab.status === "sending"}
        onMethodChange={(method) => updateDraft(tab.id, { method })}
        onUrlChange={(url) => updateDraft(tab.id, { url })}
        onSend={() => send(tab.id)}
      />

      <div className="flex flex-col gap-3">
        <Section
          title="Auth"
          icon={<Lock size={13} />}
          accentClass="bg-fuchsia-500/70"
          defaultOpen={hasAuth}
          meta={
            hasAuth && (
              <span className="rounded bg-fuchsia-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">
                {draft.auth.mode === "bearer" ? "Bearer" : "Basic"}
              </span>
            )
          }
        >
          <AuthEditor
            auth={draft.auth}
            onChange={(auth) => updateDraft(tab.id, { auth })}
          />
        </Section>

        <Section
          title="Query Params"
          icon={<ListFilter size={13} />}
          accentClass="bg-emerald-400/70"
          meta={paramCount && <span className="text-emerald-300">{paramCount}</span>}
        >
          <KeyValueEditor
            entries={draft.params}
            onChange={(params) => updateDraft(tab.id, { params })}
            keyPlaceholder="Parameter"
          />
        </Section>

        <Section
          title="Headers"
          icon={<FileCode2 size={13} />}
          accentClass="bg-sky-400/70"
          meta={headerCount && <span className="text-sky-300">{headerCount}</span>}
        >
          <KeyValueEditor
            entries={draft.headers}
            onChange={(headers) => updateDraft(tab.id, { headers })}
            keyPlaceholder="Header"
          />
        </Section>

        <Section
          title="Body"
          icon={<Braces size={13} />}
          accentClass="bg-amber-400/70"
          defaultOpen={draft.bodyMode !== "none"}
          meta={
            draft.bodyMode !== "none" && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                {draft.bodyMode}
              </span>
            )
          }
        >
          <BodyEditor
            mode={draft.bodyMode}
            value={draft.body}
            onModeChange={(bodyMode) => updateDraft(tab.id, { bodyMode })}
            onValueChange={(body) => updateDraft(tab.id, { body })}
          />
        </Section>
      </div>

      {showImport && (
        <CurlImportModal
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}

      {showSave && (
        <SaveToCollectionModal
          draft={draft}
          initialName={tab.title !== "New Request" ? tab.title : undefined}
          onClose={() => setShowSave(false)}
        />
      )}
    </div>
  );
}
