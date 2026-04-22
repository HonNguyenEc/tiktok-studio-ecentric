import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { io, type Socket } from "socket.io-client";
import {
  createMockSession,
  endMockStream,
  generateMockStreamUrlByPlatform,
  startMockStream,
} from "../../../service/livestream.service";
import type {
  CommentItem,
  ManagementPlatform,
  ObsConfig,
  SessionState,
  TiktokGiftEvent,
  TiktokLiveConnectionStatus,
} from "../../../common/type/app.type";
import { startObsStream, stopObsStream } from "../../../service/obs.service";
import { toPlatformKey } from "../../../common/util/platform.util";
import { canRunWithCooldown, createRequestId } from "../util/action-control.util";
import { loadPersistedObsConfig } from "../util/session-storage.util";
import { useSessionPersistenceHook } from "./use-session-persistence.hook";
import { useSessionSchedulerHook } from "./use-session-scheduler.hook";
import { useMarketplaceLiveSyncHook } from "./use-marketplace-live-sync.hook";
import { useObsLifecycleHook } from "./use-obs-lifecycle.hook";

const TIKTOK_POLL_ENDPOINT = import.meta.env.VITE_TIKTOK_POLL_ENDPOINT || "/api/tiktok/live-snapshot";
const TIKTOK_POLL_INTERVAL_MS = Number(import.meta.env.VITE_TIKTOK_POLL_INTERVAL_MS || 7000);
const TIKTOK_SOCKET_URL = import.meta.env.VITE_TIKTOK_SOCKET_URL || "http://localhost:3001";

type TiktokLiveSnapshotResponse = {
  status?: TiktokLiveConnectionStatus;
  username?: string;
  message?: string;
  viewerCount?: number;
  totalLikes?: number;
};

type TiktokSocketStatusResponse = {
  status?: TiktokLiveConnectionStatus;
  username?: string;
  message?: string;
};

type TiktokSocketChatResponse = {
  username?: string;
  comment?: string;
  timestamp?: number;
};

type TiktokSocketLikeResponse = {
  totalLikes?: number;
};

type TiktokSocketViewerResponse = {
  viewers?: number;
};

type TiktokSocketGiftResponse = {
  id?: string;
  username?: string;
  giftName?: string;
  repeatCount?: number;
  timestamp?: number;
};

type UseSessionLifecycleHookArgs = {
  managementPlatform: ManagementPlatform;
  addLog: (
    action: string,
    detail: string,
    meta?: {
      platform?: ManagementPlatform;
      result?: "success" | "error" | "info";
      errorCode?: string;
      requestId?: string;
    }
  ) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  setAppError: (message: string) => void;
};

export const useSessionLifecycleHook = ({
  managementPlatform,
  addLog,
  showToast,
  setAppError,
}: UseSessionLifecycleHookArgs) => {
  const platformKey = toPlatformKey(managementPlatform);

  const [sessionState, setSessionState] = useState<SessionState>("draft");
  const [sessionLifecycleState, setSessionLifecycleState] = useState<SessionState>("draft");
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [scheduleStart, setScheduleStart] = useState<string>("");
  const [scheduleEnd, setScheduleEnd] = useState<string>("");

  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);
  const [isStartingStream, setIsStartingStream] = useState<boolean>(false);
  const [isEndingStream, setIsEndingStream] = useState<boolean>(false);

  const [obsConfig, setObsConfig] = useState<ObsConfig>(loadPersistedObsConfig(platformKey));
  const [obsSceneDraft, setObsSceneDraft] = useState<string>("");
  const [tiktokUsernameInput, setTiktokUsernameInput] = useState<string>("");
  const [tiktokUsername, setTiktokUsername] = useState<string>("");
  const [tiktokConnectionStatus, setTiktokConnectionStatus] = useState<TiktokLiveConnectionStatus>("disconnected");
  const [tiktokConnectionMessage, setTiktokConnectionMessage] = useState<string>("");
  const [isConnectingTiktokLive, setIsConnectingTiktokLive] = useState<boolean>(false);
  const [tiktokRealtimeComments, setTiktokRealtimeComments] = useState<CommentItem[]>([]);
  const [tiktokTotalLikes, setTiktokTotalLikes] = useState<number>(0);
  const [tiktokViewerCount, setTiktokViewerCount] = useState<number>(0);
  const [tiktokTotalComments, setTiktokTotalComments] = useState<number>(0);
  const [latestTiktokGift, setLatestTiktokGift] = useState<TiktokGiftEvent | null>(null);
  const lastPollAbortRef = useRef<AbortController | null>(null);
  const tiktokSocketRef = useRef<Socket | null>(null);

  const {
    obsSessionState,
    setObsSessionState,
    isConnectingObs,
    isSwitchingScene,
    onConnectObs,
    onDisconnectObs,
    onSwitchObsScene,
    onObsSceneNameChange,
    onObsConfigChange,
  } = useObsLifecycleHook({
    platformKey,
    managementPlatform,
    obsConfig,
    setObsConfig,
    obsSceneDraft,
    setObsSceneDraft,
    setAppError,
    addLog,
    showToast,
  });

  useSessionPersistenceHook({
    platformKey,
    sessionState,
    sessionLifecycleState,
    coverPreview,
    streamUrl,
    scheduleStart,
    scheduleEnd,
    obsConfig,
    setSessionState,
    setSessionLifecycleState,
    setCoverPreview,
    setStreamUrl,
    setScheduleStart,
    setScheduleEnd,
    setObsConfig,
    setObsSessionState,
    setObsSceneDraft,
  });

  const { isScheduleRangeInvalid } = useSessionSchedulerHook({
    scheduleStart,
    scheduleEnd,
    sessionState,
    managementPlatform,
    setSessionState,
    setSessionLifecycleState,
    addLog,
  });

  const {
    marketplaceShopProfile,
    isLoadingMarketplaceShopProfile,
    realtimeMetrics,
    streamHealth,
  } = useMarketplaceLiveSyncHook({
    managementPlatform,
    addLog,
  });

  useEffect(() => {
    if (!tiktokUsername) {
      lastPollAbortRef.current?.abort();
      lastPollAbortRef.current = null;
      return;
    }

    let isDisposed = false;

    const pollSnapshot = async (isInitial: boolean) => {
      if (isDisposed) return;

      if (isInitial) {
        setTiktokConnectionStatus("connecting");
        setTiktokConnectionMessage(`Checking @${tiktokUsername}...`);
        setIsConnectingTiktokLive(true);
      }

      lastPollAbortRef.current?.abort();
      const controller = new AbortController();
      lastPollAbortRef.current = controller;

      try {
        const response = await fetch(`${TIKTOK_POLL_ENDPOINT}?username=${encodeURIComponent(tiktokUsername)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Polling failed (${response.status})`);
        }

        const payload = (await response.json()) as TiktokLiveSnapshotResponse;
        const status = payload.status || "disconnected";

        setTiktokConnectionStatus(status);
        setTiktokConnectionMessage(payload.message || "");
        setIsConnectingTiktokLive(status === "connecting");

        if (payload.username) {
          setTiktokUsernameInput(payload.username);
        }

        if (typeof payload.viewerCount === "number") {
          setTiktokViewerCount(payload.viewerCount);
        } else if (status === "disconnected" || status === "error") {
          setTiktokViewerCount(0);
        }

        if (typeof payload.totalLikes === "number") {
          setTiktokTotalLikes(payload.totalLikes);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setTiktokConnectionStatus("error");
        setTiktokConnectionMessage(error instanceof Error ? error.message : "Failed to fetch TikTok live snapshot.");
        setIsConnectingTiktokLive(false);
        setTiktokViewerCount(0);
      }
    };

    void pollSnapshot(true);
    const intervalId = window.setInterval(() => {
      void pollSnapshot(false);
    }, Math.max(5000, TIKTOK_POLL_INTERVAL_MS));

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
      lastPollAbortRef.current?.abort();
      lastPollAbortRef.current = null;
    };
  }, [tiktokUsername]);

  useEffect(() => {
    if (managementPlatform !== "Tiktok" || !tiktokUsername) {
      if (tiktokSocketRef.current) {
        tiktokSocketRef.current.emit("clearUsername");
        tiktokSocketRef.current.disconnect();
        tiktokSocketRef.current = null;
      }
      return;
    }

    const socket = io(TIKTOK_SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    tiktokSocketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("setUsername", { username: tiktokUsername });
    });

    socket.on("tiktokStatus", (payload: TiktokSocketStatusResponse) => {
      if (payload?.status) {
        setTiktokConnectionStatus(payload.status);
      }
      setTiktokConnectionMessage(payload?.message || "");
      setIsConnectingTiktokLive(payload?.status === "connecting");
    });

    socket.on("chat", (payload: TiktokSocketChatResponse) => {
      const commentText = String(payload?.comment || "").trim();
      if (!commentText) return;

      const username = String(payload?.username || "viewer").trim() || "viewer";

      setTiktokRealtimeComments((prev) => {
        const next = [
          ...prev,
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            user: username,
            text: commentText,
            time: new Date(payload?.timestamp || Date.now()).toLocaleTimeString(),
            platform: "Tiktok" as const,
          },
        ];
        return next.slice(-200);
      });
      setTiktokTotalComments((prev) => prev + 1);
    });

    socket.on("like", (payload: TiktokSocketLikeResponse) => {
      if (typeof payload?.totalLikes === "number") {
        setTiktokTotalLikes(payload.totalLikes);
      }
    });

    socket.on("viewer", (payload: TiktokSocketViewerResponse) => {
      if (typeof payload?.viewers === "number") {
        setTiktokViewerCount(payload.viewers);
      }
    });

    socket.on("gift", (payload: TiktokSocketGiftResponse) => {
      setLatestTiktokGift({
        id: payload?.id || `${Date.now()}`,
        username: payload?.username || "viewer",
        giftName: payload?.giftName || "Gift",
        repeatCount: Number(payload?.repeatCount || 1),
        timestamp: new Date(payload?.timestamp || Date.now()).toLocaleTimeString(),
      });
    });

    socket.on("connect_error", (error) => {
      setTiktokConnectionStatus("error");
      setTiktokConnectionMessage(error instanceof Error ? error.message : "Failed to connect realtime TikTok stream.");
      setIsConnectingTiktokLive(false);
    });

    return () => {
      socket.emit("clearUsername");
      socket.disconnect();
      if (tiktokSocketRef.current === socket) {
        tiktokSocketRef.current = null;
      }
    };
  }, [managementPlatform, tiktokUsername]);

  useEffect(() => {
    if (!latestTiktokGift) return;
    const timeout = window.setTimeout(() => {
      setLatestTiktokGift(null);
    }, 3200);

    return () => window.clearTimeout(timeout);
  }, [latestTiktokGift]);

  const onCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    addLog("Cover uploaded", `Loaded local file: ${file.name}`, {
      platform: managementPlatform,
      result: "success",
    });
  };

  const onCreateSession = async () => {
    setAppError("");

    if (isScheduleRangeInvalid) {
      addLog("Invalid schedule", "End time must be later than Start time.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "INVALID_SCHEDULE_RANGE",
      });
      setAppError("End time must be later than Start time.");
      return;
    }

    setIsCreatingSession(true);

    try {
      const result = await createMockSession(scheduleStart, scheduleEnd, sessionLifecycleState);
      setSessionState(result.nextState);
      setSessionLifecycleState(result.nextState);
      setStreamUrl("");
      addLog(result.actionLabel, result.detail, {
        platform: managementPlatform,
        result: "success",
      });
      showToast(result.actionLabel, "success");
    } catch {
      setAppError("Failed to create session.");
      showToast("Failed to create session.", "error");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const onGenerateUrl = async () => {
    setAppError("");
    setIsGeneratingUrl(true);

    try {
      const url = await generateMockStreamUrlByPlatform(managementPlatform);
      setStreamUrl(url);
      addLog("Stream URL generated", url, {
        platform: managementPlatform,
        result: "success",
      });
      showToast("Stream URL generated.", "success");
    } catch {
      setAppError("Failed to generate stream URL.");
      showToast("Failed to generate stream URL.", "error");
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const onCopyStreamUrl = async () => {
    if (!streamUrl) return;
    try {
      await navigator.clipboard.writeText(streamUrl);
      addLog("Stream URL copied", "Copied stream URL to clipboard.", {
        platform: managementPlatform,
        result: "success",
      });
      showToast("Stream URL copied.", "success");
    } catch {
      addLog("Copy failed", "Clipboard permission is unavailable in this environment.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "CLIPBOARD_UNAVAILABLE",
      });
      setAppError("Failed to copy stream URL.");
      showToast("Copy failed.", "error");
    }
  };

  const onStartStream = async () => {
    setAppError("");

    if (managementPlatform === "Tiktok" && !tiktokUsername) {
      setAppError("Please connect TikTok username before starting stream.");
      addLog("TikTok username required", "Connect TikTok username before going live.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "TIKTOK_USERNAME_REQUIRED",
      });
      showToast("Connect TikTok username first.", "error");
      return;
    }

    if (isScheduleRangeInvalid) {
      addLog("Invalid schedule", "End time must be later than Start time.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "INVALID_SCHEDULE_RANGE",
      });
      setAppError("End time must be later than Start time.");
      return;
    }

    if (!canRunWithCooldown(`${platformKey}-start-stream`, 1200)) {
      setAppError("Please wait a moment before starting stream again.");
      addLog("Start stream cooldown", "Start Stream action is cooling down to prevent race conditions.", {
        platform: managementPlatform,
        result: "info",
      });
      return;
    }

    setIsStartingStream(true);
    const requestId = createRequestId();

    try {
      const result = await startMockStream(scheduleStart);
      if (result.blocked) {
        addLog("Start blocked", result.detail, {
          platform: managementPlatform,
          result: "error",
          errorCode: "START_BLOCKED_BY_SCHEDULE",
          requestId,
        });
        setAppError(result.detail);
        return;
      }

      if (result.nextState) {
        setSessionState(result.nextState);
        setSessionLifecycleState(result.nextState);
      }

      if (managementPlatform === "Shopee" && obsSessionState.connectionStatus === "connected" && !obsSessionState.isStreaming) {
        await startObsStream(platformKey);
      }

      addLog("Stream started", result.detail, {
        platform: managementPlatform,
        result: "success",
        requestId,
      });
      showToast("Stream started.", "success");
    } catch {
      setAppError("Failed to start stream.");
      addLog("Stream start failed", "Failed to start stream lifecycle action.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "STREAM_START_FAILED",
        requestId,
      });
    } finally {
      setIsStartingStream(false);
    }
  };

  const onEndStream = async () => {
    setAppError("");

    if (!canRunWithCooldown(`${platformKey}-end-stream`, 1200)) {
      setAppError("Please wait a moment before ending stream again.");
      addLog("End stream cooldown", "End Stream action is cooling down to prevent race conditions.", {
        platform: managementPlatform,
        result: "info",
      });
      return;
    }

    const confirmed = window.confirm(`Confirm ending ${managementPlatform} live session?`);
    if (!confirmed) return;

    setIsEndingStream(true);
    const requestId = createRequestId();

    try {
      const result = await endMockStream();
      setSessionState(result.nextState);
      setSessionLifecycleState(result.nextState);

      if (managementPlatform === "Shopee" && obsSessionState.connectionStatus === "connected" && obsSessionState.isStreaming) {
        await stopObsStream(platformKey);
      }

      addLog("Stream ended", result.detail, {
        platform: managementPlatform,
        result: "success",
        requestId,
      });
      showToast("Stream ended.", "success");
    } catch {
      setAppError("Failed to end stream.");
      addLog("Stream end failed", "Failed to complete end stream action.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "STREAM_END_FAILED",
        requestId,
      });
    } finally {
      setIsEndingStream(false);
    }
  };

  const onAttachTiktokLiveUrl = async () => {
    setAppError("");
    if (managementPlatform !== "Tiktok") return;
    const username = tiktokUsernameInput.trim().replace(/^@/, "");

    if (!username) {
      setAppError("Please enter TikTok username.");
      showToast("TikTok username is required.", "error");
      return;
    }

    setTiktokUsername(username);
    setTiktokRealtimeComments([]);
    setTiktokTotalComments(0);
    setTiktokTotalLikes(0);
    setTiktokViewerCount(0);
    setLatestTiktokGift(null);
    setIsConnectingTiktokLive(true);

    addLog("TikTok username connected", `Connected TikTok livestream source: @${username}`, {
      platform: managementPlatform,
      result: "success",
    });
    showToast(`TikTok source set: @${username}`, "success");
  };

  const onDetachTiktokLiveUrl = () => {
    if (managementPlatform !== "Tiktok") return;
    lastPollAbortRef.current?.abort();
    setTiktokUsername("");
    setTiktokUsernameInput("");
    setTiktokConnectionStatus("disconnected");
    setTiktokConnectionMessage("");
    setIsConnectingTiktokLive(false);
    setTiktokRealtimeComments([]);
    setTiktokTotalLikes(0);
    setTiktokTotalComments(0);
    setTiktokViewerCount(0);
    setLatestTiktokGift(null);
    addLog("TikTok source disconnected", "TikTok livestream source disconnected.", {
      platform: managementPlatform,
      result: "info",
    });
    showToast("TikTok source disconnected.", "info");
  };

  const tiktokLiveEmbedUrl = tiktokUsername ? `https://www.tiktok.com/@${tiktokUsername}/live` : "";

  return {
    sessionState,
    coverPreview,
    streamUrl,
    scheduleStart,
    scheduleEnd,
    setScheduleStart,
    setScheduleEnd,
    isScheduleRangeInvalid,
    isCreatingSession,
    isGeneratingUrl,
    isStartingStream,
    isEndingStream,
    isConnectingObs,
    isSwitchingScene,
    obsConfig,
    obsSessionState,
    obsSceneDraft,
    tiktokUsernameInput,
    setTiktokUsernameInput,
    tiktokUsername,
    tiktokLiveEmbedUrl,
    tiktokConnectionStatus,
    tiktokConnectionMessage,
    isConnectingTiktokLive,
    tiktokRealtimeComments,
    tiktokTotalLikes,
    tiktokViewerCount,
    tiktokTotalComments,
    latestTiktokGift,
    marketplaceShopProfile,
    isLoadingMarketplaceShopProfile,
    realtimeMetrics,
    streamHealth,
    onCoverChange,
    onCreateSession,
    onGenerateUrl,
    onCopyStreamUrl,
    onStartStream,
    onEndStream,
    onObsConfigChange,
    onConnectObs,
    onDisconnectObs,
    onSwitchObsScene,
    onObsSceneNameChange,
    onAttachTiktokLiveUrl,
    onDetachTiktokLiveUrl,
  };
};
