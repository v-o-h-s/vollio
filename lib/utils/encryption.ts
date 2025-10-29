import crypto from "crypto";

// Encryption configuration
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

/**
 * Get encryption key from environment variable
 * In production, this should be a secure, randomly generated key
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }

  // If key is hex-encoded, decode it
  if (key.length === 64) {
    return Buffer.from(key, "hex");
  }

  // Otherwise, hash the key to get consistent 32-byte key
  return crypto.createHash("sha256").update(key).digest();
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    // Use createCipheriv for GCM mode
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from("oauth-token", "utf8"));

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Combine iv + tag + encrypted data
    const combined = iv.toString("hex") + tag.toString("hex") + encrypted;
    return combined;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();

    // Extract components
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), "hex");
    const tag = Buffer.from(
      encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2),
      "hex"
    );
    const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2);

    // Use createDecipheriv for GCM mode
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from("oauth-token", "utf8"));
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Generate a secure encryption key (for setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString("hex");
}

/**
 * Encrypt OAuth tokens for storage
 */
export function encryptOAuthTokens(tokens: {
  access_token: string;
  refresh_token?: string;
}) {
  return {
    encrypted_access_token: encrypt(tokens.access_token),
    encrypted_refresh_token: tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null,
  };
}

/**
 * Decrypt OAuth tokens from storage
 */
export function decryptOAuthTokens(encryptedTokens: {
  encrypted_access_token: string;
  encrypted_refresh_token?: string | null;
}) {
  return {
    access_token: decrypt(encryptedTokens.encrypted_access_token),
    refresh_token: encryptedTokens.encrypted_refresh_token
      ? decrypt(encryptedTokens.encrypted_refresh_token)
      : undefined,
  };
}
