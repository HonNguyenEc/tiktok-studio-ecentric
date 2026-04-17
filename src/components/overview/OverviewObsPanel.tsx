import { RefreshCw, Tv } from "lucide-react";
import type { OverviewTabProps } from "./overview-tab.type";

export default function OverviewObsPanel(props: OverviewTabProps) {
  const dark = props.darkMode;

  if (props.managementPlatform === "Tiktok") {
    const statusColor =
      props.tiktokLiveStudioStatus === "live"
        ? "text-emerald-400"
        : props.tiktokLiveStudioStatus === "attached"
          ? "text-cyan-400"
          : "text-slate-400";

    return (
      <div className={`space-y-3 rounded-2xl border p-4 ${dark ? "border-white/10 bg-slate-900/45" : "border-slate-200 bg-slate-50"}`}>
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
            <Tv className="h-4 w-4" /> TikTok Live Studio Connection
          </div>
          <div className={`text-xs font-semibold ${statusColor}`}>{props.tiktokLiveStudioStatus.toUpperCase()}</div>
        </div>

        <p className={`text-xs ${dark ? "text-white/65" : "text-slate-600"}`}>
          Attach a playable live URL from TikTok Live Studio. When stream is started, preview will play inside dashboard.
        </p>

        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <input
            value={props.tiktokPlayableLiveInput}
            onChange={(e) => props.setTiktokPlayableLiveInput(e.target.value)}
            placeholder="https://.../live.m3u8"
            className={`rounded-2xl border px-3 py-2 text-sm ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-white"}`}
          />
          <button
            onClick={props.onAttachTiktokLiveUrl}
            disabled={props.isAttachingTiktokLive}
            className="rounded-2xl bg-cyan-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-cyan-900/30"
          >
            {props.isAttachingTiktokLive ? "Attaching..." : "Attach"}
          </button>
          <button
            onClick={props.onDetachTiktokLiveUrl}
            disabled={!props.isTiktokLiveAttached}
            className="rounded-2xl bg-slate-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-800/40"
          >
            Detach
          </button>
        </div>

        <div className={`text-xs ${dark ? "text-white/60" : "text-slate-600"}`}>
          Attached URL: <span className={dark ? "text-white" : "text-slate-900"}>{props.tiktokPlayableLiveUrl || "--"}</span>
        </div>

        <div className={`rounded-2xl border p-3 text-xs ${dark ? "border-white/10 bg-slate-900/60 text-white/80" : "border-slate-200 bg-white text-slate-700"}`}>
          <div className="mb-2 font-semibold">Live Basic Info</div>
          {props.isLoadingTiktokLiveBasicInfo ? (
            <div className={dark ? "text-white/70" : "text-slate-500"}>Loading live info...</div>
          ) : props.tiktokLiveBasicInfo ? (
            <div className="space-y-1">
              <div>Status: <span className="font-semibold uppercase">{props.tiktokLiveBasicInfo.status}</span></div>
              <div>Source: <span className="font-semibold">{props.tiktokLiveBasicInfo.source}</span></div>
              <div>Creator: <span className="font-semibold">{props.tiktokLiveBasicInfo.ownerNickname || `@${props.tiktokLiveBasicInfo.uniqueId || "--"}`}</span></div>
              <div>Room ID: <span className="font-semibold">{props.tiktokLiveBasicInfo.roomId || "--"}</span></div>
              <div>Viewers: <span className="font-semibold">{props.tiktokLiveBasicInfo.viewerCount ?? "--"}</span></div>
              <div>Title: <span className="font-semibold">{props.tiktokLiveBasicInfo.title || "--"}</span></div>
              <div>Checked: <span className="font-semibold">{props.tiktokLiveBasicInfo.lastCheckedAt}</span></div>
              {props.tiktokLiveBasicInfo.error ? <div className="text-red-400">Error: {props.tiktokLiveBasicInfo.error}</div> : null}
            </div>
          ) : (
            <div className={dark ? "text-white/70" : "text-slate-500"}>Attach a TikTok live URL to fetch basic info.</div>
          )}
        </div>
      </div>
    );
  }

  const obsTone =
    props.obsSessionState.connectionStatus === "connected"
      ? "text-emerald-400"
      : props.obsSessionState.connectionStatus === "connecting" || props.obsSessionState.connectionStatus === "reconnecting"
        ? "text-amber-400"
        : props.obsSessionState.connectionStatus === "error"
          ? "text-red-400"
          : dark
            ? "text-white/70"
            : "text-slate-600";

  return (
    <div className={`space-y-3 rounded-2xl border p-4 ${dark ? "border-white/10 bg-slate-900/45" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-2 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
          <Tv className="h-4 w-4" /> OBS Controls ({props.managementPlatform})
        </div>
        <div className={`text-xs font-semibold ${obsTone}`}>{props.obsSessionState.connectionStatus.toUpperCase()}</div>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <input value={props.obsConfig.url} onChange={(e) => props.onObsConfigChange({ url: e.target.value })} placeholder="ws://127.0.0.1:4455" className={`rounded-2xl border px-3 py-2 text-sm ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-white"}`} />
        <input type="password" value={props.obsConfig.password} onChange={(e) => props.onObsConfigChange({ password: e.target.value })} placeholder="OBS password" className={`rounded-2xl border px-3 py-2 text-sm ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-white"}`} />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button onClick={props.onConnectObs} disabled={props.isConnectingObs || props.obsSessionState.connectionStatus === "connected"} className="rounded-2xl bg-emerald-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-emerald-900/30">{props.isConnectingObs ? "Connecting..." : "Connect"}</button>
        <button onClick={props.onDisconnectObs} disabled={props.obsSessionState.connectionStatus === "disconnected"} className="rounded-2xl bg-slate-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-800/40">Disconnect</button>
        <button onClick={props.onStartStream} disabled={props.isStartingStream || !(props.sessionState === "created" || props.sessionState === "scheduled")} className="rounded-2xl bg-fuchsia-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-fuchsia-900/30">Start Live</button>
        <button onClick={props.onEndStream} disabled={props.isEndingStream || props.sessionState !== "live"} className="rounded-2xl bg-red-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-red-900/30">End Live</button>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <select value={props.obsSceneDraft} onChange={(e) => props.onObsSceneNameChange(e.target.value)} disabled={props.obsSessionState.connectionStatus !== "connected"} className={`rounded-2xl border px-3 py-2 text-sm ${dark ? "border-white/10 bg-slate-900/70 text-white" : "border-slate-200 bg-white"}`}>
          <option value="">Select scene</option>
          {props.obsSessionState.availableScenes.map((sceneName) => <option key={sceneName} value={sceneName}>{sceneName}</option>)}
        </select>
        <button onClick={props.onSwitchObsScene} disabled={props.isSwitchingScene || props.obsSessionState.connectionStatus !== "connected"} className="rounded-2xl bg-cyan-600/90 px-4 py-2.5 text-sm font-semibold text-white disabled:bg-cyan-900/30">{props.isSwitchingScene ? "Switching..." : "Switch"}</button>
      </div>

      <div className={`flex flex-wrap items-center gap-2 text-xs ${dark ? "text-white/60" : "text-slate-600"}`}>
        <RefreshCw className="h-3.5 w-3.5" />
        OBS: {props.obsSessionState.isStreaming ? "ON" : "OFF"}
        <span>· Program: {props.obsSessionState.programSceneName || "--"}</span>
        <span>· Preview: {props.obsSessionState.previewSceneName || "--"}</span>
        {props.obsSessionState.lastError ? <span className="text-red-400">· {props.obsSessionState.lastError}</span> : null}
      </div>
    </div>
  );
}
