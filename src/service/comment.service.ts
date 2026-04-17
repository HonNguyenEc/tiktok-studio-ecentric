import type { CommentItem, CommentSentiment, ManagementPlatform } from "../common/type/app.type";

const shopeeMockPool = [
  "Shopee Live có voucher không shop?",
  "Xin mã freeship 0đ với ạ",
  "Mẫu này có size M không?",
  "Shop pin giúp em sản phẩm này nhé",
];

const tiktokMockPool = [
  "TikTok Shop có link giỏ vàng chưa ạ?",
  "Có flash sale trong live không?",
  "Host review kỹ chất vải giúp em với",
  "Có quà tặng khi chốt đơn nhanh không?",
];

const detectSentiment = (text: string): CommentSentiment => {
  const normalized = text.toLowerCase();
  if (normalized.includes("?") || normalized.includes("không") || normalized.includes("ko")) {
    return "question";
  }

  if (normalized.includes("xin") || normalized.includes("giúp") || normalized.includes("tốt")) {
    return "positive";
  }

  return "neutral";
};

export const createManualComment = async (
  platform: ManagementPlatform,
  user: string,
  text: string
): Promise<CommentItem> => {
  return {
    id: Date.now(),
    user,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    platform,
    sentiment: detectSentiment(text),
  };
};

export const getMockIncomingComment = async (platform: ManagementPlatform): Promise<CommentItem> => {
  const pool = platform === "Shopee" ? shopeeMockPool : tiktokMockPool;
  const text = pool[Math.floor(Math.random() * pool.length)];
  const prefix = platform === "Shopee" ? "sp_viewer" : "tt_viewer";

  return {
    id: Date.now() + Math.random(),
    user: `${prefix}_${Math.floor(Math.random() * 100)}`,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    platform,
    sentiment: detectSentiment(text),
  };
};
