"use client";

// well this is imported from supabase docs , it is mainly like the popup login button , it is cool , but i wont use it during dev
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import type { accounts, CredentialResponse } from "google-one-tap";
import { useRouter } from "next/navigation";
import { generateNonce } from "@/lib/auth/googleButton";

declare const google: { accounts: accounts };

const OneTapComponent = () => {
  const supabase = createClient();
  const router = useRouter();

  const initializeGoogleOneTap = async () => {
    console.log("Initializing Google One Tap");
    const [nonce, hashedNonce] = await generateNonce();
    console.log("Nonce: ", nonce, hashedNonce);

    // check if there's already an existing session before initializing the one-tap UI
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session", error);
    }
    if (data.session) {
      router.push("/");
      return;
    }

    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: async (response: CredentialResponse) => {
        try {
          // send id token returned in response.credential to supabase
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce,
          });

          if (error) throw error;
          console.log("Session data: ", data);
          console.log("Successfully logged in with Google One Tap");

          // redirect to protected page
          router.push("/");
        } catch (error) {
          console.error("Error logging in with Google One Tap", error);
        }
      },
      nonce: hashedNonce,
      // with chrome's removal of third-party cookies, we need to use FedCM instead (https://developers.google.com/identity/gsi/web/guides/fedcm-migration)
      use_fedcm_for_prompt: true,
    });
    google.accounts.id.prompt(); // Display the One Tap UI
  };

  return (
    <Script
      onReady={() => void initializeGoogleOneTap()}
      src="https://accounts.google.com/gsi/client"
    />
  );
};

export default OneTapComponent;
