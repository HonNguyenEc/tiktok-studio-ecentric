import { useEffect, useState } from "react";
import type {
  ManagementPlatform,
  MarketplaceShopProfile,
  RealtimeMetrics,
  StreamHealth,
} from "../../../common/type/app.type";
import { getMarketplaceDemoAdapter } from "../../../service/marketplace/adapter/marketplace-demo.adapter";

const REALTIME_SYNC_CONFIG = {
  pollIntervalMs: 5000,
} as const;

type UseMarketplaceLiveSyncHookArgs = {
  managementPlatform: ManagementPlatform;
  addLog: (
    action: string,
    detail: string,
    meta?: {
      platform?: ManagementPlatform;
      result?: "success" | "error" | "info";
      errorCode?: string;
      requestId?: string;
    }
  ) => void;
};

export const useMarketplaceLiveSyncHook = ({ managementPlatform, addLog }: UseMarketplaceLiveSyncHookArgs) => {
  const [marketplaceShopProfile, setMarketplaceShopProfile] = useState<MarketplaceShopProfile | null>(null);
  const [isLoadingMarketplaceShopProfile, setIsLoadingMarketplaceShopProfile] = useState<boolean>(false);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    viewers: 0,
    ordersPerMinute: 0,
    conversionRate: 0,
    gmv: 0,
  });
  const [streamHealth, setStreamHealth] = useState<StreamHealth>({
    connectionStatus: "connected",
    bitrateKbps: 0,
    latencyMs: 0,
    droppedFrames: 0,
    lastSyncAt: "--:--:--",
  });

  useEffect(() => {
    const adapter = getMarketplaceDemoAdapter(managementPlatform);
    let isDisposed = false;

    const loadProfile = async () => {
      setIsLoadingMarketplaceShopProfile(true);

      try {
        const profile = await adapter.getShopProfile();
        if (isDisposed) return;
        setMarketplaceShopProfile(profile);
      } catch {
        if (isDisposed) return;
        setMarketplaceShopProfile(null);
        addLog(`${managementPlatform} profile`, `Failed to load ${managementPlatform} profile from adapter.`, {
          platform: managementPlatform,
          result: "error",
          errorCode: "PROFILE_LOAD_FAILED",
        });
      } finally {
        if (!isDisposed) {
          setIsLoadingMarketplaceShopProfile(false);
        }
      }
    };

    void loadProfile();

    setRealtimeMetrics(adapter.getRealtimeMetrics());
    setStreamHealth(adapter.getStreamHealth());

    const interval = setInterval(() => {
      if (isDisposed) return;
      setRealtimeMetrics(adapter.getRealtimeMetrics());
      setStreamHealth(adapter.getStreamHealth());
    }, REALTIME_SYNC_CONFIG.pollIntervalMs);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [managementPlatform, addLog]);

  return {
    marketplaceShopProfile,
    isLoadingMarketplaceShopProfile,
    realtimeMetrics,
    streamHealth,
  };
};
