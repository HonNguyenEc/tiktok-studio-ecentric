import { useState, type ChangeEvent } from "react";
import {
  createMockSession,
  endMockStream,
  generateMockStreamUrlByPlatform,
  startMockStream,
} from "../../../service/livestream.service";
import type {
  ManagementPlatform,
  ObsConfig,
  SessionState,
  TiktokLiveBasicInfo,
} from "../../../common/type/app.type";
import { startObsStream, stopObsStream } from "../../../service/obs.service";
import { toPlatformKey } from "../../../common/util/platform.util";
import { classifyLivePreviewUrl } from "../../../common/util/live-preview.util";
import { getTiktokLiveBasicInfo } from "../../../service/tiktok-live-basic-info.service";
import { canRunWithCooldown, createRequestId } from "../util/action-control.util";
import { loadPersistedObsConfig } from "../util/session-storage.util";
import { useSessionPersistenceHook } from "./use-session-persistence.hook";
import { useSessionSchedulerHook } from "./use-session-scheduler.hook";
import { useMarketplaceLiveSyncHook } from "./use-marketplace-live-sync.hook";
import { useObsLifecycleHook } from "./use-obs-lifecycle.hook";

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
  const [tiktokPlayableLiveInput, setTiktokPlayableLiveInput] = useState<string>("");
  const [tiktokPlayableLiveUrl, setTiktokPlayableLiveUrl] = useState<string>("");
  const [tiktokLiveStudioStatus, setTiktokLiveStudioStatus] = useState<"disconnected" | "attached" | "live">("disconnected");
  const [isAttachingTiktokLive, setIsAttachingTiktokLive] = useState<boolean>(false);
  const [isLoadingTiktokLiveBasicInfo, setIsLoadingTiktokLiveBasicInfo] = useState<boolean>(false);
  const [tiktokLiveBasicInfo, setTiktokLiveBasicInfo] = useState<TiktokLiveBasicInfo | null>(null);

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

    if (managementPlatform === "Tiktok" && !tiktokPlayableLiveUrl) {
      setAppError("Please attach TikTok playable live URL before starting stream.");
      addLog("TikTok live URL required", "Attach TikTok Live Studio playable URL before going live.", {
        platform: managementPlatform,
        result: "error",
        errorCode: "TIKTOK_LIVE_URL_REQUIRED",
      });
      showToast("Attach TikTok live URL first.", "error");
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

      if (managementPlatform === "Tiktok" && tiktokPlayableLiveUrl) {
        setTiktokLiveStudioStatus("live");
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

      if (managementPlatform === "Tiktok") {
        setTiktokLiveStudioStatus(tiktokPlayableLiveUrl ? "attached" : "disconnected");
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

  const isTiktokLiveAttached = Boolean(tiktokPlayableLiveUrl);

  const onAttachTiktokLiveUrl = async () => {
    setAppError("");
    if (managementPlatform !== "Tiktok") return;
    const nextUrl = tiktokPlayableLiveInput.trim();
    const previewSourceType = classifyLivePreviewUrl(nextUrl);

    if (previewSourceType === "invalid" || previewSourceType === "empty") {
      setAppError("Please enter a valid TikTok playable live URL (http/https).");
      showToast("Invalid live URL.", "error");
      return;
    }

    setIsAttachingTiktokLive(true);
    try {
      setTiktokPlayableLiveUrl(nextUrl);
      setTiktokLiveStudioStatus(sessionState === "live" ? "live" : "attached");
      setIsLoadingTiktokLiveBasicInfo(true);

      if (previewSourceType === "video-direct") {
        addLog("TikTok live URL attached", `TikTok Live Studio URL attached: ${nextUrl}`, {
          platform: managementPlatform,
          result: "success",
        });
        showToast("TikTok live URL attached.", "success");
      } else {
        addLog(
          "TikTok live page attached",
          "Attached a TikTok web page URL. In-app direct playback is unavailable; use Open in new tab fallback.",
          {
            platform: managementPlatform,
            result: "info",
          },
        );
        showToast("TikTok live page attached. Use Open in new tab for playback.", "info");
      }

      try {
        const liveInfo = await getTiktokLiveBasicInfo(nextUrl);
        setTiktokLiveBasicInfo(liveInfo);
      } catch {
        setTiktokLiveBasicInfo({
          uniqueId: "",
          liveUrl: nextUrl,
          source: "url-parser",
          status: "error",
          lastCheckedAt: new Date().toLocaleTimeString(),
          error: "Failed to fetch TikTok live basic info.",
        });
      } finally {
        setIsLoadingTiktokLiveBasicInfo(false);
      }
    } finally {
      setIsAttachingTiktokLive(false);
    }
  };

  const onDetachTiktokLiveUrl = () => {
    if (managementPlatform !== "Tiktok") return;
    setTiktokPlayableLiveUrl("");
    setTiktokPlayableLiveInput("");
    setTiktokLiveStudioStatus("disconnected");
    setTiktokLiveBasicInfo(null);
    setIsLoadingTiktokLiveBasicInfo(false);
    addLog("TikTok live URL detached", "TikTok playable live URL removed.", {
      platform: managementPlatform,
      result: "info",
    });
    showToast("TikTok live URL detached.", "info");
  };

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
    tiktokPlayableLiveInput,
    setTiktokPlayableLiveInput,
    tiktokPlayableLiveUrl,
    tiktokLiveStudioStatus,
    isAttachingTiktokLive,
    isLoadingTiktokLiveBasicInfo,
    isTiktokLiveAttached,
    tiktokLiveBasicInfo,
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
