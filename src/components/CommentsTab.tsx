import React from "react";
import { RefreshCw } from "lucide-react";
import Card from "./Card";
import type {
  CommentItem,
  DemoAccount,
  ManagementPlatform,
  TiktokLiveConnectionStatus,
} from "../common/type/app.type";

type CommentsTabProps = {
  isRefreshingComments: boolean;
  isSendingComment: boolean;
  darkMode: boolean;
  comments: CommentItem[];
  tiktokRealtimeComments: CommentItem[];
  tiktokConnectionStatus: TiktokLiveConnectionStatus;
  draftComment: string;
  setDraftComment: React.Dispatch<React.SetStateAction<string>>;
  sendComment: () => void;
  refreshComments: () => void;
  autoRefresh: boolean;
  setAutoRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: DemoAccount;
  managementPlatform: ManagementPlatform;
};

export default function CommentsTab({
  isRefreshingComments,
  isSendingComment,
  darkMode,
  comments,
  tiktokRealtimeComments,
  tiktokConnectionStatus,
  draftComment,
  setDraftComment,
  sendComment,
  refreshComments,
  autoRefresh,
  setAutoRefresh,
  currentUser,
  managementPlatform,
}: CommentsTabProps) {
  const refreshHint = managementPlatform === "Shopee" ? "5s" : "3.5s";
  const displayComments = managementPlatform === "Tiktok" ? tiktokRealtimeComments : comments;

  return (
    <Card darkMode={darkMode}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
            Comments
          </div>
          <div className={`mt-1 text-sm ${darkMode ? "text-white/50" : "text-slate-500"}`}>
            {managementPlatform} comment feed simulation with platform-specific cadence and sentiment tags.
          </div>
          <div className={`mt-2 text-xs ${darkMode ? "text-white/45" : "text-slate-500"}`}>
            Posting as <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>{currentUser?.name}</span>
          </div>
        </div>

        <label
          className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
            darkMode
              ? "border-white/10 bg-slate-900/40 text-white"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="h-4 w-4 rounded"
          />
          Auto refresh every {refreshHint}
        </label>
      </div>

      <div className={`rounded-3xl border p-6 ${darkMode ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"}`}>
        <label className={`mb-3 block text-2xl font-semibold ${darkMode ? "text-white" : "text-slate-900"}`}>
          Post Comment
        </label>

        <textarea
          value={draftComment}
          onChange={(e) => setDraftComment(e.target.value)}
          placeholder="Type a comment..."
          className={`min-h-[140px] w-full rounded-2xl border p-4 text-lg outline-none ${
            darkMode
              ? "border-white/10 bg-slate-900/40 text-white placeholder:text-white/40"
              : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400"
          }`}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={sendComment}
            disabled={isSendingComment}
            className={`rounded-2xl px-6 py-4 text-lg font-semibold text-white shadow-lg ${
              isSendingComment ? "cursor-not-allowed bg-[#2C3DA6]/60" : "bg-[#2C3DA6]"
            }`}
          >
            {isSendingComment ? "Sending..." : "Send Comment"}
          </button>

          <button
            onClick={refreshComments}
            disabled={isRefreshingComments}
            className={`rounded-2xl px-6 py-4 text-lg font-semibold text-white shadow-lg ${
              isRefreshingComments ? "cursor-not-allowed bg-[#EF7CAF]/60" : "bg-[#EF7CAF]"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-5 w-5" /> {isRefreshingComments ? "Refreshing..." : "Refresh Comments"}
            </span>
          </button>
        </div>

        <div className="mt-8 space-y-3">
          {displayComments.length === 0 ? (
            <div className={`text-lg ${darkMode ? "text-white/50" : "text-slate-500"}`}>
              {managementPlatform === "Tiktok"
                ? tiktokConnectionStatus === "connected"
                  ? "Đã kết nối TikTok nhưng chưa có comment realtime."
                  : "Chưa có comment realtime. Hãy connect TikTok username ở tab Overview."
                : "No comments yet."}
            </div>
          ) : (
            displayComments
              .slice()
              .reverse()
              .map((c) => (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4 ${
                    darkMode ? "border-white/10 bg-slate-900/50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className={`text-sm ${darkMode ? "text-white/60" : "text-slate-500"}`}>@{c.user}</div>
                    <div className={`text-xs ${darkMode ? "text-white/40" : "text-slate-400"}`}>{c.time}</div>
                  </div>
                  <div className={`mt-2 text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{c.text}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {c.platform ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          c.platform === "Shopee" ? "bg-orange-500/15 text-orange-300" : "bg-sky-500/15 text-sky-300"
                        }`}
                      >
                        {c.platform}
                      </span>
                    ) : null}
                    {c.sentiment ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          c.sentiment === "question"
                            ? "bg-amber-500/15 text-amber-300"
                            : c.sentiment === "positive"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-slate-500/20 text-slate-300"
                        }`}
                      >
                        {c.sentiment}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </Card>
  );
}
