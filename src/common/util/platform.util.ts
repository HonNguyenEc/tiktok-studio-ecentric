import type { ManagementPlatform, PlatformKey } from "../type/app.type";

export const toPlatformKey = (platform: ManagementPlatform): PlatformKey =>
  platform === "Shopee" ? "shopee" : "tiktok";

export const sessionStorageKeyByPlatform: Record<PlatformKey, string> = {
  shopee: "live_session_shopee",
  tiktok: "live_session_tiktok",
};

export const obsConfigStorageKeyByPlatform: Record<PlatformKey, string> = {
  shopee: "obs_config_shopee",
  tiktok: "obs_config_tiktok",
};
