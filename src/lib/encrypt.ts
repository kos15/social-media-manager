import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer | null {
  const k = process.env.ENCRYPTION_KEY;
  if (!k || k.length !== 64) return null; // 32 bytes = 64 hex chars
  return Buffer.from(k, "hex");
}

/**
 * Encrypts an API key using AES-256-GCM.
 * Falls back to plaintext if ENCRYPTION_KEY env var is not set.
 * Stored format: "enc:<iv>:<tag>:<ciphertext>" (all hex)
 */
export function encryptKey(text: string): string {
  const key = getKey();
  if (!key) return text;

  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a stored API key.
 * Handles legacy plaintext values transparently (no "enc:" prefix).
 */
export function decryptKey(data: string | null | undefined): string {
  if (!data) return "";
  if (!data.startsWith("enc:")) return data; // legacy plaintext

  const key = getKey();
  if (!key) return ""; // can't decrypt without key

  const parts = data.split(":");
  if (parts.length !== 4) return "";
  const [, ivHex, tagHex, encHex] = parts;

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return (
      decipher.update(Buffer.from(encHex, "hex"), undefined, "utf8") +
      decipher.final("utf8")
    );
  } catch {
    return "";
  }
}
