import type { Dispatch, SetStateAction, ChangeEvent } from "react";
import type {
  CommentItem,
  DemoAccount,
  TiktokGiftEvent,
  TiktokLiveConnectionStatus,
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
  tiktokUsernameInput: string;
  setTiktokUsernameInput: Dispatch<SetStateAction<string>>;
  tiktokUsername: string;
  tiktokLiveEmbedUrl: string;
  tiktokConnectionStatus: TiktokLiveConnectionStatus;
  tiktokConnectionMessage: string;
  isConnectingTiktokLive: boolean;
  tiktokRealtimeComments: CommentItem[];
  tiktokTotalLikes: number;
  tiktokViewerCount: number;
  tiktokTotalComments: number;
  latestTiktokGift: TiktokGiftEvent | null;
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
