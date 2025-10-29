import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleOAuth2Client } from "@/lib/googleClient";
import { withErrorHandling } from "@/lib/utils/error-handling/server-error-handling";

/**
 * GET /api/school-lms/google/profile
 * Get Google user profile information
 */
export const GET = withErrorHandling(async () => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Get authenticated Google OAuth2 client
    const oauth2Client = await getGoogleOAuth2Client(userId);

    // Get user info from Google
    const { data: userInfo } = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });

    // Format user profile for frontend
    const profile = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      givenName: userInfo.given_name,
      familyName: userInfo.family_name,
      picture: userInfo.picture,
      locale: userInfo.locale,
      verifiedEmail: userInfo.verified_email,
    };

    return NextResponse.json({
      success: true,
      data: {
        profile: profile,
        provider: "google",
      },
    });

  } catch (error) {
    console.error("Error fetching Google user profile:", error);
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('No Google OAuth tokens found')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Google account not connected. Please connect your account first." 
          },
          { status: 401 }
        );
      }
      if (error.message.includes('tokens have expired')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Google connection expired. Please reconnect your account." 
          },
          { status: 401 }
        );
      }
      if (error.message.includes('invalid_token')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid Google token. Please reconnect your account." 
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch Google user profile" 
      },
      { status: 500 }
    );
  }
});