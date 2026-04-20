import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { TikTokLiveConnection } from "tiktok-live-connector";

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const PORT = Number(process.env.SERVER_PORT || 3001);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "tiktok-live-realtime", time: new Date().toISOString() });
});

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
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
