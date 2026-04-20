import { MessageSquare, Package, PlayCircle } from "lucide-react";
import type {
  CommentItem,
  ManagementPlatform,
  Product,
  TiktokGiftEvent,
  TiktokLiveConnectionStatus,
} from "../../common/type/app.type";

type OverviewGridProps = {
  darkMode: boolean;
  managementPlatform: ManagementPlatform;
  coverPreview: string;
  tiktokLiveEmbedUrl: string;
  tiktokConnectionStatus: TiktokLiveConnectionStatus;
  tiktokRealtimeComments: CommentItem[];
  tiktokTotalLikes: number;
  tiktokViewerCount: number;
  tiktokTotalComments: number;
  latestTiktokGift: TiktokGiftEvent | null;
  selectedProducts: Product[];
  visibleProductId: number | null;
  comments: CommentItem[];
};

export default function OverviewGrid({
  darkMode,
  managementPlatform,
  coverPreview,
  tiktokLiveEmbedUrl,
  tiktokConnectionStatus,
  tiktokRealtimeComments,
  tiktokTotalLikes,
  tiktokViewerCount,
  tiktokTotalComments,
  latestTiktokGift,
  selectedProducts,
  visibleProductId,
  comments,
}: OverviewGridProps) {
  const card = darkMode ? "border-white/10 bg-black/25" : "border-slate-200 bg-white";
  const commentStream = managementPlatform === "Tiktok" ? tiktokRealtimeComments : comments;

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
          {managementPlatform === "Tiktok" ? (
            <div className="relative h-[420px] w-full bg-black">
              {tiktokLiveEmbedUrl ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center text-sm text-white/85">
                  <div className="max-w-[440px]">
                    TikTok Live page không cho nhúng trực tiếp vào iframe (CSP/X-Frame policy), nên preview trong app sẽ bị chặn.
                  </div>
                  <a
                    href={tiktokLiveEmbedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
                  >
                    Open TikTok Live in new tab
                  </a>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/80">
                  Nhập TikTok username để hiển thị livestream.
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-cyan-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                {tiktokConnectionStatus.toUpperCase()}
              </span>
              <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2 text-[11px] text-white">
                <div className="rounded-lg bg-black/60 px-2 py-1.5">❤️ {tiktokTotalLikes.toLocaleString()}</div>
                <div className="rounded-lg bg-black/60 px-2 py-1.5">💬 {tiktokTotalComments.toLocaleString()}</div>
                <div className="rounded-lg bg-black/60 px-2 py-1.5">👥 {tiktokViewerCount.toLocaleString()}</div>
              </div>
              {latestTiktokGift ? (
                <div className="animate-pulse absolute right-3 top-3 rounded-xl bg-fuchsia-600/95 px-3 py-2 text-[11px] font-semibold text-white shadow-lg">
                  🎁 @{latestTiktokGift.username} sent {latestTiktokGift.giftName} x{latestTiktokGift.repeatCount}
                </div>
              ) : null}
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
          {commentStream.length === 0 ? (
            <div className={darkMode ? "text-white/55" : "text-slate-500"}>No comments.</div>
          ) : (
            commentStream.slice().reverse().slice(0, 20).map((c) => (
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
