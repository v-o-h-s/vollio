import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {Logger} from "@/lib/utils/logger";
/**
 * GET /api/school-lms/google
 * Google Classroom LMS Integration API Overview
 */
export async function GET(request: NextRequest) {
  try {
    Logger.info("📋 Generating Google Classroom API overview");

    const { userId } = await auth();
    Logger.info(`👤 User authenticated: ${userId ? "yes" : "no"}`);
    
    const baseUrl = new URL(request.url).origin;
    Logger.info(`🌐 Base URL: ${baseUrl}`);
    
    const apiOverview = {
      name: "Google Classroom LMS Integration API",
      version: "1.0.0",
      description: "Complete API for integrating with Google Classroom and Google Drive",
      authenticated: !!userId,
      baseUrl: `${baseUrl}/api/school-lms/google`,
      endpoints: {
        authentication: {
          "GET /auth-url": "Get Google OAuth authorization URL",
          "GET /callback": "Handle OAuth callback and store tokens",
          "GET /status": "Check connection status",
          "DELETE /disconnect": "Disconnect Google account",
          "POST /refresh": "Manually refresh OAuth tokens",
          "GET /profile": "Get Google user profile information",
          "GET /tokens": "Get token information (without exposing actual tokens)",
          "DELETE /tokens": "Delete stored OAuth tokens",
        },
        courses: {
          "GET /courses": "List Google Classroom courses",
          "GET /assignments?courseId=": "Get assignments for a specific course",
          "GET /students?courseId=": "Get students and teachers for a specific course",
          "GET /submissions?courseId=&courseWorkId=": "Get student submissions for an assignment",
        },
        materials: {
          "GET /course-materials?courseId=": "Get PDF materials from a course",
          "POST /import-file": "Import a specific file from Google Drive",
          "POST /import": "Import content (course/assignment/material)",
          "POST /batch-import": "Import multiple files at once",
        },
        sync: {
          "POST /sync": "Sync course data to local database",
          "GET /health": "Comprehensive health check of integration",
          "POST /webhook": "Handle Google Classroom push notifications",
          "GET /webhook": "Webhook verification endpoint",
        },
      },
      features: [
        "OAuth 2.0 authentication with Google",
        "Automatic token refresh",
        "Course and assignment listing",
        "PDF material discovery and import",
        "Student roster management",
        "Submission tracking",
        "Batch operations",
        "Health monitoring",
        "Webhook support for real-time updates",
        "Comprehensive error handling",
        "Rate limiting protection",
      ],
      scopes: [
        "https://www.googleapis.com/auth/classroom.courses.readonly",
        "https://www.googleapis.com/auth/classroom.rosters.readonly",
        "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ],
      security: {
        authentication: "Clerk JWT tokens required for all endpoints",
        encryption: "OAuth tokens encrypted with AES-256-GCM",
        rls: "Row Level Security enforced on all database operations",
        validation: "Comprehensive input validation and sanitization",
      },
    };

    return NextResponse.json(apiOverview, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    Logger.error("❌ Error generating API overview", error);
    return NextResponse.json(
      { error: "Failed to generate API overview" },
      { status: 500 }
    );
  }
}