import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getValidOAuthTokens } from "@/lib/services/school-lms/oauth-token-service";
import { withErrorHandling } from "@/lib/utils/error-handling";
/**
 * GET /api/school-lms/google/status
 * Get Google Classroom connection status
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
    // Check if user has valid Google OAuth tokens
    const tokens = await getValidOAuthTokens(userId, "google");
    
    if (!tokens) {
      return NextResponse.json({
        success: true,
        isConnected: false,
        connectionInfo: null,
      });
    }

    // Return connection status with basic info
    return NextResponse.json({
      success: true,
      isConnected: true,
      connectionInfo: {
        connectedAt: tokens.created_at.toISOString(),
        lastUpdated: tokens.updated_at.toISOString(),
        scope: tokens.scope,
        // Don't return sensitive token information
      },
    });
  } catch (error) {
    console.error("Error checking Google LMS connection status:", error);
    
    // If token refresh failed, user needs to reconnect
    if (error instanceof Error && error.message.includes("refresh")) {
      return NextResponse.json({
        success: true,
        isConnected: false,
        connectionInfo: null,
        error: "Connection expired. Please reconnect.",
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to check connection status",
        isConnected: false,
        connectionInfo: null,
      },
      { status: 500 }
    );
  }
});