import { CheckCircle2, ListChecks } from "lucide-react";
import type { LogItem } from "../../common/type/app.type";

type OverviewLogsPanelProps = {
  darkMode: boolean;
  logs: LogItem[];
};

export default function OverviewLogsPanel({ darkMode, logs }: OverviewLogsPanelProps) {
  return (
    <div className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-slate-900/45" : "border-slate-200 bg-slate-50"}`}>
      <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
        <ListChecks className="h-4 w-4 text-cyan-400" /> Recent Logs
      </div>

      <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
        {logs.length === 0 ? (
          <div className={darkMode ? "text-white/55" : "text-slate-500"}>No actions yet.</div>
        ) : (
          logs.slice().reverse().map((log) => (
            <div key={log.id} className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${darkMode ? "border-white/10 bg-black/25" : "border-slate-200 bg-white"}`}>
              <div>
                <div className={`flex items-center gap-2 text-sm ${darkMode ? "text-white" : "text-slate-900"}`}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-medium">{log.action}</span>
                </div>
                <div className={`mt-1 text-xs ${darkMode ? "text-white/55" : "text-slate-500"}`}>{log.detail}</div>
              </div>
              <div className={`text-[11px] ${darkMode ? "text-white/40" : "text-slate-400"}`}>{log.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
