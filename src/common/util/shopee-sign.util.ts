const textEncoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const getUnixTimestamp = (offsetSeconds = 0): number => {
  return Math.floor(Date.now() / 1000) + offsetSeconds;
};

export const createShopeeSign = async (
  partnerKey: string,
  baseString: string
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(partnerKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(baseString));

  return toHex(signature);
};
