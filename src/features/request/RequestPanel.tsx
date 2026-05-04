import { Braces, FileCode2, ListFilter } from "lucide-react";

import { Section } from "../../components/ui/Section";
import { useTabsStore } from "../../store/tabsStore";
import type { RequestTab } from "../../types/tabs";
import { useSendRequest } from "./useSendRequest";
import { BodyEditor } from "./BodyEditor";
import { KeyValueEditor } from "./KeyValueEditor";
import { UrlBar } from "./UrlBar";

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

  const paramCount = activeCount(draft.params);
  const headerCount = activeCount(draft.headers);

  return (
    <div className="flex flex-col gap-4 p-4">
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
          meta={
            draft.bodyMode !== "none" && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                {draft.bodyMode}
              </span>
            )
          }
          defaultOpen={draft.bodyMode !== "none"}
        >
          <BodyEditor
            mode={draft.bodyMode}
            value={draft.body}
            onModeChange={(bodyMode) => updateDraft(tab.id, { bodyMode })}
            onValueChange={(body) => updateDraft(tab.id, { body })}
          />
        </Section>
      </div>
    </div>
  );
}
