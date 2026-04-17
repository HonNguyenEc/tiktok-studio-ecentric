import { AlertTriangle, Eye, Radio, Wifi } from "lucide-react";
import type { DemoConnectionStatus, ManagementPlatform, SessionState } from "../../common/type/app.type";

type TopStatusBarProps = {
  darkMode: boolean;
  sessionState: SessionState;
  viewers: number;
  connectionStatus: DemoConnectionStatus;
  managementPlatform: ManagementPlatform;
  appError: string;
};

const statusTone: Record<DemoConnectionStatus, string> = {
  connected: "text-emerald-400",
  limited: "text-amber-400",
  disconnected: "text-red-400",
};

export default function TopStatusBar({
  darkMode,
  sessionState,
  viewers,
  connectionStatus,
  managementPlatform,
  appError,
}: TopStatusBarProps) {
  return (
    <section className={`rounded-3xl border p-4 ${darkMode ? "border-white/10 bg-black/30" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1 ${darkMode ? "bg-cyan-500/15 text-cyan-200" : "bg-cyan-50 text-cyan-700"}`}>
            {managementPlatform} LIVE OPS
          </span>
          <span className={`rounded-full px-3 py-1 ${darkMode ? "bg-fuchsia-500/15 text-fuchsia-200" : "bg-fuchsia-50 text-fuchsia-700"}`}>
            {sessionState.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`inline-flex items-center gap-1.5 ${darkMode ? "text-white/80" : "text-slate-700"}`}>
            <Radio className="h-4 w-4 text-red-400" /> Live Status
          </span>
          <span className={`inline-flex items-center gap-1.5 ${darkMode ? "text-white/80" : "text-slate-700"}`}>
            <Eye className="h-4 w-4 text-cyan-400" /> {viewers.toLocaleString()} viewers
          </span>
          <span className={`inline-flex items-center gap-1.5 ${statusTone[connectionStatus]}`}>
            <Wifi className="h-4 w-4" /> {connectionStatus}
          </span>
        </div>
      </div>

      {appError ? (
        <div className={`mt-3 flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm ${darkMode ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-red-200 bg-red-50 text-red-600"}`}>
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <span>{appError}</span>
        </div>
      ) : null}
    </section>
  );
}
