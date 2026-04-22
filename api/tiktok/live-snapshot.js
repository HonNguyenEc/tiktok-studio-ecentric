import { TikTokLiveConnection } from "tiktok-live-connector";

const CONNECT_TIMEOUT_MS = 10000;

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TikTok connect timeout.")), timeoutMs);
    }),
  ]);

const toSafeNumber = (value) => {
  if (typeof value !== "number") return undefined;
  return Number.isFinite(value) ? value : undefined;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({
      status: "error",
      message: "Method not allowed",
    });
    return;
  }

  const usernameParam = String(req.query?.username || "").trim().replace(/^@/, "");

  if (!usernameParam) {
    res.status(400).json({
      status: "error",
      message: "username is required",
    });
    return;
  }

  const connection = new TikTokLiveConnection(usernameParam, {
    processInitialData: true,
    fetchRoomInfoOnConnect: true,
    enableExtendedGiftInfo: false,
  });

  try {
    const connectState = await withTimeout(connection.connect(), CONNECT_TIMEOUT_MS);
    const roomInfo = connectState?.roomInfo || {};
    const stats = roomInfo?.stats || roomInfo?.roomStats || {};

    const viewerCount =
      toSafeNumber(stats?.viewerCount) ??
      toSafeNumber(stats?.userCount) ??
      toSafeNumber(stats?.onlineUserCount) ??
      0;

    const totalLikes =
      toSafeNumber(stats?.likeCount) ??
      toSafeNumber(stats?.totalLikeCount) ??
      undefined;

    res.status(200).json({
      status: "connected",
      username: usernameParam,
      message: `Connected to @${usernameParam}.`,
      roomId: connectState?.roomId ? String(connectState.roomId) : undefined,
      viewerCount,
      totalLikes,
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(200).json({
      status: "error",
      username: usernameParam,
      message: error instanceof Error ? error.message : "Failed to connect TikTok room.",
      viewerCount: 0,
      timestamp: Date.now(),
    });
  } finally {
    try {
      await connection.disconnect();
    } catch {
      // no-op
    }
  }
}
