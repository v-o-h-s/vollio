import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabaseClient = getAuthenticatedSupabaseClient();

    // Delete OAuth tokens for Google provider
    const { error } = await supabaseClient
      .from("oauth_tokens")
      .delete()
      .eq("user_id", userId)
      .eq("provider", "google");

    if (error) {
      console.error("Error deleting Google OAuth tokens:", error);
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to disconnect from Google Classroom" 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully disconnected from Google Classroom",
    });

  } catch (error) {
    console.error("Error disconnecting from Google Classroom:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to disconnect from Google Classroom" 
      },
      { status: 500 }
    );
  }
}