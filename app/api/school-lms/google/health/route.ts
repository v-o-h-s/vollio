import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient, getGoogleDriveClient } from "@/lib/googleClient";
import { getValidOAuthTokens } from "@/lib/services/school-lms/oauth-token-service";
import { withErrorHandling } from "@/lib/utils/error-handling/errorHandling";

/**
 * GET /api/school-lms/google/health
 * Comprehensive health check for Google LMS integration
 */
export const GET = withErrorHandling(async () => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const healthCheck = {
    overall: "healthy" as "healthy" | "degraded" | "unhealthy",
    timestamp: new Date().toISOString(),
    checks: {
      authentication: { status: "unknown" as "pass" | "fail" | "unknown", message: "" },
      tokens: { status: "unknown" as "pass" | "fail" | "unknown", message: "", details: {} },
      classroomApi: { status: "unknown" as "pass" | "fail" | "unknown", message: "" },
      driveApi: { status: "unknown" as "pass" | "fail" | "unknown", message: "" },
      permissions: { status: "unknown" as "pass" | "fail" | "unknown", message: "", scopes: [] as string[] },
    },
    recommendations: [] as string[],
  };

  try {
    // Check 1: Authentication
    if (userId) {
      healthCheck.checks.authentication.status = "pass";
      healthCheck.checks.authentication.message = "User authenticated successfully";
    } else {
      healthCheck.checks.authentication.status = "fail";
      healthCheck.checks.authentication.message = "User not authenticated";
      healthCheck.overall = "unhealthy";
    }

    // Check 2: OAuth Tokens
    try {
      const tokens = await getValidOAuthTokens(userId, "google");
      
      if (tokens) {
        healthCheck.checks.tokens.status = "pass";
        healthCheck.checks.tokens.message = "Valid OAuth tokens found";
        healthCheck.checks.tokens.details = {
          provider: tokens.provider,
          expiresAt: tokens.expires_at?.toISOString(),
          scope: tokens.scope,
          hasRefreshToken: !!tokens.refresh_token,
        };

        // Check token expiry
        if (tokens.expires_at && tokens.expires_at < new Date()) {
          healthCheck.checks.tokens.status = "fail";
          healthCheck.checks.tokens.message = "OAuth tokens have expired";
          healthCheck.recommendations.push("Refresh or reconnect Google account");
          healthCheck.overall = "degraded";
        }

        // Check if refresh token exists
        if (!tokens.refresh_token) {
          healthCheck.recommendations.push("No refresh token available - may need to reconnect for long-term access");
        }
      } else {
        healthCheck.checks.tokens.status = "fail";
        healthCheck.checks.tokens.message = "No OAuth tokens found";
        healthCheck.recommendations.push("Connect Google Classroom account");
        healthCheck.overall = "unhealthy";
      }
    } catch (error) {
      healthCheck.checks.tokens.status = "fail";
      healthCheck.checks.tokens.message = `Token validation failed: ${error}`;
      healthCheck.overall = "unhealthy";
    }

    // Check 3: Google Classroom API
    if (healthCheck.checks.tokens.status === "pass") {
      try {
        const classroom = await getGoogleClassroomClient(userId);
        
        // Test API call - list courses (limited to 1 for health check)
        const coursesResponse = await classroom.courses.list({
          pageSize: 1,
        });

        healthCheck.checks.classroomApi.status = "pass";
        healthCheck.checks.classroomApi.message = `Classroom API accessible - found ${coursesResponse.data.courses?.length || 0} courses`;
      } catch (error) {
        healthCheck.checks.classroomApi.status = "fail";
        healthCheck.checks.classroomApi.message = `Classroom API error: ${error}`;
        healthCheck.overall = "degraded";
        
        if (error instanceof Error && error.message.includes('insufficient')) {
          healthCheck.recommendations.push("Check Google Classroom API permissions and scopes");
        }
      }
    } else {
      healthCheck.checks.classroomApi.status = "fail";
      healthCheck.checks.classroomApi.message = "Skipped - no valid tokens";
    }

    // Check 4: Google Drive API
    if (healthCheck.checks.tokens.status === "pass") {
      try {
        const drive = await getGoogleDriveClient(userId);
        
        // Test API call - get user info
        const aboutResponse = await drive.about.get({
          fields: 'user',
        });

        healthCheck.checks.driveApi.status = "pass";
        healthCheck.checks.driveApi.message = `Drive API accessible - user: ${aboutResponse.data.user?.displayName}`;
      } catch (error) {
        healthCheck.checks.driveApi.status = "fail";
        healthCheck.checks.driveApi.message = `Drive API error: ${error}`;
        healthCheck.overall = "degraded";
        
        if (error instanceof Error && error.message.includes('insufficient')) {
          healthCheck.recommendations.push("Check Google Drive API permissions and scopes");
        }
      }
    } else {
      healthCheck.checks.driveApi.status = "fail";
      healthCheck.checks.driveApi.message = "Skipped - no valid tokens";
    }

    // Check 5: Permissions and Scopes
    if (healthCheck.checks.tokens.status === "pass") {
      const tokens = await getValidOAuthTokens(userId, "google");
      const scopes = tokens?.scope?.split(' ') || [];
      
      const requiredScopes = [
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ];

      const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));
      
      if (missingScopes.length === 0) {
        healthCheck.checks.permissions.status = "pass";
        healthCheck.checks.permissions.message = "All required scopes granted";
        healthCheck.checks.permissions.scopes = scopes;
      } else {
        healthCheck.checks.permissions.status = "fail";
        healthCheck.checks.permissions.message = `Missing required scopes: ${missingScopes.join(', ')}`;
        healthCheck.checks.permissions.scopes = scopes;
        healthCheck.recommendations.push("Reconnect Google account to grant missing permissions");
        healthCheck.overall = "degraded";
      }
    } else {
      healthCheck.checks.permissions.status = "fail";
      healthCheck.checks.permissions.message = "Cannot check permissions - no valid tokens";
    }

    // Determine overall health
    const failedChecks = Object.values(healthCheck.checks).filter(check => check.status === "fail").length;
    const totalChecks = Object.keys(healthCheck.checks).length;

    if (failedChecks === 0) {
      healthCheck.overall = "healthy";
    } else if (failedChecks < totalChecks / 2) {
      healthCheck.overall = "degraded";
    } else {
      healthCheck.overall = "unhealthy";
    }

    // Add general recommendations
    if (healthCheck.overall === "healthy") {
      healthCheck.recommendations.push("Google Classroom integration is working properly");
    } else if (healthCheck.overall === "degraded") {
      healthCheck.recommendations.push("Some features may not work properly - check failed components");
    } else {
      healthCheck.recommendations.push("Google Classroom integration requires attention - reconnection may be needed");
    }

    return NextResponse.json({
      success: true,
      data: healthCheck,
    });

  } catch (error) {
    console.error("Error performing Google LMS health check:", error);
    
    healthCheck.overall = "unhealthy";
    healthCheck.recommendations.push("Health check failed - contact support if issues persist");

    return NextResponse.json(
      { 
        success: false, 
        error: "Health check failed",
        data: healthCheck,
      },
      { status: 500 }
    );
  }
});