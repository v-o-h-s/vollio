import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Development endpoint to expose authentication token for Postman testing
 * ⚠️ WARNING: Remove this endpoint in production!
 */
export const GET = async (req: NextRequest) => {
  try {
    const { getToken, userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          message: "Please sign in first to get your token",
        },
        { status: 401 }
      );
    }

    // Get the session token
    const token = await getToken();

    return NextResponse.json({
      success: true,
      userId,
      token,
      instructions: {
        postman: "Add this to your request headers:",
        header: "Authorization: Bearer " + token,
        note: "⚠️ This endpoint should be removed in production!",
      },
    });
  } catch (error) {
    console.error("Token retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve token" },
      { status: 500 }
    );
  }
};
