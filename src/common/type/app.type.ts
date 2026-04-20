export type SessionState = "draft" | "created" | "scheduled" | "live" | "ended";
export type ActiveTab = "overview" | "products" | "comments" | "report";
export type ManagementPlatform = "Shopee" | "Tiktok";
export type PlatformKey = "shopee" | "tiktok";
export type CommentSentiment = "positive" | "neutral" | "question";
export type DemoConnectionStatus = "connected" | "limited" | "disconnected";
export type ObsConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting" | "error";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export type DemoAccount = {
  id: number;
  role: string;
  email: string;
  password: string;
  name: string;
  shopName: string;
};

export type CommentItem = {
  id: number;
  user: string;
  text: string;
  time: string;
  platform?: ManagementPlatform;
  sentiment?: CommentSentiment;
};

export type LogItem = {
  id: number;
  action: string;
  detail: string;
  time: string;
  platform?: ManagementPlatform;
  result?: "success" | "error" | "info";
  errorCode?: string;
  requestId?: string;
};

export type ObsConfig = {
  url: string;
  password: string;
};

export type ObsSessionState = {
  connectionStatus: ObsConnectionStatus;
  programSceneName: string;
  previewSceneName: string;
  availableScenes: string[];
  isStreaming: boolean;
  lastError: string;
};

export type ShopInfo = {
  name: string;
  id: string;
  region: string;
  mode: string;
};

export type MarketplaceShopProfile = {
  shopName: string;
  description: string;
  shopLogo: string;
};

export type RealtimeMetrics = {
  viewers: number;
  ordersPerMinute: number;
  conversionRate: number;
  gmv: number;
};

export type StreamHealth = {
  connectionStatus: DemoConnectionStatus;
  bitrateKbps: number;
  latencyMs: number;
  droppedFrames: number;
  lastSyncAt: string;
};

export type TiktokLiveBasicInfo = {
  uniqueId: string;
  liveUrl: string;
  source: "tiktokconnector" | "oembed" | "url-parser";
  status: "live" | "offline" | "unknown" | "error";
  roomId?: string;
  title?: string;
  ownerNickname?: string;
  viewerCount?: number;
  lastCheckedAt: string;
  error?: string;
};

export type TiktokLiveConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type TiktokGiftEvent = {
  id: string;
  username: string;
  giftName: string;
  repeatCount: number;
  timestamp: string;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type ToastState = {
  message: string;
  type: "success" | "error" | "info";
};
