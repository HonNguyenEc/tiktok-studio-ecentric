import type { ManagementPlatform, MarketplaceShopProfile, RealtimeMetrics, StreamHealth } from "../../../common/type/app.type";
import {
  generateShopeeDemoStreamUrl,
  getShopeeDemoMetrics,
  getShopeeDemoShopProfile,
  getShopeeDemoStreamHealth,
} from "../shopee/shopee-demo.service";
import {
  generateTiktokDemoStreamUrl,
  getTiktokDemoMetrics,
  getTiktokDemoShopProfile,
  getTiktokDemoStreamHealth,
} from "../tiktok/tiktok-demo.service";

type MarketplaceDemoAdapter = {
  getShopProfile: () => Promise<MarketplaceShopProfile>;
  getRealtimeMetrics: () => RealtimeMetrics;
  getStreamHealth: () => StreamHealth;
  generateStreamUrl: () => string;
  getCommentAutoRefreshMs: () => number;
};

const shopeeAdapter: MarketplaceDemoAdapter = {
  getShopProfile: getShopeeDemoShopProfile,
  getRealtimeMetrics: getShopeeDemoMetrics,
  getStreamHealth: getShopeeDemoStreamHealth,
  generateStreamUrl: generateShopeeDemoStreamUrl,
  getCommentAutoRefreshMs: () => 5000,
};

const tiktokAdapter: MarketplaceDemoAdapter = {
  getShopProfile: getTiktokDemoShopProfile,
  getRealtimeMetrics: getTiktokDemoMetrics,
  getStreamHealth: getTiktokDemoStreamHealth,
  generateStreamUrl: generateTiktokDemoStreamUrl,
  getCommentAutoRefreshMs: () => 3500,
};

const adapters: Record<ManagementPlatform, MarketplaceDemoAdapter> = {
  Shopee: shopeeAdapter,
  Tiktok: tiktokAdapter,
};

export const getMarketplaceDemoAdapter = (platform: ManagementPlatform): MarketplaceDemoAdapter => {
  return adapters[platform];
};
