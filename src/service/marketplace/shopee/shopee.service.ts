import { apiClient, getMarketplaceAccessToken } from "../../../common/lib/axios";
import { createShopeeSign, getUnixTimestamp } from "../../../common/util/shopee-sign.util";
import type { MarketplaceShopProfile } from "../../../common/type/app.type";

type ShopeeEnvelope<T> = {
  message: string;
  request_id: string;
  error: string;
  response: T;
};

type ShopeeShopProfileResponse = {
  shop_logo: string;
  description: string;
  shop_name: string;
};

const getRequiredEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

export const getShopeeShopProfile = async (): Promise<MarketplaceShopProfile> => {
  const partnerId = getRequiredEnv("VITE_SHOPEE_PARTNER_ID");
  const partnerKey = getRequiredEnv("VITE_SHOPEE_PARTNER_KEY");
  const shopId = getRequiredEnv("VITE_SHOPEE_SHOP_ID");
  const path = "/api/v2/shop/get_profile";
  // const path = "/api/v2/shop/get_shop_info";
  const timestamp = getUnixTimestamp();

  const activeAccessToken = getMarketplaceAccessToken() || getRequiredEnv("VITE_SHOPEE_ACCESS_TOKEN");
  const baseString = `${partnerId}${path}${timestamp}${activeAccessToken}${shopId}`;
  const sign = await createShopeeSign(partnerKey, baseString);

  const response = await apiClient.get<ShopeeEnvelope<ShopeeShopProfileResponse>>(path, {
    params: {
      access_token: activeAccessToken,
      partner_id: partnerId,
      shop_id: shopId,
      sign,
      timestamp,
    },
  });

  if (response.data.error) {
    throw new Error(response.data.message || response.data.error);
  }

  const profile = response.data.response;

  return {
    shopName: profile.shop_name,
    description: profile.description,
    shopLogo: profile.shop_logo,
  };
};
