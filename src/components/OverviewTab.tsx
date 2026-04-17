import { useState } from "react";
import Card from "./Card";
import OverviewControlPanel from "./overview/OverviewControlPanel";
import OverviewGrid from "./overview/OverviewGrid";
import OverviewLogsPanel from "./overview/OverviewLogsPanel";
import OverviewObsPanel from "./overview/OverviewObsPanel";
import OverviewSessionTabs from "./overview/OverviewSessionTabs";
import type { OverviewTabProps } from "./overview/overview-tab.type";

type SessionPanel = "controls" | "obs" | "logs";

export default function OverviewTab(props: OverviewTabProps) {
  const [activePanel, setActivePanel] = useState<SessionPanel>("controls");

  return (
    <div className="space-y-5">
      <Card darkMode={props.darkMode}>
        <div className="space-y-4">
          <OverviewSessionTabs
            darkMode={props.darkMode}
            managementPlatform={props.managementPlatform}
            activePanel={activePanel}
            onChangePanel={setActivePanel}
            sessionState={props.sessionState}
            realtimeMetrics={props.realtimeMetrics}
          />

          {activePanel === "controls" ? <OverviewControlPanel {...props} /> : null}
          {activePanel === "obs" ? <OverviewObsPanel {...props} /> : null}
          {activePanel === "logs" ? <OverviewLogsPanel darkMode={props.darkMode} logs={props.logs} /> : null}
        </div>
      </Card>

      <OverviewGrid
        darkMode={props.darkMode}
        managementPlatform={props.managementPlatform}
        coverPreview={props.coverPreview}
        tiktokPlayableLiveUrl={props.tiktokPlayableLiveUrl}
        tiktokLiveStudioStatus={props.tiktokLiveStudioStatus}
        selectedProducts={props.selectedProducts}
        visibleProductId={props.visibleProductId}
        comments={props.comments}
      />
    </div>
  );
}
