/**
 * API endpoint to test authentication and RLS policies
 * This endpoint helps verify that security measures are working correctly
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/utils/error-handling/server-error-handling";
import {
  validateAuthentication,
  testRLSPolicies,
  getUserSessionInfo,
  refreshAuthenticationIfNeeded,
} from "@/lib/utils/auth-validation";
import { checkEnhancedRateLimit } from "@/lib/utils/security-validation";

interface AuthTestResponse {
  success: boolean;
  data?: {
    authentication: {
      valid: boolean;
      userId: string;
      sessionId?: string;
      tokenExpiry?: string;
      shouldRefresh: boolean;
    };
    rlsPolicies: {
      success: boolean;
      results: Array<{
        test: string;
        passed: boolean;
        error?: string;
      }>;
    };
    sessionInfo: {
      userId: string;
      sessionId: string;
      tokenExpiry?: string;
      isValid: boolean;
      shouldRefresh: boolean;
    } | null;
    tokenRefresh: {
      refreshed: boolean;
      error?: string;
    };
  };
  error?: string;
}

/**
 * GET handler to test authentication and authorization
 */
async function handleGET(request: NextRequest): Promise<NextResponse<AuthTestResponse>> {
  const context = extractRequestContext(request, '/api/auth/test');

  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw createServerError(
      ServerErrorType.AUTHENTICATION_ERROR,
      'User not authenticated',
      { ...context, userId: undefined }
    );
  }

  // Rate limiting for auth tests
  checkEnhancedRateLimit(userId, 'API_CALLS', { ...context, userId });

  try {
    // Test 1: Validate authentication
    const authValidation = await validateAuthentication(request);
    
    // Test 2: Test RLS policies
    const rlsTests = await testRLSPolicies(userId);
    
    // Test 3: Get session information
    const sessionInfo = await getUserSessionInfo();
    
    // Test 4: Test token refresh
    const tokenRefresh = await refreshAuthenticationIfNeeded();

    // Compile results
    const response: AuthTestResponse = {
      success: true,
      data: {
        authentication: {
          valid: authValidation.valid,
          userId: authValidation.context?.userId || userId,
          sessionId: authValidation.context?.sessionId,
          tokenExpiry: authValidation.context?.tokenExpiry?.toISOString(),
          shouldRefresh: authValidation.shouldRefresh || false,
        },
        rlsPolicies: rlsTests,
        sessionInfo: sessionInfo ? {
          ...sessionInfo,
          tokenExpiry: sessionInfo.tokenExpiry?.toISOString(),
        } : null,
        tokenRefresh,
      },
    };

    // Log test results
    console.log(`🔐 Auth test completed for user ${userId}:`);
    console.log(`  - Authentication valid: ${authValidation.valid}`);
    console.log(`  - RLS policies passed: ${rlsTests.success}`);
    console.log(`  - Session valid: ${sessionInfo?.isValid || false}`);
    console.log(`  - Token refresh needed: ${authValidation.shouldRefresh || false}`);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Auth test error:', error);
    throw createServerError(
      ServerErrorType.INTERNAL_ERROR,
      'Authentication test failed',
      { ...context, userId },
      error
    );
  }
}

// Export the wrapped handler
export const GET = withErrorHandling(handleGET, {
  endpoint: '/api/auth/test',
  method: 'GET',
});