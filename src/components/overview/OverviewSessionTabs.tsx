import { Activity, ListChecks, Settings2 } from "lucide-react";
import type { ManagementPlatform, RealtimeMetrics, SessionState } from "../../common/type/app.type";

type SessionPanel = "controls" | "obs" | "logs";

type OverviewSessionTabsProps = {
  darkMode: boolean;
  managementPlatform: ManagementPlatform;
  activePanel: SessionPanel;
  onChangePanel: (panel: SessionPanel) => void;
  sessionState: SessionState;
  realtimeMetrics: RealtimeMetrics;
};

const tabs: { key: SessionPanel; label: string; icon: typeof Activity }[] = [
  { key: "controls", label: "Session", icon: Settings2 },
  { key: "obs", label: "OBS", icon: Activity },
  { key: "logs", label: "Logs", icon: ListChecks },
];

export default function OverviewSessionTabs({
  darkMode,
  managementPlatform,
  activePanel,
  onChangePanel,
  sessionState,
  realtimeMetrics,
}: OverviewSessionTabsProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
          {managementPlatform} Livestream Console
        </h2>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1 ${darkMode ? "bg-cyan-500/15 text-cyan-200" : "bg-cyan-50 text-cyan-700"}`}>
            {sessionState.toUpperCase()}
          </span>
          <span className={`rounded-full px-3 py-1 ${darkMode ? "bg-fuchsia-500/15 text-fuchsia-200" : "bg-fuchsia-50 text-fuchsia-700"}`}>
            {realtimeMetrics.viewers.toLocaleString()} viewers
          </span>
        </div>
      </div>

      <div className={`flex flex-wrap gap-2 rounded-2xl border p-2 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activePanel === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChangePanel(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white"
                  : darkMode
                    ? "text-white/80 hover:bg-white/10"
                    : "text-slate-700 hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
