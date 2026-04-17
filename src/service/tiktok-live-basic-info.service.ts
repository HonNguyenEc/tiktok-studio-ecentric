import type { TiktokLiveBasicInfo } from "../common/type/app.type";

const now = () => new Date().toLocaleTimeString();

const parseUniqueIdFromLiveUrl = (liveUrl: string): string => {
  try {
    const parsed = new URL(liveUrl);
    const match = parsed.pathname.match(/@([^/]+)/i);
    return match?.[1] || "";
  } catch {
    return "";
  }
};

const fetchFromOEmbed = async (liveUrl: string): Promise<Partial<TiktokLiveBasicInfo> | null> => {
  try {
    const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(liveUrl)}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { title?: string; author_name?: string };

    return {
      source: "oembed",
      title: payload.title,
      ownerNickname: payload.author_name,
    };
  } catch {
    return null;
  }
};

const fetchFromTiktokConnector = async (uniqueId: string): Promise<Partial<TiktokLiveBasicInfo> | null> => {
  if (typeof window !== "undefined") {
    return null;
  }

  try {
    const loadConnector = new Function("return import('tiktok-live-connector')") as () => Promise<any>;
    const connectorModule = await loadConnector();
    const TikTokLiveConnection = connectorModule?.TikTokLiveConnection;

    if (!TikTokLiveConnection) {
      return null;
    }

    const connection = new TikTokLiveConnection(uniqueId, {
      processInitialData: false,
      fetchRoomInfoOnConnect: true,
    });

    const state = await connection.connect();
    const roomInfo = state?.roomInfo || {};
    const owner = roomInfo?.owner || roomInfo?.anchor || {};
    const stats = roomInfo?.stats || roomInfo?.roomStats || {};

    await connection.disconnect();

    return {
      source: "tiktokconnector",
      status: "live",
      roomId: state?.roomId ? String(state.roomId) : undefined,
      title: roomInfo?.title || roomInfo?.roomTitle,
      ownerNickname: owner?.nickname || owner?.displayId || uniqueId,
      viewerCount:
        typeof stats?.viewerCount === "number"
          ? stats.viewerCount
          : typeof stats?.userCount === "number"
            ? stats.userCount
            : undefined,
    };
  } catch {
    return null;
  }
};

export const getTiktokLiveBasicInfo = async (liveUrl: string): Promise<TiktokLiveBasicInfo> => {
  const uniqueId = parseUniqueIdFromLiveUrl(liveUrl);

  if (!uniqueId) {
    return {
      uniqueId: "",
      liveUrl,
      source: "url-parser",
      status: "error",
      lastCheckedAt: now(),
      error: "Unable to parse TikTok @username from URL.",
    };
  }

  const connectorInfo = await fetchFromTiktokConnector(uniqueId);
  if (connectorInfo) {
    return {
      uniqueId,
      liveUrl,
      source: connectorInfo.source || "tiktokconnector",
      status: connectorInfo.status || "live",
      roomId: connectorInfo.roomId,
      title: connectorInfo.title,
      ownerNickname: connectorInfo.ownerNickname,
      viewerCount: connectorInfo.viewerCount,
      lastCheckedAt: now(),
    };
  }

  const oembedInfo = await fetchFromOEmbed(liveUrl);
  if (oembedInfo) {
    return {
      uniqueId,
      liveUrl,
      source: "oembed",
      status: "unknown",
      title: oembedInfo.title,
      ownerNickname: oembedInfo.ownerNickname || uniqueId,
      lastCheckedAt: now(),
    };
  }

  return {
    uniqueId,
    liveUrl,
    source: "url-parser",
    status: "unknown",
    ownerNickname: uniqueId,
    lastCheckedAt: now(),
  };
};