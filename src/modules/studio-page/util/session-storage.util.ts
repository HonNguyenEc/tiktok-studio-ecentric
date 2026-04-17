import type { ObsConfig, ObsSessionState, PlatformKey, SessionState } from "../../../common/type/app.type";
import { obsConfigStorageKeyByPlatform, sessionStorageKeyByPlatform } from "../../../common/util/platform.util";
import { getObsDefaultConfig } from "../../../service/obs.service";

export type PersistedSession = {
  sessionState: SessionState;
  sessionLifecycleState: SessionState;
  coverPreview: string;
  streamUrl: string;
  scheduleStart: string;
  scheduleEnd: string;
};

export const getDefaultObsState = (): ObsSessionState => ({
  connectionStatus: "disconnected",
  isStreaming: false,
  programSceneName: "",
  previewSceneName: "",
  availableScenes: [],
  lastError: "",
});

export const getDefaultPersistedSession = (): PersistedSession => ({
  sessionState: "draft",
  sessionLifecycleState: "draft",
  coverPreview: "",
  streamUrl: "",
  scheduleStart: "",
  scheduleEnd: "",
});

export const loadPersistedSession = (platformKey: PlatformKey): PersistedSession => {
  const storageKey = sessionStorageKeyByPlatform[platformKey];
  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return getDefaultPersistedSession();

  try {
    return {
      ...getDefaultPersistedSession(),
      ...(JSON.parse(raw) as Partial<PersistedSession>),
    };
  } catch {
    return getDefaultPersistedSession();
  }
};

export const loadPersistedObsConfig = (platformKey: PlatformKey): ObsConfig => {
  const fallback = getObsDefaultConfig();
  const raw = localStorage.getItem(obsConfigStorageKeyByPlatform[platformKey]);
  if (!raw) return fallback;

  try {
    return {
      ...fallback,
      ...(JSON.parse(raw) as Partial<ObsConfig>),
    };
  } catch {
    return fallback;
  }
};