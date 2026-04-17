import type { ManagementPlatform, ShopInfo } from "../type/app.type";
import { shopeeBrandShopInfo } from "../../data/shopee/brand/shop-info.data";
import { tiktokBrandShopInfo } from "../../data/tiktok/brand/shop-info.data";

export const shopInfoByPlatform: Record<ManagementPlatform, ShopInfo> = {
  Shopee: shopeeBrandShopInfo,
  Tiktok: tiktokBrandShopInfo,
};
