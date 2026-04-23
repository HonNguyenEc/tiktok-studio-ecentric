import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { TikTokLiveConnection } from "tiktok-live-connector";

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";
const CLIENT_ORIGINS = CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 3001);
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

const corsOriginMatcher = (origin, callback) => {
  if (!origin || CLIENT_ORIGINS.includes("*")) {
    callback(null, true);
    return;
  }

  if (CLIENT_ORIGINS.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};

app.use(cors({ origin: corsOriginMatcher }));
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "tiktok-live-realtime", time: new Date().toISOString() });
});

app.get("/api/tiktok/live-snapshot", async (req, res) => {
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
});

const io = new Server(server, {
  cors: {
    origin: corsOriginMatcher,
    methods: ["GET", "POST"],
  },
});

const createConnectionState = () => ({
  username: "",
  totalLikes: 0,
  connection: null,
});

io.on("connection", (socket) => {
  const state = createConnectionState();

  const disconnectCurrent = async () => {
    if (!state.connection) return;
    try {
      await state.connection.disconnect();
    } catch {
      // no-op
    } finally {
      state.connection = null;
    }
  };

  const emitStatus = (status, message = "") => {
    socket.emit("tiktokStatus", {
      status,
      username: state.username,
      message,
      timestamp: Date.now(),
    });
  };

  socket.on("setUsername", async (payload = {}) => {
    const normalized = String(payload.username || "").trim().replace(/^@/, "");

    if (!normalized) {
      emitStatus("error", "TikTok username is required.");
      return;
    }

    await disconnectCurrent();

    state.username = normalized;
    state.totalLikes = 0;

    emitStatus("connecting", `Connecting to @${normalized}...`);

    const connection = new TikTokLiveConnection(normalized, {
      processInitialData: true,
      fetchRoomInfoOnConnect: true,
      enableExtendedGiftInfo: true,
    });

    state.connection = connection;

    connection.on("chat", (data) => {
      socket.emit("chat", {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: data?.nickname || data?.uniqueId || "viewer",
        comment: data?.comment || "",
        timestamp: Date.now(),
      });
    });

    connection.on("like", (data) => {
      const nextLikes =
        typeof data?.totalLikeCount === "number"
          ? data.totalLikeCount
          : state.totalLikes + Number(data?.likeCount || data?.count || 0);

      state.totalLikes = Number.isFinite(nextLikes) ? nextLikes : state.totalLikes;

      socket.emit("like", {
        totalLikes: state.totalLikes,
        username: state.username,
        timestamp: Date.now(),
      });
    });

    connection.on("roomUser", (data) => {
      const viewers = Number(
        data?.viewerCount ?? data?.userCount ?? data?.topViewersCount ?? data?.onlineUserCount ?? 0,
      );

      socket.emit("viewer", {
        viewers: Number.isFinite(viewers) ? viewers : 0,
        username: state.username,
        timestamp: Date.now(),
      });
    });

    connection.on("gift", (data) => {
      socket.emit("gift", {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        username: data?.nickname || data?.uniqueId || "viewer",
        giftName: data?.giftName || "Gift",
        repeatCount: Number(data?.repeatCount || data?.diamondCount || 1),
        timestamp: Date.now(),
      });
    });

    try {
      const connectState = await connection.connect();
      emitStatus("connected", `Connected to @${normalized}${connectState?.roomId ? ` (room ${connectState.roomId})` : ""}.`);
    } catch (error) {
      emitStatus("error", error instanceof Error ? error.message : "Failed to connect TikTok live room.");
      await disconnectCurrent();
    }
  });

  socket.on("clearUsername", async () => {
    await disconnectCurrent();
    state.username = "";
    state.totalLikes = 0;
    emitStatus("disconnected", "Disconnected from TikTok live room.");
  });

  socket.on("disconnect", async () => {
    await disconnectCurrent();
  });
});

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
