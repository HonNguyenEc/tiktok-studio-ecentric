import { Clock3, Copy, Eye, Package, Play, Upload } from "lucide-react";
import type { OverviewTabProps } from "./overview-tab.type";

function getDatePart(value: string) {
  return value && value.includes("T") ? value.split("T")[0] : "";
}

function getTimePart(value: string) {
  return value && value.includes("T") ? value.split("T")[1]?.slice(0, 5) || "" : "";
}

function updateDateTime(currentValue: string, part: "date" | "time", nextValue: string) {
  const date = part === "date" ? nextValue : getDatePart(currentValue);
  const time = part === "time" ? nextValue : getTimePart(currentValue);
  if (!date && !time) return "";
  return `${date || ""}T${time || "00:00"}`;
}

export default function OverviewControlPanel(props: OverviewTabProps) {
  const dark = props.darkMode;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 ${dark ? "border-white/10 bg-slate-900/40 text-white/80" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
          <Upload className="h-4 w-4" />
          <span className="text-sm font-semibold">Upload Cover</span>
          <input type="file" accept="image/*" className="hidden" onChange={props.onCoverChange} />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={getDatePart(props.scheduleStart)} onChange={(e) => props.setScheduleStart(updateDateTime(props.scheduleStart, "date", e.target.value))} className={`rounded-2xl border px-3 py-2 text-sm [color-scheme:${dark ? "dark" : "light"}] ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-slate-50"}`} />
          <input type="time" value={getTimePart(props.scheduleStart)} onChange={(e) => props.setScheduleStart(updateDateTime(props.scheduleStart, "time", e.target.value))} className={`rounded-2xl border px-3 py-2 text-sm [color-scheme:${dark ? "dark" : "light"}] ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-slate-50"}`} />
          <input type="date" value={getDatePart(props.scheduleEnd)} onChange={(e) => props.setScheduleEnd(updateDateTime(props.scheduleEnd, "date", e.target.value))} className={`rounded-2xl border px-3 py-2 text-sm [color-scheme:${dark ? "dark" : "light"}] ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-slate-50"}`} />
          <input type="time" value={getTimePart(props.scheduleEnd)} onChange={(e) => props.setScheduleEnd(updateDateTime(props.scheduleEnd, "time", e.target.value))} className={`rounded-2xl border px-3 py-2 text-sm [color-scheme:${dark ? "dark" : "light"}] ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-slate-50"}`} />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button onClick={props.onCreateSession} disabled={props.isCreatingSession || !props.coverPreview || !(props.sessionState === "draft" || props.sessionState === "ended")} className="rounded-2xl bg-emerald-600/90 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-900/30">{props.isCreatingSession ? "Creating..." : "Create Session"}</button>
        <button onClick={props.onGenerateUrl} disabled={props.isGeneratingUrl || props.sessionState === "draft"} className="rounded-2xl bg-cyan-600/90 px-4 py-3 text-sm font-semibold text-white disabled:bg-cyan-900/30">{props.isGeneratingUrl ? "Generating..." : "Generate URL"}</button>
        <button onClick={props.onStartStream} disabled={props.isStartingStream || !(props.sessionState === "created" || props.sessionState === "scheduled")} className="rounded-2xl bg-fuchsia-600/90 px-4 py-3 text-sm font-semibold text-white disabled:bg-fuchsia-900/30">{props.isStartingStream ? "Starting..." : "Start Live"}</button>
        <button onClick={props.onEndStream} disabled={props.isEndingStream || props.sessionState !== "live"} className="rounded-2xl bg-red-600/90 px-4 py-3 text-sm font-semibold text-white disabled:bg-red-900/30">{props.isEndingStream ? "Ending..." : "End Live"}</button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}>
          <div className={`mb-2 text-xs uppercase tracking-wide ${dark ? "text-white/45" : "text-slate-500"}`}>Stream URL</div>
          <div className="flex items-start gap-2">
            <div className={`min-w-0 flex-1 break-all text-xs ${dark ? "text-white" : "text-slate-700"}`}>{props.streamUrl || "Not generated yet"}</div>
            <button onClick={props.onCopyStreamUrl} disabled={!props.streamUrl} className={`rounded-xl border px-2 py-1 text-xs ${dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white"}`}><Copy className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}>
          <div className={`mb-2 text-xs uppercase tracking-wide ${dark ? "text-white/45" : "text-slate-500"}`}>
            <Clock3 className="mr-1 inline h-3.5 w-3.5" />State
          </div>
          <div className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{props.sessionState.toUpperCase()}</div>
          {props.isScheduleRangeInvalid ? <div className="mt-1 text-xs text-red-400">End time must be later than Start time.</div> : null}
        </div>
        <div className={`rounded-2xl border p-3 ${dark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}>
          <div className={`text-xs ${dark ? "text-white/70" : "text-slate-600"}`}>
            <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" /> {props.selectedProducts.length} selected</span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {props.visibleProductId ? `#${props.visibleProductId}` : "none"}</span>
            <span className="mx-2">·</span>
            <span className="inline-flex items-center gap-1"><Play className="h-3.5 w-3.5" /> Preview ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
