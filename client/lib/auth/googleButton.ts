
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import type { accounts, CredentialResponse } from "google-one-tap";
import { useRouter } from "next/navigation";

declare const google: { accounts: accounts };

// generate nonce to use for google id token sign-in
export const generateNonce = async (): Promise<string[]> => {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))
  );
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return [nonce, hashedNonce];
};
