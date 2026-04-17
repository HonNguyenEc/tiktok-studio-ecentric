import { useEffect, useState } from "react";
import {
  createManualComment,
  getMockIncomingComment,
} from "../../../service/comment.service";
import { getMarketplaceDemoAdapter } from "../../../service/marketplace/adapter/marketplace-demo.adapter";
import type { CommentItem, ManagementPlatform } from "../../../common/type/app.type";

type UseCommentManagerHookArgs = {
  initialComments: CommentItem[];
  managementPlatform: ManagementPlatform;
  currentUserEmail: string;
  addLog: (action: string, detail: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  setAppError: (message: string) => void;
};

export const useCommentManagerHook = ({
  initialComments,
  managementPlatform,
  currentUserEmail,
  addLog,
  showToast,
  setAppError,
}: UseCommentManagerHookArgs) => {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [draftComment, setDraftComment] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [isRefreshingComments, setIsRefreshingComments] = useState<boolean>(false);
  const [isSendingComment, setIsSendingComment] = useState<boolean>(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments, managementPlatform]);

  useEffect(() => {
    if (!autoRefresh) return;

    const adapter = getMarketplaceDemoAdapter(managementPlatform);
    const intervalMs = adapter.getCommentAutoRefreshMs();

    const interval = setInterval(() => {
      getMockIncomingComment(managementPlatform)
        .then((comment) => {
          setComments((prev) => [...prev, comment]);
        })
        .catch(() => {
          setAppError("Failed to auto-refresh comments.");
        });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, managementPlatform, setAppError]);

  const sendComment = async () => {
    if (!draftComment.trim()) return;

    setAppError("");
    setIsSendingComment(true);

    try {
      const comment = await createManualComment(
        managementPlatform,
        currentUserEmail.split("@")[0] || "studio_operator",
        draftComment.trim()
      );

      setComments((prev) => [...prev, comment]);
      addLog(`${managementPlatform} comment sent`, draftComment.trim());
      showToast("Comment sent.", "success");
      setDraftComment("");
    } catch {
      setAppError("Failed to send comment.");
    } finally {
      setIsSendingComment(false);
    }
  };

  const refreshComments = async () => {
    setAppError("");
    setIsRefreshingComments(true);

    try {
      const comment = await getMockIncomingComment(managementPlatform);
      setComments((prev) => [...prev, comment]);
      addLog(`${managementPlatform} comments refreshed`, "Pulled 1 mock comment from platform source.");
      showToast("Comments refreshed.", "info");
    } catch {
      setAppError("Failed to refresh comments.");
    } finally {
      setIsRefreshingComments(false);
    }
  };

  return {
    comments,
    draftComment,
    setDraftComment,
    autoRefresh,
    setAutoRefresh,
    isRefreshingComments,
    isSendingComment,
    sendComment,
    refreshComments,
  };
};
