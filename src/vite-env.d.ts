/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_SHOPEE_HOST: string;
  readonly VITE_SHOPEE_PARTNER_ID: string;
  readonly VITE_SHOPEE_PARTNER_KEY: string;
  readonly VITE_SHOPEE_SHOP_ID: string;
  readonly VITE_SHOPEE_ACCESS_TOKEN: string;
  readonly VITE_SHOPEE_REFRESH_TOKEN: string;
  readonly VITE_SHOPEE_TIMEOUT_MS?: string;
  readonly VITE_TIKTOK_POLL_ENDPOINT?: string;
  readonly VITE_TIKTOK_POLL_INTERVAL_MS?: string;
  readonly VITE_TIKTOK_SOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
