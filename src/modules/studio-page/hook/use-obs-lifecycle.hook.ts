import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ManagementPlatform, ObsConfig, ObsSessionState, PlatformKey } from "../../../common/type/app.type";
import { connectObs, disconnectObs, setObsProgramScene, subscribeObsState } from "../../../service/obs.service";
import { createRequestId } from "../util/action-control.util";

type UseObsLifecycleHookArgs = {
  platformKey: PlatformKey;
  managementPlatform: ManagementPlatform;
  obsConfig: ObsConfig;
  setObsConfig: Dispatch<SetStateAction<ObsConfig>>;
  obsSceneDraft: string;
  setObsSceneDraft: Dispatch<SetStateAction<string>>;
  setAppError: (message: string) => void;
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
};

export const useObsLifecycleHook = ({
  platformKey,
  managementPlatform,
  obsConfig,
  setObsConfig,
  obsSceneDraft,
  setObsSceneDraft,
  setAppError,
  addLog,
  showToast,
}: UseObsLifecycleHookArgs) => {
  const [obsSessionState, setObsSessionState] = useState<ObsSessionState>({
    connectionStatus: "disconnected",
    isStreaming: false,
    programSceneName: "",
    previewSceneName: "",
    availableScenes: [],
    lastError: "",
  });
  const [isConnectingObs, setIsConnectingObs] = useState<boolean>(false);
  const [isSwitchingScene, setIsSwitchingScene] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeObsState(platformKey, setObsSessionState);
    return () => unsubscribe();
  }, [platformKey]);

  const onConnectObs = async () => {
    setAppError("");
    const requestId = createRequestId();
    setIsConnectingObs(true);

    try {
      const nextObsState = await connectObs(platformKey, obsConfig);
      setObsSceneDraft(nextObsState.programSceneName || "");
      addLog("OBS connected", `${managementPlatform} OBS connection established at ${obsConfig.url}.`, {
        platform: managementPlatform,
        result: "success",
        requestId,
      });
      showToast("OBS connected.", "success");
    } catch {
      setAppError("Failed to connect OBS WebSocket.");
      addLog("OBS connect failed", `Unable to connect ${managementPlatform} OBS endpoint ${obsConfig.url}.`, {
        platform: managementPlatform,
        result: "error",
        errorCode: "OBS_CONNECT_FAILED",
        requestId,
      });
      showToast("OBS connect failed.", "error");
    } finally {
      setIsConnectingObs(false);
    }
  };

  const onDisconnectObs = async () => {
    setAppError("");
    const requestId = createRequestId();

    try {
      await disconnectObs(platformKey);
      setObsSceneDraft("");
      addLog("OBS disconnected", `${managementPlatform} OBS connection closed.`, {
        platform: managementPlatform,
        result: "info",
        requestId,
      });
      showToast("OBS disconnected.", "info");
    } catch {
      setAppError("Failed to disconnect OBS.");
      addLog("OBS disconnect failed", `Unable to disconnect ${managementPlatform} OBS connection safely.`, {
        platform: managementPlatform,
        result: "error",
        errorCode: "OBS_DISCONNECT_FAILED",
        requestId,
      });
    }
  };

  const onSwitchObsScene = async () => {
    setAppError("");
    const targetSceneName = obsSceneDraft.trim();
    if (!obsConfig.url || !targetSceneName) {
      setAppError("Please provide a valid OBS scene name.");
      return;
    }

    const requestId = createRequestId();
    setIsSwitchingScene(true);

    try {
      await setObsProgramScene(platformKey, targetSceneName);
      setObsSceneDraft(targetSceneName);
      addLog("OBS scene switched", `Program scene switched to ${targetSceneName}.`, {
        platform: managementPlatform,
        result: "success",
        requestId,
      });
      showToast("OBS scene switched.", "success");
    } catch {
      setAppError("Failed to switch OBS scene.");
      addLog("OBS switch scene failed", `Unable to set scene ${targetSceneName}.`, {
        platform: managementPlatform,
        result: "error",
        errorCode: "OBS_SWITCH_SCENE_FAILED",
        requestId,
      });
    } finally {
      setIsSwitchingScene(false);
    }
  };

  const onObsSceneNameChange = (sceneName: string) => {
    setObsSceneDraft(sceneName);
  };

  const onObsConfigChange = (patch: Partial<ObsConfig>) => {
    setObsConfig((prev) => ({ ...prev, ...patch }));
  };

  return {
    obsSessionState,
    setObsSessionState,
    isConnectingObs,
    isSwitchingScene,
    onConnectObs,
    onDisconnectObs,
    onSwitchObsScene,
    onObsSceneNameChange,
    onObsConfigChange,
  };
};
