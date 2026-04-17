import { MessageSquare, Package, PlayCircle } from "lucide-react";
import type { CommentItem, ManagementPlatform, Product } from "../../common/type/app.type";
import { classifyLivePreviewUrl } from "../../common/util/live-preview.util";

type OverviewGridProps = {
  darkMode: boolean;
  managementPlatform: ManagementPlatform;
  coverPreview: string;
  tiktokPlayableLiveUrl: string;
  tiktokLiveStudioStatus: "disconnected" | "attached" | "live";
  selectedProducts: Product[];
  visibleProductId: number | null;
  comments: CommentItem[];
};

export default function OverviewGrid({
  darkMode,
  managementPlatform,
  coverPreview,
  tiktokPlayableLiveUrl,
  tiktokLiveStudioStatus,
  selectedProducts,
  visibleProductId,
  comments,
}: OverviewGridProps) {
  const card = darkMode ? "border-white/10 bg-black/25" : "border-slate-200 bg-white";
  const previewSourceType = managementPlatform === "Tiktok" ? classifyLivePreviewUrl(tiktokPlayableLiveUrl) : "empty";
  const shouldPlayTiktokLive = managementPlatform === "Tiktok" && previewSourceType === "video-direct";
  const shouldShowWebFallback = managementPlatform === "Tiktok" && previewSourceType === "web-page";

  return (
    <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
      <div className={`rounded-3xl border p-4 ${card}`}>
        <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          <Package className="h-4 w-4 text-cyan-400" /> Product List
        </div>
        <div className="space-y-2">
          {selectedProducts.length === 0 ? (
            <div className={darkMode ? "text-white/55" : "text-slate-500"}>No selected products.</div>
          ) : (
            selectedProducts.slice(0, 8).map((p) => (
              <div key={p.id} className={`rounded-xl border px-3 py-2 text-sm ${darkMode ? "border-white/10 bg-slate-900/50 text-white" : "border-slate-200 bg-slate-50"}`}>
                <div className="font-medium">{p.name}</div>
                <div className={darkMode ? "text-white/60" : "text-slate-500"}>${p.price.toFixed(2)} · stock {p.stock}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`rounded-3xl border p-4 ${card}`}>
        <div className={`mb-3 flex items-center justify-between text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          <span className="inline-flex items-center gap-2"><PlayCircle className="h-4 w-4 text-fuchsia-400" /> Video Preview</span>
          <span className={`text-xs ${darkMode ? "text-white/60" : "text-slate-500"}`}>Visible: {visibleProductId ? `#${visibleProductId}` : "None"}</span>
        </div>
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500/60 to-cyan-500/50">
          {shouldPlayTiktokLive ? (
            <div className="relative h-[420px] w-full bg-black">
              <video
                src={tiktokPlayableLiveUrl}
                className="h-full w-full object-cover"
                controls
                autoPlay
                muted
                playsInline
              />
              <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                {tiktokLiveStudioStatus.toUpperCase()}
              </span>
            </div>
          ) : shouldShowWebFallback ? (
            <div className="relative flex h-[420px] w-full flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
              <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                {tiktokLiveStudioStatus.toUpperCase()}
              </span>
              <div className="text-sm font-semibold">TikTok live page cannot be played directly inside &lt;video&gt;.</div>
              <div className="max-w-[560px] text-xs text-white/70">
                Please use a direct media URL (.m3u8/.mp4) for in-app playback, or open the attached TikTok page in a new tab.
              </div>
              <a
                href={tiktokPlayableLiveUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                Open in new tab
              </a>
            </div>
          ) : coverPreview ? (
            <img src={coverPreview} alt="cover" className="h-[420px] w-full object-cover" />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm font-semibold text-white/90">No cover selected</div>
          )}
        </div>
      </div>

      <div className={`rounded-3xl border p-4 ${card}`}>
        <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          <MessageSquare className="h-4 w-4 text-emerald-400" /> Comment Stream
        </div>
        <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
          {comments.length === 0 ? (
            <div className={darkMode ? "text-white/55" : "text-slate-500"}>No comments.</div>
          ) : (
            comments.slice().reverse().slice(0, 12).map((c) => (
              <div key={c.id} className={`rounded-xl border px-3 py-2 text-sm ${darkMode ? "border-white/10 bg-slate-900/50 text-white" : "border-slate-200 bg-slate-50"}`}>
                <div className={darkMode ? "text-white/60" : "text-slate-500"}>@{c.user} · {c.time}</div>
                <div className="mt-1">{c.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
