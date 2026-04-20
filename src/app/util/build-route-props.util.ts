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
  TiktokGiftEvent,
  TiktokLiveConnectionStatus,
} from "../../common/type/app.type";
import type { StudioRouteProps } from "../../common/route/studio.route";
import type { ProductRouteProps } from "../../common/route/product.route";
import type { CommentRouteProps } from "../../common/route/comment.route";
import type { ReportRouteProps } from "../../common/route/report.route";

type SessionSlice = {
  coverPreview: string;
  onCoverChange: (e: ChangeEvent<HTMLInputElement>) => void;
  sessionState: SessionState;
  onCreateSession: () => void;
  onStartStream: () => void;
  onEndStream: () => void;
  onGenerateUrl: () => void;
  streamUrl: string;
  onCopyStreamUrl: () => void;
  scheduleStart: string;
  scheduleEnd: string;
  setScheduleStart: Dispatch<SetStateAction<string>>;
  setScheduleEnd: Dispatch<SetStateAction<string>>;
  isScheduleRangeInvalid: boolean;
  isCreatingSession: boolean;
  isGeneratingUrl: boolean;
  isStartingStream: boolean;
  isEndingStream: boolean;
  isConnectingObs: boolean;
  isSwitchingScene: boolean;
  obsConfig: ObsConfig;
  obsSessionState: ObsSessionState;
  obsSceneDraft: string;
  onObsConfigChange: (patch: Partial<ObsConfig>) => void;
  onConnectObs: () => void;
  onDisconnectObs: () => void;
  onSwitchObsScene: () => void;
  onObsSceneNameChange: (sceneName: string) => void;
  onAttachTiktokLiveUrl: () => void | Promise<void>;
  onDetachTiktokLiveUrl: () => void;
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
  marketplaceShopProfile: MarketplaceShopProfile | null;
  isLoadingMarketplaceShopProfile: boolean;
  realtimeMetrics: RealtimeMetrics;
  streamHealth: StreamHealth;
};

type ProductSlice = {
  products: Product[];
  selectedProducts: number[];
  toggleProduct: (id: number) => void;
  applySet: () => void;
  visibleProductId: number | null;
  showProduct: (id: number) => void;
  removeProduct: (id?: number) => void;
  addProduct: () => void;
  appliedProductIds: number[];
  allSelected: boolean;
  handleSelectAllProducts: () => void;
  isAddingProduct: boolean;
  isApplyingSet: boolean;
  selectedProductObjects: Product[];
};

type CommentSlice = {
  comments: CommentItem[];
  draftComment: string;
  setDraftComment: Dispatch<SetStateAction<string>>;
  sendComment: () => void;
  refreshComments: () => void;
  autoRefresh: boolean;
  setAutoRefresh: Dispatch<SetStateAction<boolean>>;
  isRefreshingComments: boolean;
  isSendingComment: boolean;
};

type BuildStudioRoutePropsArgs = {
  darkMode: boolean;
  session: SessionSlice;
  product: Pick<ProductSlice, "selectedProductObjects" | "visibleProductId">;
  comment: Pick<CommentSlice, "comments">;
  logs: LogItem[];
  shopInfo: ShopInfo;
  currentUser: DemoAccount;
  managementPlatform: ManagementPlatform;
};

export const buildStudioRouteProps = ({
  darkMode,
  session,
  product,
  comment,
  logs,
  shopInfo,
  currentUser,
  managementPlatform,
}: BuildStudioRoutePropsArgs): StudioRouteProps => ({
  coverPreview: session.coverPreview,
  onCoverChange: session.onCoverChange,
  sessionState: session.sessionState,
  onCreateSession: session.onCreateSession,
  onStartStream: session.onStartStream,
  onEndStream: session.onEndStream,
  onGenerateUrl: session.onGenerateUrl,
  streamUrl: session.streamUrl,
  selectedProducts: product.selectedProductObjects,
  comments: comment.comments,
  visibleProductId: product.visibleProductId,
  logs,
  shopInfo,
  onCopyStreamUrl: session.onCopyStreamUrl,
  darkMode,
  scheduleStart: session.scheduleStart,
  scheduleEnd: session.scheduleEnd,
  setScheduleStart: session.setScheduleStart,
  setScheduleEnd: session.setScheduleEnd,
  currentUser,
  isScheduleRangeInvalid: session.isScheduleRangeInvalid,
  isCreatingSession: session.isCreatingSession,
  isGeneratingUrl: session.isGeneratingUrl,
  isStartingStream: session.isStartingStream,
  isEndingStream: session.isEndingStream,
  isConnectingObs: session.isConnectingObs,
  isSwitchingScene: session.isSwitchingScene,
  obsConfig: session.obsConfig,
  obsSessionState: session.obsSessionState,
  obsSceneDraft: session.obsSceneDraft,
  onObsConfigChange: session.onObsConfigChange,
  onConnectObs: session.onConnectObs,
  onDisconnectObs: session.onDisconnectObs,
  onSwitchObsScene: session.onSwitchObsScene,
  onObsSceneNameChange: session.onObsSceneNameChange,
  onAttachTiktokLiveUrl: session.onAttachTiktokLiveUrl,
  onDetachTiktokLiveUrl: session.onDetachTiktokLiveUrl,
  tiktokUsernameInput: session.tiktokUsernameInput,
  setTiktokUsernameInput: session.setTiktokUsernameInput,
  tiktokUsername: session.tiktokUsername,
  tiktokLiveEmbedUrl: session.tiktokLiveEmbedUrl,
  tiktokConnectionStatus: session.tiktokConnectionStatus,
  tiktokConnectionMessage: session.tiktokConnectionMessage,
  isConnectingTiktokLive: session.isConnectingTiktokLive,
  tiktokRealtimeComments: session.tiktokRealtimeComments,
  tiktokTotalLikes: session.tiktokTotalLikes,
  tiktokViewerCount: session.tiktokViewerCount,
  tiktokTotalComments: session.tiktokTotalComments,
  latestTiktokGift: session.latestTiktokGift,
  marketplaceShopProfile: session.marketplaceShopProfile,
  isLoadingMarketplaceShopProfile: session.isLoadingMarketplaceShopProfile,
  realtimeMetrics: session.realtimeMetrics,
  streamHealth: session.streamHealth,
  managementPlatform,
});

type BuildProductRoutePropsArgs = {
  darkMode: boolean;
  product: ProductSlice;
};

export const buildProductRouteProps = ({ darkMode, product }: BuildProductRoutePropsArgs): ProductRouteProps => ({
  darkMode,
  products: product.products,
  selectedProducts: product.selectedProducts,
  toggleProduct: product.toggleProduct,
  applySet: product.applySet,
  visibleProductId: product.visibleProductId,
  showProduct: product.showProduct,
  removeProduct: product.removeProduct,
  addProduct: product.addProduct,
  appliedProductIds: product.appliedProductIds,
  allSelected: product.allSelected,
  handleSelectAllProducts: product.handleSelectAllProducts,
  isAddingProduct: product.isAddingProduct,
  isApplyingSet: product.isApplyingSet,
});

type BuildCommentRoutePropsArgs = {
  darkMode: boolean;
  comment: CommentSlice;
  session: Pick<SessionSlice, "tiktokRealtimeComments" | "tiktokConnectionStatus">;
  currentUser: DemoAccount;
  managementPlatform: ManagementPlatform;
};

export const buildCommentRouteProps = ({
  darkMode,
  comment,
  session,
  currentUser,
  managementPlatform,
}: BuildCommentRoutePropsArgs): CommentRouteProps => ({
  darkMode,
  comments: comment.comments,
  tiktokRealtimeComments: session.tiktokRealtimeComments,
  tiktokConnectionStatus: session.tiktokConnectionStatus,
  draftComment: comment.draftComment,
  setDraftComment: comment.setDraftComment,
  sendComment: comment.sendComment,
  refreshComments: comment.refreshComments,
  autoRefresh: comment.autoRefresh,
  setAutoRefresh: comment.setAutoRefresh,
  currentUser,
  isRefreshingComments: comment.isRefreshingComments,
  isSendingComment: comment.isSendingComment,
  managementPlatform,
});

export const buildReportRouteProps = (darkMode: boolean): ReportRouteProps => ({
  darkMode,
});
