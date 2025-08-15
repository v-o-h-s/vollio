/**
 * Enhanced authentication and authorization utilities
 */

import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "../supabaseClient";
import { createServerError, ServerErrorType } from "./server-error-handling";
import { checkEnhancedRateLimit } from "./security-validation";

export interface AuthContext {
  userId: string;
  sessionId?: string;
  tokenExpiry?: Date;
  permissions?: string[];
}

export interface AuthValidationResult {
  valid: boolean;
  context?: AuthContext;
  error?: string;
  shouldRefresh?: boolean;
}

/**
 * Comprehensive authentication validation
 */
export async function validateAuthentication(
  request?: Request,
  requirePermissions?: string[]
): Promise<AuthValidationResult> {
  try {
    // Rate limit authentication attempts
    const clientIP = request?.headers.get('x-forwarded-for') || 
                    request?.headers.get('x-real-ip') || 
                    'unknown';
    
    checkEnhancedRateLimit(clientIP, 'AUTH_ATTEMPTS', {
      operation: 'auth_validation',
      ip: clientIP
    });

    // Get Clerk authentication
    const { userId, sessionId, getToken } = await auth();
    
    if (!userId) {
      return {
        valid: false,
        error: 'User not authenticated',
      };
    }

    // Validate session is active
    if (!sessionId) {
      return {
        valid: false,
        error: 'No active session found',
      };
    }

    // Get and validate JWT token
    let token: string | null = null;
    let tokenExpiry: Date | undefined;
    
    try {
      token = await getToken({ template: "supabase" });
      
      if (!token) {
        return {
          valid: false,
          error: 'Failed to get authentication token',
          shouldRefresh: true,
        };
      }

      // Decode JWT to check expiry (basic validation)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return {
          valid: false,
          error: 'Invalid token format',
          shouldRefresh: true,
        };
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp) {
          tokenExpiry = new Date(payload.exp * 1000);
          
          // Check if token is expired or expires soon (within 5 minutes)
          const now = new Date();
          const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
          
          if (tokenExpiry <= now) {
            return {
              valid: false,
              error: 'Authentication token has expired',
              shouldRefresh: true,
            };
          }
          
          if (tokenExpiry <= fiveMinutesFromNow) {
            // Token expires soon, suggest refresh but allow current request
            return {
              valid: true,
              context: {
                userId,
                sessionId,
                tokenExpiry,
              },
              shouldRefresh: true,
            };
          }
        }
      } catch (decodeError) {
        // If we can't decode the token, it might still be valid
        // Let Supabase handle the validation
        console.warn('Could not decode JWT token for expiry check:', decodeError);
      }

    } catch (tokenError) {
      return {
        valid: false,
        error: 'Failed to retrieve authentication token',
        shouldRefresh: true,
      };
    }

    // Test Supabase connection with the token
    try {
      const supabaseClient = await getAuthenticatedSupabaseClient();
      
      // Simple query to test authentication and RLS
      const { error: testError } = await supabaseClient
        .from('pdfs')
        .select('id')
        .limit(1);
      
      if (testError) {
        // Check if it's an authentication error
        if (testError.message?.includes('JWT') || 
            testError.message?.includes('token') ||
            testError.code === '42501') {
          return {
            valid: false,
            error: 'Authentication token is invalid or expired',
            shouldRefresh: true,
          };
        }
        
        // Other errors are not necessarily auth failures
        console.warn('Non-auth error during auth validation:', testError);
      }
    } catch (supabaseError) {
      return {
        valid: false,
        error: 'Failed to validate authentication with database',
        shouldRefresh: true,
      };
    }

    // Check permissions if required
    if (requirePermissions && requirePermissions.length > 0) {
      // For now, all authenticated users have basic permissions
      // In the future, this could check user roles or specific permissions
      const userPermissions = ['read', 'write', 'upload', 'delete'];
      
      const hasRequiredPermissions = requirePermissions.every(permission =>
        userPermissions.includes(permission)
      );
      
      if (!hasRequiredPermissions) {
        return {
          valid: false,
          error: 'Insufficient permissions for this operation',
        };
      }
    }

    return {
      valid: true,
      context: {
        userId,
        sessionId,
        tokenExpiry,
        permissions: ['read', 'write', 'upload', 'delete'],
      },
    };

  } catch (error) {
    console.error('Authentication validation error:', error);
    return {
      valid: false,
      error: 'Authentication validation failed',
    };
  }
}

/**
 * Middleware function to validate authentication for API routes
 */
export async function requireAuthentication(
  request: Request,
  requiredPermissions?: string[]
): Promise<AuthContext> {
  const validation = await validateAuthentication(request, requiredPermissions);
  
  if (!validation.valid) {
    const errorType = validation.shouldRefresh 
      ? ServerErrorType.AUTHENTICATION_ERROR 
      : ServerErrorType.AUTHORIZATION_ERROR;
    
    throw createServerError(
      errorType,
      validation.error || 'Authentication required',
      {
        endpoint: new URL(request.url).pathname,
        method: request.method,
        shouldRefresh: validation.shouldRefresh,
      }
    );
  }
  
  if (!validation.context) {
    throw createServerError(
      ServerErrorType.INTERNAL_ERROR,
      'Authentication validation succeeded but no context returned',
      {
        endpoint: new URL(request.url).pathname,
        method: request.method,
      }
    );
  }
  
  return validation.context;
}

/**
 * Test RLS policies with different user scenarios
 */
export async function testRLSPolicies(userId: string): Promise<{
  success: boolean;
  results: Array<{
    test: string;
    passed: boolean;
    error?: string;
  }>;
}> {
  const results: Array<{ test: string; passed: boolean; error?: string }> = [];
  
  try {
    const supabaseClient = await getAuthenticatedSupabaseClient();
    
    // Test 1: User can only see their own PDFs
    try {
      const { data, error } = await supabaseClient
        .from('pdfs')
        .select('user_id')
        .limit(10);
      
      if (error) {
        results.push({
          test: 'PDF RLS - Own files only',
          passed: false,
          error: error.message,
        });
      } else {
        // Check that all returned PDFs belong to the current user
        const allOwnFiles = data?.every(pdf => pdf.user_id === userId) ?? true;
        results.push({
          test: 'PDF RLS - Own files only',
          passed: allOwnFiles,
          error: allOwnFiles ? undefined : 'Found PDFs belonging to other users',
        });
      }
    } catch (error) {
      results.push({
        test: 'PDF RLS - Own files only',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // Test 2: User can only see their own activity
    try {
      const { data, error } = await supabaseClient
        .from('user_activity')
        .select('user_id')
        .limit(10);
      
      if (error) {
        results.push({
          test: 'Activity RLS - Own activity only',
          passed: false,
          error: error.message,
        });
      } else {
        const allOwnActivity = data?.every(activity => activity.user_id === userId) ?? true;
        results.push({
          test: 'Activity RLS - Own activity only',
          passed: allOwnActivity,
          error: allOwnActivity ? undefined : 'Found activity belonging to other users',
        });
      }
    } catch (error) {
      results.push({
        test: 'Activity RLS - Own activity only',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    // Test 3: User cannot insert data for other users
    try {
      const fakeUserId = 'fake_user_id_' + Math.random().toString(36).substring(7);
      const { error } = await supabaseClient
        .from('pdfs')
        .insert({
          user_id: fakeUserId,
          filename: 'test.pdf',
          file_size: 1000,
          storage_path: 'test/path.pdf',
          mime_type: 'application/pdf',
        });
      
      // This should fail due to RLS
      results.push({
        test: 'PDF RLS - Cannot insert for other users',
        passed: !!error,
        error: error ? undefined : 'Was able to insert data for another user',
      });
    } catch (error) {
      results.push({
        test: 'PDF RLS - Cannot insert for other users',
        passed: true, // Exception is expected
      });
    }
    
    // Test 4: JWT token contains correct user ID
    try {
      const { getToken } = await auth();
      const token = await getToken({ template: "supabase" });
      
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const tokenUserId = payload.sub || payload.user_id;
        
        results.push({
          test: 'JWT Token - Correct user ID',
          passed: tokenUserId === userId,
          error: tokenUserId === userId ? undefined : `Token user ID ${tokenUserId} doesn't match ${userId}`,
        });
      } else {
        results.push({
          test: 'JWT Token - Correct user ID',
          passed: false,
          error: 'No token available',
        });
      }
    } catch (error) {
      results.push({
        test: 'JWT Token - Correct user ID',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    const allPassed = results.every(result => result.passed);
    
    return {
      success: allPassed,
      results,
    };
    
  } catch (error) {
    return {
      success: false,
      results: [{
        test: 'RLS Test Setup',
        passed: false,
        error: error instanceof Error ? error.message : 'Failed to set up RLS tests',
      }],
    };
  }
}

/**
 * Refresh authentication token if needed
 */
export async function refreshAuthenticationIfNeeded(): Promise<{
  refreshed: boolean;
  error?: string;
}> {
  try {
    const validation = await validateAuthentication();
    
    if (!validation.valid || validation.shouldRefresh) {
      // In Clerk, token refresh is handled automatically
      // We just need to get a fresh token
      const { getToken } = await auth();
      const newToken = await getToken({ template: "supabase" });
      
      if (!newToken) {
        return {
          refreshed: false,
          error: 'Failed to refresh authentication token',
        };
      }
      
      return {
        refreshed: true,
      };
    }
    
    return {
      refreshed: false, // No refresh needed
    };
    
  } catch (error) {
    return {
      refreshed: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    };
  }
}

/**
 * Get user session information
 */
export async function getUserSessionInfo(): Promise<{
  userId: string;
  sessionId: string;
  tokenExpiry?: Date;
  isValid: boolean;
  shouldRefresh: boolean;
} | null> {
  try {
    const validation = await validateAuthentication();
    
    if (!validation.valid || !validation.context) {
      return null;
    }
    
    return {
      userId: validation.context.userId,
      sessionId: validation.context.sessionId || '',
      tokenExpiry: validation.context.tokenExpiry,
      isValid: validation.valid,
      shouldRefresh: validation.shouldRefresh || false,
    };
    
  } catch (error) {
    console.error('Failed to get user session info:', error);
    return null;
  }
}