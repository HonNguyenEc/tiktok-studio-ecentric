import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import type {
  CommentItem,
  DemoAccount,
  LogItem,
  ManagementPlatform,
  MarketplaceShopProfile,
  ObsConfig,
  ObsSessionState,
  Product,
  RealtimeMetrics,
  SessionState,
  ShopInfo,
  StreamHealth,
  TiktokLiveBasicInfo,
} from "../../common/type/app.type";

export type OverviewTabProps = {
  isCreatingSession: boolean;
  isGeneratingUrl: boolean;
  isStartingStream: boolean;
  isEndingStream: boolean;
  isConnectingObs: boolean;
  isSwitchingScene: boolean;
  coverPreview: string;
  onCoverChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sessionState: SessionState;
  onCreateSession: () => void;
  onStartStream: () => void;
  onEndStream: () => void;
  onConnectObs: () => void;
  onDisconnectObs: () => void;
  onSwitchObsScene: () => void;
  onGenerateUrl: () => void;
  onCopyStreamUrl: () => void;
  onObsConfigChange: (patch: Partial<ObsConfig>) => void;
  onObsSceneNameChange: (sceneName: string) => void;
  onAttachTiktokLiveUrl: () => void | Promise<void>;
  onDetachTiktokLiveUrl: () => void;
  streamUrl: string;
  tiktokPlayableLiveInput: string;
  setTiktokPlayableLiveInput: Dispatch<SetStateAction<string>>;
  tiktokPlayableLiveUrl: string;
  tiktokLiveStudioStatus: "disconnected" | "attached" | "live";
  isAttachingTiktokLive: boolean;
  isLoadingTiktokLiveBasicInfo: boolean;
  isTiktokLiveAttached: boolean;
  tiktokLiveBasicInfo: TiktokLiveBasicInfo | null;
  obsConfig: ObsConfig;
  obsSessionState: ObsSessionState;
  obsSceneDraft: string;
  selectedProducts: Product[];
  comments: CommentItem[];
  visibleProductId: number | null;
  logs: LogItem[];
  shopInfo: ShopInfo;
  darkMode: boolean;
  scheduleStart: string;
  scheduleEnd: string;
  setScheduleStart: Dispatch<SetStateAction<string>>;
  setScheduleEnd: Dispatch<SetStateAction<string>>;
  currentUser: DemoAccount;
  isScheduleRangeInvalid: boolean;
  marketplaceShopProfile: MarketplaceShopProfile | null;
  isLoadingMarketplaceShopProfile: boolean;
  realtimeMetrics: RealtimeMetrics;
  streamHealth: StreamHealth;
  managementPlatform: ManagementPlatform;
};
