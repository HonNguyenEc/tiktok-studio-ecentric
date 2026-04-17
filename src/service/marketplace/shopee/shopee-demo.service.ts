import type { MarketplaceShopProfile, RealtimeMetrics, StreamHealth } from "../../../common/type/app.type";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let shopeeMetricsState: RealtimeMetrics = {
  viewers: 100,
  ordersPerMinute: 8,
  conversionRate: 8.1,
  gmv: 32000000,
};

let shopeeHealthState: StreamHealth = {
  connectionStatus: "connected",
  bitrateKbps: 4700,
  latencyMs: 1280,
  droppedFrames: 2,
  lastSyncAt: new Date().toLocaleTimeString(),
};

const SHOPEE_METRICS_CONFIG = {
  viewersDelta: { min: -3, max: 4 },
  ordersPerMinuteDelta: { min: -1, max: 1, step: 0.1 },
  conversionDelta: { min: -1, max: 1, step: 0.02 },
  // Keep realistic movement per 5s tick: mostly up, occasionally a small dip.
  gmvDelta: { min: -5000, max: 70000 },
  smoothing: {
    viewers: 0.1,
    ordersPerMinute: 0.14,
    conversion: 0.12,
    gmv: 0.08,
  },
} as const;

const SHOPEE_HEALTH_CONFIG = {
  statusTransitionProbability: {
    connectedToLimited: 0.01,
    limitedToConnected: 0.08,
  },
  bitrateDelta: { min: -14, max: 20 },
  latencyDelta: { min: -10, max: 16 },
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

export const getShopeeDemoShopProfile = async (): Promise<MarketplaceShopProfile> => {
  await delay(420 + Math.floor(Math.random() * 520));

  if (Math.random() < 0.08) {
    throw new Error("Shopee profile is temporarily unavailable.");
  }

  return {
    shopName: "Ecentric AI Studio Shopee Flagship",
    description: "Profile - campaign oriented catalog for livestream conversion review.",
    shopLogo: "",
  };
};

export const getShopeeDemoMetrics = (): RealtimeMetrics => {
  const nextViewersRaw = clamp(
    shopeeMetricsState.viewers + randomDelta(SHOPEE_METRICS_CONFIG.viewersDelta.min, SHOPEE_METRICS_CONFIG.viewersDelta.max),
    380,
    980,
  );
  const nextOrdersRaw = clamp(
    shopeeMetricsState.ordersPerMinute
      + randomDelta(SHOPEE_METRICS_CONFIG.ordersPerMinuteDelta.min, SHOPEE_METRICS_CONFIG.ordersPerMinuteDelta.max)
      * SHOPEE_METRICS_CONFIG.ordersPerMinuteDelta.step,
    2.1,
    5.6,
  );
  const nextConversionRaw = clamp(
    shopeeMetricsState.conversionRate
      + randomDelta(SHOPEE_METRICS_CONFIG.conversionDelta.min, SHOPEE_METRICS_CONFIG.conversionDelta.max)
      * SHOPEE_METRICS_CONFIG.conversionDelta.step,
    1.6,
    4.5,
  );
  const nextGmvRaw = clamp(
    shopeeMetricsState.gmv + randomDelta(SHOPEE_METRICS_CONFIG.gmvDelta.min, SHOPEE_METRICS_CONFIG.gmvDelta.max),
    28000000,
    90000000,
  );

  shopeeMetricsState = {
    viewers: Math.round(smoothValue(shopeeMetricsState.viewers, nextViewersRaw, SHOPEE_METRICS_CONFIG.smoothing.viewers)),
    ordersPerMinute: Number(
      smoothValue(shopeeMetricsState.ordersPerMinute, nextOrdersRaw, SHOPEE_METRICS_CONFIG.smoothing.ordersPerMinute).toFixed(1),
    ),
    conversionRate: Number(
      smoothValue(shopeeMetricsState.conversionRate, nextConversionRaw, SHOPEE_METRICS_CONFIG.smoothing.conversion).toFixed(2),
    ),
    gmv: Math.round(smoothValue(shopeeMetricsState.gmv, nextGmvRaw, SHOPEE_METRICS_CONFIG.smoothing.gmv)),
  };

  return shopeeMetricsState;
};

export const getShopeeDemoStreamHealth = (): StreamHealth => {
  // Keep status stable most of the time to avoid noisy/flapping UI.
  if (
    shopeeHealthState.connectionStatus === "connected"
    && Math.random() < SHOPEE_HEALTH_CONFIG.statusTransitionProbability.connectedToLimited
  ) {
    shopeeHealthState.connectionStatus = "limited";
  } else if (
    shopeeHealthState.connectionStatus === "limited"
    && Math.random() < SHOPEE_HEALTH_CONFIG.statusTransitionProbability.limitedToConnected
  ) {
    shopeeHealthState.connectionStatus = "connected";
  }

  const nextBitrateRaw = clamp(
    shopeeHealthState.bitrateKbps + randomDelta(SHOPEE_HEALTH_CONFIG.bitrateDelta.min, SHOPEE_HEALTH_CONFIG.bitrateDelta.max),
    3900,
    5600,
  );
  const nextLatencyRaw = clamp(
    shopeeHealthState.latencyMs + randomDelta(SHOPEE_HEALTH_CONFIG.latencyDelta.min, SHOPEE_HEALTH_CONFIG.latencyDelta.max),
    900,
    2200,
  );
  const nextDroppedRaw = clamp(
    shopeeHealthState.droppedFrames
      + randomDelta(SHOPEE_HEALTH_CONFIG.droppedFramesDelta.min, SHOPEE_HEALTH_CONFIG.droppedFramesDelta.max),
    0,
    24,
  );

  shopeeHealthState = {
    connectionStatus: shopeeHealthState.connectionStatus,
    bitrateKbps: Math.round(
      smoothValue(shopeeHealthState.bitrateKbps, nextBitrateRaw, SHOPEE_HEALTH_CONFIG.smoothing.bitrate),
    ),
    latencyMs: Math.round(smoothValue(shopeeHealthState.latencyMs, nextLatencyRaw, SHOPEE_HEALTH_CONFIG.smoothing.latency)),
    droppedFrames: Math.round(
      smoothValue(shopeeHealthState.droppedFrames, nextDroppedRaw, SHOPEE_HEALTH_CONFIG.smoothing.droppedFrames),
    ),
    lastSyncAt: new Date().toLocaleTimeString(),
  };

  return shopeeHealthState;
};

export const generateShopeeDemoStreamUrl = (): string => {
  return `rtmp://shopee-live.local/session/${Math.random().toString(36).slice(2, 10)}`;
};
