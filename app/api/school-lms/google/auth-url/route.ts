import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Create OAuth2 client for server-side use
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI!
);

export async function GET(request: NextRequest) {
  try {
    // Define the scopes we need for Google Classroom and Drive
    const scopes = [
      "https://www.googleapis.com/auth/classroom.courses.readonly",
      "https://www.googleapis.com/auth/classroom.rosters.readonly", 
      "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ];

    // Generate the auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Request refresh token
      scope: scopes,
      prompt: "consent", // Force consent screen to get refresh token
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication URL" },
      { status: 500 }
    );
  }
}