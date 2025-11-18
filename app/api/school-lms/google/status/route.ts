import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getValidOAuthTokens } from "@/lib/services/school-lms/oauth-token-service";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { Logger } from "@/lib/utils/logger";


/**
 * GET /api/school-lms/google/status
 * Get Google Classroom connection status
 */
export const GET = withErrorHandling(async () => {
  Logger.info("🔗 Checking Google Classroom connection status");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to check Google status");
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  Logger.info(`👤 Checking connection for user: ${userId}`);

  try {
    // Check if user has valid Google OAuth tokens
    Logger.info(`🔑 Retrieving OAuth tokens for user: ${userId}`);
    const tokens = await getValidOAuthTokens(userId, "google");

    if (!tokens) {
      Logger.info(`⚠️  No valid OAuth tokens found for user: ${userId}`);
      return NextResponse.json({
        success: true,
        isConnected: false,
        connectionInfo: null,
      });
    }

    Logger.success(`✅ Valid OAuth tokens found for user: ${userId}`, {
      scope: tokens.scope,
      connectedAt: tokens.created_at.toISOString(),
      lastUpdated: tokens.updated_at.toISOString(),
    });

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
    Logger.error(`❌ Error checking Google LMS connection status for user ${userId}`, error);

    // If token refresh failed, user needs to reconnect
    if (error instanceof Error && error.message.includes("refresh")) {
      Logger.warn(`⚠️  Token refresh failed for user: ${userId}. Connection expired.`);
      return NextResponse.json({
        success: true,
        isConnected: false,
        connectionInfo: null,
        error: "Connection expired. Please reconnect.",
      });
    }

    Logger.error(`🔴 Failed to check connection status for user: ${userId}`, error);
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