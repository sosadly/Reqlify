import { useState } from "react";

import { ActivityRail, type ActivityKey } from "./components/layout/ActivityRail";
import { SidePane } from "./components/layout/SidePane";
import { Workbench } from "./components/layout/Workbench";
import { AboutPanel } from "./features/about/AboutPanel";
import { CollectionsPanel } from "./features/collections/CollectionsPanel";
import { EnvPanel } from "./features/env/EnvPanel";
import { HistoryPanel } from "./features/history/HistoryPanel";
import { RequestPanel } from "./features/request/RequestPanel";
import { ResponsePanel } from "./features/response/ResponsePanel";
import { TabStrip } from "./features/tabs/TabStrip";
import { useTabsStore } from "./store/tabsStore";

export default function App() {
  const tabs = useTabsStore((s) => s.tabs);
  const activeId = useTabsStore((s) => s.activeId);
  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  // The activity rail toggles which side pane is shown — null means the
  // pane is collapsed entirely so the workbench gets the full width.
  const [activity, setActivity] = useState<ActivityKey | null>("history");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-950 text-stone-100">
      <ActivityRail active={activity} onSelect={setActivity} />

      {activity && (
        <SidePane>
          {activity === "history" && <HistoryPanel />}
          {activity === "collections" && <CollectionsPanel />}
          {activity === "env" && <EnvPanel />}
          {activity === "about" && <AboutPanel />}
        </SidePane>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <TabStrip />
        <div className="min-h-0 flex-1">
          {activeTab && (
            <Workbench
              request={<RequestPanel tab={activeTab} />}
              response={<ResponsePanel tab={activeTab} />}
            />
          )}
        </div>
      </main>
    </div>
  );
}
