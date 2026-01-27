/**
 * Generates a cryptographic nonce for Google One Tap authentication.
 * Returns both the raw nonce and its SHA-256 hash.
 */
export async function generateNonce(): Promise<[string, string]> {
  // Generate a random nonce
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const nonce = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  // Hash the nonce using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return [nonce, hashedNonce];
}
