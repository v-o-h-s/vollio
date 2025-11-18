import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { refreshOAuthTokens } from "@/lib/services/school-lms/oauth-token-service";
import { withErrorHandling } from "@/lib/utils/error-handling";

/**
 * POST /api/school-lms/google/refresh
 * Manually refresh Google OAuth tokens
 */
export const POST = withErrorHandling(async () => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Attempt to refresh the tokens
    const refreshedTokens = await refreshOAuthTokens(userId, "google");

    if (!refreshedTokens) {
      return NextResponse.json(
        { 
          success: false, 
          error: "No refresh token available. Please reconnect your Google account." 
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Google OAuth tokens refreshed successfully",
      tokenInfo: {
        expiresAt: refreshedTokens.expires_at,
        scope: refreshedTokens.scope,
        updatedAt: refreshedTokens.updated_at,
      },
    });

  } catch (error) {
    console.error("Error refreshing Google OAuth tokens:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant') || error.message.includes('refresh_token')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Refresh token is invalid or expired. Please reconnect your Google account." 
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Network error while refreshing tokens. Please try again." 
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to refresh Google OAuth tokens" 
      },
      { status: 500 }
    );
  }
});