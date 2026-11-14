import crypto from "node:crypto";

// Encryption at rest for stored API keys (v2 brief, Phase 4): AES-256-GCM
// with a key derived from ENCRYPTION_KEY, falling back to SESSION_SECRET /
// APP_PASSWORD. Values are stored as "enc:v1:<iv>:<tag>:<ciphertext>" (base64).
// Changing the secret makes stored keys unreadable: they read as "no key"
// and the user re-enters them in Settings.

const PREFIX = "enc:v1:";

function key() {
  const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || process.env.APP_PASSWORD || "dev-only-insecure-secret";
  return crypto.createHash("sha256").update(`upcreate-ai-key:${secret}`).digest();
}

export function isEncrypted(value: string) {
  return value.startsWith(PREFIX);
}

export function encrypt(plain: string) {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${PREFIX}${iv.toString("base64")}:${cipher.getAuthTag().toString("base64")}:${data.toString("base64")}`;
}

// Returns null when the value can't be decrypted (wrong secret or tampered).
export function decrypt(value: string): string | null {
  if (!value) return "";
  if (!isEncrypted(value)) return value; // legacy plaintext
  try {
    const [iv, tag, data] = value.slice(PREFIX.length).split(":").map((x) => Buffer.from(x, "base64"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
