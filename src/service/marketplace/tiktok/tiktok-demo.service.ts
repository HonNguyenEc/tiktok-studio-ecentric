import type { MarketplaceShopProfile, RealtimeMetrics, StreamHealth } from "../../../common/type/app.type";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let tiktokMetricsState: RealtimeMetrics = {
  viewers: 80,
  ordersPerMinute: 4,
  conversionRate: 7.5,
  gmv: 41000000,
};

let tiktokHealthState: StreamHealth = {
  connectionStatus: "connected",
  bitrateKbps: 4200,
  latencyMs: 1180,
  droppedFrames: 3,
  lastSyncAt: new Date().toLocaleTimeString(),
};

const TIKTOK_METRICS_CONFIG = {
  viewersDelta: { min: -4, max: 5 },
  ordersPerMinuteDelta: { min: -1, max: 1, step: 0.1 },
  conversionDelta: { min: -1, max: 1, step: 0.015 },
  // Keep realistic movement per 5s tick: mostly up, occasionally a small dip.
  gmvDelta: { min: -6000, max: 90000 },
  smoothing: {
    viewers: 0.12,
    ordersPerMinute: 0.14,
    conversion: 0.12,
    gmv: 0.08,
  },
} as const;

const TIKTOK_HEALTH_CONFIG = {
  statusTransitionProbability: {
    connectedToLimited: 0.015,
    limitedToDisconnected: 0.015,
    limitedToConnected: 0.09,
    disconnectedToLimited: 0.1,
  },
  bitrateDelta: { min: -18, max: 24 },
  latencyDelta: { min: -12, max: 18 },
  droppedFramesDelta: { min: 0, max: 1 },
  smoothing: {
    bitrate: 0.12,
    latency: 0.12,
    droppedFrames: 0.12,
  },
} as const;

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const randomDelta = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const smoothValue = (current: number, target: number, factor: number): number => {
  return current + (target - current) * factor;
};

export const getTiktokDemoShopProfile = async (): Promise<MarketplaceShopProfile> => {
  await delay(3600 + Math.floor(Math.random() * 4600));

  if (Math.random() < 0.06) {
    throw new Error("TikTok profile service timeout.");
  }

  return {
    shopName: "Ecentric AI Studio TikTok Creator Shop",
    description: "Profile - short-form traffic boosted livestream campaign.",
    shopLogo: "",
  };
};

export const getTiktokDemoMetrics = (): RealtimeMetrics => {
  const nextViewersRaw = clamp(
    tiktokMetricsState.viewers + randomDelta(TIKTOK_METRICS_CONFIG.viewersDelta.min, TIKTOK_METRICS_CONFIG.viewersDelta.max),
    520,
    1520,
  );
  const nextOrdersRaw = clamp(
    tiktokMetricsState.ordersPerMinute
      + randomDelta(TIKTOK_METRICS_CONFIG.ordersPerMinuteDelta.min, TIKTOK_METRICS_CONFIG.ordersPerMinuteDelta.max)
      * TIKTOK_METRICS_CONFIG.ordersPerMinuteDelta.step,
    1.4,
    5.2,
  );
  const nextConversionRaw = clamp(
    tiktokMetricsState.conversionRate
      + randomDelta(TIKTOK_METRICS_CONFIG.conversionDelta.min, TIKTOK_METRICS_CONFIG.conversionDelta.max)
      * TIKTOK_METRICS_CONFIG.conversionDelta.step,
    1.0,
    3.4,
  );
  const nextGmvRaw = clamp(
    tiktokMetricsState.gmv + randomDelta(TIKTOK_METRICS_CONFIG.gmvDelta.min, TIKTOK_METRICS_CONFIG.gmvDelta.max),
    35000000,
    120000000,
  );

  tiktokMetricsState = {
    viewers: Math.round(smoothValue(tiktokMetricsState.viewers, nextViewersRaw, TIKTOK_METRICS_CONFIG.smoothing.viewers)),
    ordersPerMinute: Number(
      smoothValue(tiktokMetricsState.ordersPerMinute, nextOrdersRaw, TIKTOK_METRICS_CONFIG.smoothing.ordersPerMinute).toFixed(1),
    ),
    conversionRate: Number(
      smoothValue(tiktokMetricsState.conversionRate, nextConversionRaw, TIKTOK_METRICS_CONFIG.smoothing.conversion).toFixed(2),
    ),
    gmv: Math.round(smoothValue(tiktokMetricsState.gmv, nextGmvRaw, TIKTOK_METRICS_CONFIG.smoothing.gmv)),
  };

  return tiktokMetricsState;
};

export const getTiktokDemoStreamHealth = (): StreamHealth => {
  if (
    tiktokHealthState.connectionStatus === "connected"
    && Math.random() < TIKTOK_HEALTH_CONFIG.statusTransitionProbability.connectedToLimited
  ) {
    tiktokHealthState.connectionStatus = "limited";
  } else if (tiktokHealthState.connectionStatus === "limited") {
    if (Math.random() < TIKTOK_HEALTH_CONFIG.statusTransitionProbability.limitedToDisconnected) {
      tiktokHealthState.connectionStatus = "disconnected";
    } else if (Math.random() < TIKTOK_HEALTH_CONFIG.statusTransitionProbability.limitedToConnected) {
      tiktokHealthState.connectionStatus = "connected";
    }
  } else if (
    tiktokHealthState.connectionStatus === "disconnected"
    && Math.random() < TIKTOK_HEALTH_CONFIG.statusTransitionProbability.disconnectedToLimited
  ) {
    tiktokHealthState.connectionStatus = "limited";
  }

  const nextBitrateRaw = clamp(
    tiktokHealthState.bitrateKbps + randomDelta(TIKTOK_HEALTH_CONFIG.bitrateDelta.min, TIKTOK_HEALTH_CONFIG.bitrateDelta.max),
    3200,
    5400,
  );
  const nextLatencyRaw = clamp(
    tiktokHealthState.latencyMs + randomDelta(TIKTOK_HEALTH_CONFIG.latencyDelta.min, TIKTOK_HEALTH_CONFIG.latencyDelta.max),
    850,
    2400,
  );
  const nextDroppedRaw = clamp(
    tiktokHealthState.droppedFrames
      + randomDelta(TIKTOK_HEALTH_CONFIG.droppedFramesDelta.min, TIKTOK_HEALTH_CONFIG.droppedFramesDelta.max),
    0,
    32,
  );

  tiktokHealthState = {
    connectionStatus: tiktokHealthState.connectionStatus,
    bitrateKbps: Math.round(
      smoothValue(tiktokHealthState.bitrateKbps, nextBitrateRaw, TIKTOK_HEALTH_CONFIG.smoothing.bitrate),
    ),
    latencyMs: Math.round(smoothValue(tiktokHealthState.latencyMs, nextLatencyRaw, TIKTOK_HEALTH_CONFIG.smoothing.latency)),
    droppedFrames: Math.round(
      smoothValue(tiktokHealthState.droppedFrames, nextDroppedRaw, TIKTOK_HEALTH_CONFIG.smoothing.droppedFrames),
    ),
    lastSyncAt: new Date().toLocaleTimeString(),
  };

  return tiktokHealthState;
};

export const generateTiktokDemoStreamUrl = (): string => {
  return `rtmp://tiktok-live.local/session/${Math.random().toString(36).slice(2, 10)}`;
};
