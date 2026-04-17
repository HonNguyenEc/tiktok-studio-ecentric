import Card from "../../../components/Card";
import { useReportHook } from "../hook/use-report.hook";
import type { ReportPageProps } from "../interface/report-page.interface";

export default function ReportPageComponent({ darkMode }: ReportPageProps) {
  const { reportItems } = useReportHook();

  return (
    <Card darkMode={darkMode}>
      <div className="space-y-4">
        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
          Report Page Template
        </h2>
        <p className={`${darkMode ? "text-white/60" : "text-slate-600"}`}>
          This is a starter page template. Replace mock items and hook logic with real report data.
        </p>

        <div className="space-y-2">
          {reportItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-4 py-3 ${
                darkMode
                  ? "border-white/10 bg-slate-900/40 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs opacity-70">{item.createdAt}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
