import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOAuthTokens, deleteOAuthTokens } from "@/lib/services/school-lms/oauth-token-service";

/**
 * Get Google OAuth tokens for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tokens = await getOAuthTokens(userId, 'google');
    
    if (!tokens) {
      return NextResponse.json(
        { error: "No Google tokens found", hasTokens: false },
        { status: 404 }
      );
    }

    // Return token info without exposing the actual tokens
    return NextResponse.json({
      hasTokens: true,
      provider: tokens.provider,
      tokenType: tokens.token_type,
      expiresAt: tokens.expires_at,
      scope: tokens.scope,
      createdAt: tokens.created_at,
      updatedAt: tokens.updated_at,
    });

  } catch (error) {
    console.error("Error fetching Google OAuth tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch Google tokens" },
      { status: 500 }
    );
  }
}

/**
 * Delete Google OAuth tokens for the authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await deleteOAuthTokens(userId, 'google');
    
    return NextResponse.json({
      success: true,
      message: "Google OAuth tokens deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting Google OAuth tokens:", error);
    return NextResponse.json(
      { error: "Failed to delete Google tokens" },
      { status: 500 }
    );
  }
}