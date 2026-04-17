import axios from "axios";
import { createShopeeSign, getUnixTimestamp } from "../../../common/util/shopee-sign.util";

type ShopeeRefreshResponse = {
  access_token?: string;
  refresh_token?: string;
  request_id?: string;
  error?: string;
  message?: string;
};

type RefreshedTokenPayload = {
  accessToken: string;
  refreshToken: string;
};

const getRequiredEnv = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
};

export const refreshShopeeAccessToken = async (refreshToken: string): Promise<RefreshedTokenPayload> => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SHOPEE_HOST || "/api";
  const partnerId = getRequiredEnv("VITE_SHOPEE_PARTNER_ID");
  const partnerKey = getRequiredEnv("VITE_SHOPEE_PARTNER_KEY");
  const shopId = getRequiredEnv("VITE_SHOPEE_SHOP_ID");

  const path = "/api/v2/auth/access_token/get";
  const timestamp = getUnixTimestamp();
  const baseString = `${partnerId}${path}${timestamp}`;
  const sign = await createShopeeSign(partnerKey, baseString);

  const response = await axios.post<ShopeeRefreshResponse>(
    path,
    {
      shop_id: Number(shopId),
      partner_id: Number(partnerId),
      refresh_token: refreshToken,
    },
    {
      baseURL: apiBaseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        partner_id: partnerId,
        timestamp,
        sign,
      },
    }
  );

  const nextAccessToken = response.data.access_token;
  const nextRefreshToken = response.data.refresh_token;

  if (!nextAccessToken || !nextRefreshToken) {
    const errorMessage = response.data.message || response.data.error || "Failed to refresh Shopee token.";
    throw new Error(errorMessage);
  }

  return {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  };
};
