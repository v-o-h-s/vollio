import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@clerk/nextjs/server";
import { saveOAuthTokens } from "@/lib/services/school-lms/oauth-token-service";

// Create OAuth2 client for server-side use
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      const errorUrl = new URL(
        "/dashboard/google-connection-test",
        request.url
      );
      errorUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(errorUrl);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          `/dashboard/google-connection-test?error=${encodeURIComponent(
            error
          )}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save encrypted tokens to database with Google provider
    try {
      await saveOAuthTokens(
        userId,
        {
          access_token: tokens.access_token!,
          refresh_token: tokens.refresh_token || undefined,
          token_type: tokens.token_type || "Bearer",
          expires_in: tokens.expiry_date
            ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
            : undefined,
          scope: tokens.scope || undefined,
        },
        "google"
      );
      console.log("✅ Google OAuth tokens saved securely to database");
    } catch (saveError) {
      console.error("Error saving Google OAuth tokens:", saveError);
      const errorUrl = new URL(
        "/dashboard/google-connection-test",
        request.url
      );
      errorUrl.searchParams.set("error", "token_save_failed");
      return NextResponse.redirect(errorUrl);
    }

    const baseUrl = new URL("/dashboard/pdfs", request.url);
    baseUrl.searchParams.set("success", "true");
    return NextResponse.redirect(baseUrl);
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);

    const errorUrl = new URL("/dashboard/pdfs", request.url);
    errorUrl.searchParams.set("success", "false");
    return NextResponse.redirect(errorUrl);
  }
}
