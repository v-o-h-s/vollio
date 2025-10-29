import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { LMSProvider } from "@/lib/types/lms";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check connection status for each provider
    const providers: LMSProvider[] = [
      {
        id: "google",
        name: "Google Classroom",
        description: "Import PDFs from your Google Classroom courses",
        status: "disconnected", // Will be updated by checking tokens
      },
      // Future providers can be added here
      // {
      //   id: "moodle",
      //   name: "Moodle",
      //   description: "Import from Moodle courses",
      //   status: "disconnected",
      // },
      // {
      //   id: "canvas",
      //   name: "Canvas",
      //   description: "Import from Canvas courses",
      //   status: "disconnected",
      // },
    ];

    // Note: Connection status will be checked separately by the frontend
    // to avoid circular dependencies and improve performance

    return NextResponse.json({
      success: true,
      data: {
        providers,
        totalCount: providers.length,
      },
    });

  } catch (error) {
    console.error("Error fetching LMS providers:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch LMS providers" 
      },
      { status: 500 }
    );
  }
}