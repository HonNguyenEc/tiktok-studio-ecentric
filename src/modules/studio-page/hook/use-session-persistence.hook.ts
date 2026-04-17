import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import type { ObsConfig, ObsSessionState, PlatformKey, SessionState } from "../../../common/type/app.type";
import { obsConfigStorageKeyByPlatform, sessionStorageKeyByPlatform } from "../../../common/util/platform.util";
import {
  getDefaultObsState,
  loadPersistedObsConfig,
  loadPersistedSession,
  type PersistedSession,
} from "../util/session-storage.util";

type UseSessionPersistenceHookArgs = {
  platformKey: PlatformKey;
  sessionState: SessionState;
  sessionLifecycleState: SessionState;
  coverPreview: string;
  streamUrl: string;
  scheduleStart: string;
  scheduleEnd: string;
  obsConfig: ObsConfig;
  setSessionState: Dispatch<SetStateAction<SessionState>>;
  setSessionLifecycleState: Dispatch<SetStateAction<SessionState>>;
  setCoverPreview: Dispatch<SetStateAction<string>>;
  setStreamUrl: Dispatch<SetStateAction<string>>;
  setScheduleStart: Dispatch<SetStateAction<string>>;
  setScheduleEnd: Dispatch<SetStateAction<string>>;
  setObsConfig: Dispatch<SetStateAction<ObsConfig>>;
  setObsSessionState: Dispatch<SetStateAction<ObsSessionState>>;
  setObsSceneDraft: Dispatch<SetStateAction<string>>;
};

export const useSessionPersistenceHook = ({
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
}: UseSessionPersistenceHookArgs) => {
  const platformRef = useRef<PlatformKey>(platformKey);
  const sessionSnapshotRef = useRef<PersistedSession>(loadPersistedSession(platformKey));
  const obsConfigRef = useRef<ObsConfig>(obsConfig);
  const skipNextSessionPersistRef = useRef<boolean>(true);
  const skipNextObsConfigPersistRef = useRef<boolean>(true);

  useEffect(() => {
    sessionSnapshotRef.current = {
      sessionState,
      sessionLifecycleState,
      coverPreview,
      streamUrl,
      scheduleStart,
      scheduleEnd,
    };
    obsConfigRef.current = obsConfig;
  }, [sessionState, sessionLifecycleState, coverPreview, streamUrl, scheduleStart, scheduleEnd, obsConfig]);

  useEffect(() => {
    const previousKey = platformRef.current;
    if (previousKey !== platformKey) {
      sessionStorage.setItem(sessionStorageKeyByPlatform[previousKey], JSON.stringify(sessionSnapshotRef.current));
      localStorage.setItem(obsConfigStorageKeyByPlatform[previousKey], JSON.stringify(obsConfigRef.current));
    }

    const loadedSession = loadPersistedSession(platformKey);
    const loadedObsConfig = loadPersistedObsConfig(platformKey);

    skipNextSessionPersistRef.current = true;
    skipNextObsConfigPersistRef.current = true;

    sessionSnapshotRef.current = loadedSession;
    obsConfigRef.current = loadedObsConfig;

    setSessionState(loadedSession.sessionState);
    setSessionLifecycleState(loadedSession.sessionLifecycleState);
    setCoverPreview(loadedSession.coverPreview);
    setStreamUrl(loadedSession.streamUrl);
    setScheduleStart(loadedSession.scheduleStart);
    setScheduleEnd(loadedSession.scheduleEnd);
    setObsConfig(loadedObsConfig);
    setObsSessionState(getDefaultObsState());
    setObsSceneDraft("");

    platformRef.current = platformKey;
  }, [
    platformKey,
    setSessionState,
    setSessionLifecycleState,
    setCoverPreview,
    setStreamUrl,
    setScheduleStart,
    setScheduleEnd,
    setObsConfig,
    setObsSessionState,
    setObsSceneDraft,
  ]);

  useEffect(() => {
    if (skipNextSessionPersistRef.current) {
      skipNextSessionPersistRef.current = false;
      return;
    }

    const snapshot: PersistedSession = {
      sessionState,
      sessionLifecycleState,
      coverPreview,
      streamUrl,
      scheduleStart,
      scheduleEnd,
    };
    sessionStorage.setItem(sessionStorageKeyByPlatform[platformKey], JSON.stringify(snapshot));
  }, [platformKey, sessionState, sessionLifecycleState, coverPreview, streamUrl, scheduleStart, scheduleEnd]);

  useEffect(() => {
    if (skipNextObsConfigPersistRef.current) {
      skipNextObsConfigPersistRef.current = false;
      return;
    }

    localStorage.setItem(obsConfigStorageKeyByPlatform[platformKey], JSON.stringify(obsConfig));
  }, [platformKey, obsConfig]);
};
