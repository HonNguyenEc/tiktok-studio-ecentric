export type LivePreviewSourceType = "empty" | "invalid" | "video-direct" | "web-page";

const DIRECT_VIDEO_EXTENSIONS = [".m3u8", ".mp4", ".webm", ".mov", ".mkv"];

const hasDirectVideoExtension = (pathname: string): boolean =>
  DIRECT_VIDEO_EXTENSIONS.some((extension) => pathname.toLowerCase().endsWith(extension));

export const classifyLivePreviewUrl = (rawUrl: string): LivePreviewSourceType => {
  const nextUrl = rawUrl.trim();
  if (!nextUrl) return "empty";

  let parsed: URL;
  try {
    parsed = new URL(nextUrl);
  } catch {
    return "invalid";
  }

  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return "invalid";
  }

  if (hasDirectVideoExtension(parsed.pathname)) {
    return "video-direct";
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();
  const isTiktokLivePage = (host.includes("tiktok.com") || host.includes("tiktokv.com")) && path.includes("/live");
  if (isTiktokLivePage) {
    return "web-page";
  }

  return "web-page";
};