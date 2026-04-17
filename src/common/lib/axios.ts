import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { refreshShopeeAccessToken } from "../../service/marketplace/shopee/shopee-auth.service";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
};

type ShopeeErrorPayload = {
  error?: string;
  message?: string;
};

const MAX_TOKEN_RETRY = 3;
const SHOPEE_REFRESH_PATH = "/api/v2/auth/access_token/get";

let accessToken = import.meta.env.VITE_SHOPEE_ACCESS_TOKEN || "";
let refreshToken = import.meta.env.VITE_SHOPEE_REFRESH_TOKEN || "";

let isRefreshing = false;
let waitingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (nextAccessToken: string | null, error: unknown = null) => {
  waitingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    if (!nextAccessToken) {
      reject(new Error("Missing refreshed access token."));
      return;
    }

    resolve(nextAccessToken);
  });

  waitingQueue = [];
};

const isInvalidAccessTokenError = (error: AxiosError): boolean => {
  const requestUrl = error.config?.url || "";
  const isShopeeApiRequest = requestUrl.includes("/api/v2/");
  const isRefreshEndpoint = requestUrl.includes(SHOPEE_REFRESH_PATH);

  if (!isShopeeApiRequest || isRefreshEndpoint) {
    return false;
  }

  const status = error.response?.status;
  if (status === 401) return true;
  if (status !== 403) return false;

  // Shopee may return different error payload formats for 403,
  // so for Shopee API calls we treat 403 as token-invalid by default.
  const payload = (error.response?.data || {}) as ShopeeErrorPayload;
  const errorCode = (payload.error || "").toLowerCase();
  const message = (payload.message || "").toLowerCase();

  if (!errorCode && !message) {
    return true;
  }

  return (
    errorCode.includes("invalid") ||
    errorCode.includes("invalid_access_token") ||
    errorCode.includes("invalid_acceess_token") ||
    message.includes("invalid access_token") ||
    message.includes("access token")
  );
};

export const setMarketplaceTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
};

export const getMarketplaceAccessToken = (): string => accessToken;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: Number(import.meta.env.VITE_SHOPEE_TIMEOUT_MS || 15000),
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = config;
  if (accessToken) {
    nextConfig.headers.Authorization = `Bearer ${accessToken}`;
  }
  return nextConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (import.meta.env.DEV) {
      console.debug("[axios-interceptor] response error", {
        url: originalRequest?.url,
        status: error.response?.status,
        retryCount: originalRequest?._retryCount || 0,
      });
    }

    if (!originalRequest || !isInvalidAccessTokenError(error)) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
    if (originalRequest._retryCount > MAX_TOKEN_RETRY) {
      if (import.meta.env.DEV) {
        console.warn("[axios-interceptor] max token retry reached", {
          url: originalRequest.url,
          retryCount: originalRequest._retryCount,
        });
      }
      return Promise.reject(error);
    }

    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitingQueue.push({
          resolve: (nextToken) => {
            originalRequest.headers.Authorization = `Bearer ${nextToken}`;
            if (import.meta.env.DEV) {
              console.debug("[axios-interceptor] resume queued request", {
                url: originalRequest.url,
                retryCount: originalRequest._retryCount,
              });
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      if (import.meta.env.DEV) {
        console.debug("[axios-interceptor] refreshing token", {
          url: originalRequest.url,
          retryCount: originalRequest._retryCount,
        });
      }

      const refreshed = await refreshShopeeAccessToken(refreshToken);
      setMarketplaceTokens(refreshed);
      processQueue(refreshed.accessToken);
      originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      setMarketplaceTokens({ accessToken: "", refreshToken: "" });
      processQueue(null, refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
