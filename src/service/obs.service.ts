import OBSWebSocket from "obs-websocket-js";
import type { ObsConfig, ObsSessionState, PlatformKey } from "../common/type/app.type";

type ObsListener = (state: ObsSessionState) => void;

const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000, 12000];
const MAX_RECONNECT_ATTEMPTS = RECONNECT_DELAYS_MS.length;

type ObsRuntime = {
  client: OBSWebSocket;
  state: ObsSessionState;
  config: ObsConfig;
  reconnectAttempt: number;
  shouldReconnect: boolean;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
};

const runtimeByPlatform = new Map<PlatformKey, ObsRuntime>();
const listenersByPlatform = new Map<PlatformKey, Set<ObsListener>>();
const queueByPlatform = new Map<PlatformKey, Promise<unknown>>();

const emitState = (platform: PlatformKey) => {
  const runtime = runtimeByPlatform.get(platform);
  if (!runtime) return;

  const listeners = listenersByPlatform.get(platform);
  if (!listeners) return;

  listeners.forEach((listener) => listener({ ...runtime.state }));
};

const patchState = (platform: PlatformKey, patch: Partial<ObsSessionState>) => {
  const runtime = runtimeByPlatform.get(platform);
  if (!runtime) return;
  runtime.state = { ...runtime.state, ...patch };
  emitState(platform);
};

const clearReconnectTimer = (runtime: ObsRuntime) => {
  if (!runtime.reconnectTimer) return;
  clearTimeout(runtime.reconnectTimer);
  runtime.reconnectTimer = null;
};

const scheduleReconnect = (platform: PlatformKey, runtime: ObsRuntime) => {
  if (!runtime.shouldReconnect) return;

  if (runtime.reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
    runtime.shouldReconnect = false;
    patchState(platform, {
      connectionStatus: "error",
      lastError: "OBS reconnect limit reached. Please reconnect manually.",
    });
    return;
  }

  const nextAttempt = runtime.reconnectAttempt + 1;
  const delay = RECONNECT_DELAYS_MS[Math.min(runtime.reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];
  runtime.reconnectAttempt = nextAttempt;

  patchState(platform, {
    connectionStatus: "reconnecting",
    lastError: `OBS disconnected. Reconnecting (attempt ${nextAttempt}/${MAX_RECONNECT_ATTEMPTS})...`,
  });
  clearReconnectTimer(runtime);

  runtime.reconnectTimer = setTimeout(() => {
    void runInPlatformQueue(platform, async () => {
      try {
        await runtime.client.connect(runtime.config.url, runtime.config.password || undefined);
      } catch {
        scheduleReconnect(platform, runtime);
      }
    });
  }, delay);
};

const runInPlatformQueue = async <T>(platform: PlatformKey, task: () => Promise<T>): Promise<T> => {
  const previous = queueByPlatform.get(platform) || Promise.resolve();
  const current = previous.then(task, task);
  queueByPlatform.set(platform, current.then(() => undefined, () => undefined));
  return current;
};

const attachObsListeners = (platform: PlatformKey, runtime: ObsRuntime) => {
  runtime.client.on("ConnectionOpened", () => {
    runtime.reconnectAttempt = 0;
    patchState(platform, {
      connectionStatus: "connected",
      lastError: "",
    });
  });

  runtime.client.on("ConnectionClosed", () => {
    patchState(platform, {
      connectionStatus: "disconnected",
      isStreaming: false,
      availableScenes: [],
    });

    if (!runtime.shouldReconnect) {
      return;
    }

    scheduleReconnect(platform, runtime);
  });

  runtime.client.on("CurrentProgramSceneChanged", (event: { sceneName?: string }) => {
    if (!event.sceneName) return;
    patchState(platform, { programSceneName: event.sceneName });
  });

  runtime.client.on("CurrentPreviewSceneChanged", (event: { sceneName?: string }) => {
    if (!event.sceneName) return;
    patchState(platform, { previewSceneName: event.sceneName });
  });

  runtime.client.on("StreamStateChanged", (event: { outputActive?: boolean }) => {
    patchState(platform, { isStreaming: Boolean(event.outputActive) });
  });
};

const getOrCreateRuntime = (platform: PlatformKey, config: ObsConfig): ObsRuntime => {
  const existing = runtimeByPlatform.get(platform);
  if (existing) {
    existing.config = config;
    return existing;
  }

  const runtime: ObsRuntime = {
    client: new OBSWebSocket(),
    config,
    reconnectAttempt: 0,
    shouldReconnect: false,
    reconnectTimer: null,
    state: {
      connectionStatus: "disconnected",
      isStreaming: false,
      programSceneName: "",
      previewSceneName: "",
      availableScenes: [],
      lastError: "",
    },
  };

  attachObsListeners(platform, runtime);
  runtimeByPlatform.set(platform, runtime);
  return runtime;
};

const getRuntimeOrThrow = (platform: PlatformKey): ObsRuntime => {
  const runtime = runtimeByPlatform.get(platform);
  if (!runtime) {
    throw new Error(`OBS runtime is not initialized for ${platform}.`);
  }
  return runtime;
};

export const getObsDefaultConfig = (): ObsConfig => ({
  url: import.meta.env.VITE_OBS_WS_URL || "ws://127.0.0.1:4455",
  password: import.meta.env.VITE_OBS_WS_PASSWORD || "",
});

export const subscribeObsState = (platform: PlatformKey, listener: ObsListener): (() => void) => {
  const listeners = listenersByPlatform.get(platform) || new Set<ObsListener>();
  listeners.add(listener);
  listenersByPlatform.set(platform, listeners);

  const runtime = runtimeByPlatform.get(platform);
  if (runtime) {
    listener({ ...runtime.state });
  }

  return () => {
    const next = listenersByPlatform.get(platform);
    if (!next) return;
    next.delete(listener);
  };
};

export const connectObs = (platform: PlatformKey, config: ObsConfig): Promise<ObsSessionState> => {
  return runInPlatformQueue(platform, async () => {
    const runtime = getOrCreateRuntime(platform, config);
    runtime.config = config;

    if (
      runtime.state.connectionStatus === "connected"
      || runtime.state.connectionStatus === "connecting"
      || runtime.state.connectionStatus === "reconnecting"
    ) {
      return { ...runtime.state };
    }

    clearReconnectTimer(runtime);
    runtime.reconnectAttempt = 0;
    runtime.shouldReconnect = true;
    patchState(platform, { connectionStatus: "connecting", lastError: "" });

    try {
      await runtime.client.connect(config.url, config.password || undefined);
      const streamStatus = await runtime.client.call("GetStreamStatus");
      const scene = await runtime.client.call("GetCurrentProgramScene");
      const sceneList = (await runtime.client.call("GetSceneList")) as {
        scenes?: Array<{ sceneName?: string }>;
      };

      let previewSceneName = "";
      try {
        const previewScene = await runtime.client.call("GetCurrentPreviewScene");
        previewSceneName = previewScene.currentPreviewSceneName || "";
      } catch {
        previewSceneName = "";
      }

      patchState(platform, {
        connectionStatus: "connected",
        isStreaming: Boolean(streamStatus.outputActive),
        programSceneName: scene.currentProgramSceneName || "",
        previewSceneName,
        availableScenes: (sceneList.scenes || [])
          .map((item) => item.sceneName || "")
          .filter((name): name is string => Boolean(name)),
        lastError: "",
      });
      return { ...runtime.state };
    } catch {
      patchState(platform, {
        connectionStatus: "error",
        lastError: "Failed to connect OBS WebSocket.",
      });
      runtime.shouldReconnect = false;
      runtime.reconnectAttempt = 0;
      clearReconnectTimer(runtime);
      throw new Error("Failed to connect OBS WebSocket.");
    }
  });
};

export const disconnectObs = (platform: PlatformKey): Promise<ObsSessionState> => {
  return runInPlatformQueue(platform, async () => {
    const runtime = getRuntimeOrThrow(platform);
    runtime.shouldReconnect = false;
    runtime.reconnectAttempt = 0;
    clearReconnectTimer(runtime);
    runtime.client.disconnect();
    patchState(platform, {
      connectionStatus: "disconnected",
      isStreaming: false,
      availableScenes: [],
      lastError: "",
    });
    return { ...runtime.state };
  });
};

export const startObsStream = (platform: PlatformKey): Promise<ObsSessionState> => {
  return runInPlatformQueue(platform, async () => {
    const runtime = getRuntimeOrThrow(platform);
    await runtime.client.call("StartStream");
    patchState(platform, { isStreaming: true, lastError: "" });
    return { ...runtime.state };
  });
};

export const stopObsStream = (platform: PlatformKey): Promise<ObsSessionState> => {
  return runInPlatformQueue(platform, async () => {
    const runtime = getRuntimeOrThrow(platform);
    await runtime.client.call("StopStream");
    patchState(platform, { isStreaming: false, lastError: "" });
    return { ...runtime.state };
  });
};

export const setObsProgramScene = (platform: PlatformKey, sceneName: string): Promise<ObsSessionState> => {
  return runInPlatformQueue(platform, async () => {
    const runtime = getRuntimeOrThrow(platform);
    await runtime.client.call("SetCurrentProgramScene", { sceneName });
    patchState(platform, { programSceneName: sceneName, lastError: "" });
    return { ...runtime.state };
  });
};
