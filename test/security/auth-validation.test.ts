/**
 * Authentication validation tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  validateAuthentication,
  requireAuthentication,
  testRLSPolicies,
  getUserSessionInfo,
  refreshAuthenticationIfNeeded,
} from '@/lib/utils/auth-validation';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/lib/supabaseClient', () => ({
  getAuthenticatedSupabaseClient: vi.fn(),
}));

// Mock security validation
vi.mock('@/lib/utils/security-validation', () => ({
  checkEnhancedRateLimit: vi.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';
import { checkEnhancedRateLimit } from '@/lib/utils/security-validation';

const mockAuth = auth as vi.MockedFunction<typeof auth>;
const mockGetAuthenticatedSupabaseClient = getAuthenticatedSupabaseClient as vi.MockedFunction<typeof getAuthenticatedSupabaseClient>;
const mockCheckEnhancedRateLimit = checkEnhancedRateLimit as vi.MockedFunction<typeof checkEnhancedRateLimit>;

describe('Authentication Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAuthentication', () => {
    it('should validate successful authentication', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.test';
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(mockToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const result = await validateAuthentication();
      
      expect(result.valid).toBe(true);
      expect(result.context?.userId).toBe('user123');
      expect(result.context?.sessionId).toBe('session123');
    });

    it('should reject unauthenticated users', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
        getToken: vi.fn(),
      } as any);

      const result = await validateAuthentication();
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not authenticated');
    });

    it('should detect expired tokens', async () => {
      // Create a token that expired in the past
      const expiredTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: 'user123', exp: expiredTime }))}.test`;
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(expiredToken),
      } as any);

      const result = await validateAuthentication();
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
      expect(result.shouldRefresh).toBe(true);
    });

    it('should suggest refresh for soon-to-expire tokens', async () => {
      // Create a token that expires in 2 minutes
      const soonExpireTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
      const soonExpireToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: 'user123', exp: soonExpireTime }))}.test`;
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(soonExpireToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const result = await validateAuthentication();
      
      expect(result.valid).toBe(true);
      expect(result.shouldRefresh).toBe(true);
    });

    it('should handle Supabase authentication errors', async () => {
      const mockToken = 'valid-token';
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(mockToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: null,
              error: { message: 'JWT token is invalid', code: '42501' },
            })),
          })),
        })),
      } as any);

      const result = await validateAuthentication();
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid or expired');
      expect(result.shouldRefresh).toBe(true);
    });
  });

  describe('requireAuthentication', () => {
    it('should return auth context for valid authentication', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.test';
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(mockToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const mockRequest = new Request('https://example.com/api/test');
      const context = await requireAuthentication(mockRequest, ['read']);
      
      expect(context.userId).toBe('user123');
      expect(context.sessionId).toBe('session123');
    });

    it('should throw error for invalid authentication', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
        getToken: vi.fn(),
      } as any);

      const mockRequest = new Request('https://example.com/api/test');
      
      await expect(requireAuthentication(mockRequest)).rejects.toThrow();
    });

    it('should check required permissions', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.test';
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(mockToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const mockRequest = new Request('https://example.com/api/test');
      
      // Should succeed with valid permissions
      const context = await requireAuthentication(mockRequest, ['read', 'write']);
      expect(context.userId).toBe('user123');
      
      // Should succeed with permissions that exist
      const context2 = await requireAuthentication(mockRequest, ['upload']);
      expect(context2.userId).toBe('user123');
    });
  });

  describe('testRLSPolicies', () => {
    it('should test RLS policies successfully', async () => {
      const mockSupabaseClient = {
        from: vi.fn((table: string) => {
          if (table === 'pdfs') {
            return {
              select: vi.fn(() => ({
                limit: vi.fn(() => ({
                  data: [{ user_id: 'user123' }],
                  error: null,
                })),
              })),
              insert: vi.fn(() => ({
                error: { message: 'RLS policy violation' }, // Expected for security test
              })),
            };
          } else if (table === 'user_activity') {
            return {
              select: vi.fn(() => ({
                limit: vi.fn(() => ({
                  data: [{ user_id: 'user123' }],
                  error: null,
                })),
              })),
            };
          }
          return {};
        }),
      };

      mockGetAuthenticatedSupabaseClient.mockResolvedValue(mockSupabaseClient as any);
      
      mockAuth.mockResolvedValue({
        getToken: vi.fn().mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIn0.test'),
      } as any);

      const result = await testRLSPolicies('user123');
      
      expect(result.results).toHaveLength(4);
      expect(result.results[0].test).toContain('PDF RLS');
      expect(result.results[1].test).toContain('Activity RLS');
      expect(result.results[2].test).toContain('Cannot insert');
      expect(result.results[3].test).toContain('JWT Token');
    });

    it('should detect RLS policy violations', async () => {
      const mockSupabaseClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [
                { user_id: 'user123' },
                { user_id: 'other-user' }, // This should not be returned due to RLS
              ],
              error: null,
            })),
          })),
          insert: vi.fn(() => ({
            error: { message: 'RLS policy violation' },
          })),
        })),
      };

      mockGetAuthenticatedSupabaseClient.mockResolvedValue(mockSupabaseClient as any);
      
      mockAuth.mockResolvedValue({
        getToken: vi.fn().mockResolvedValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIn0.test'),
      } as any);

      const result = await testRLSPolicies('user123');
      
      expect(result.success).toBe(false);
      expect(result.results.some(r => !r.passed)).toBe(true);
    });
  });

  describe('getUserSessionInfo', () => {
    it('should return session info for valid user', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.test';
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(mockToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const sessionInfo = await getUserSessionInfo();
      
      expect(sessionInfo).not.toBeNull();
      expect(sessionInfo?.userId).toBe('user123');
      expect(sessionInfo?.sessionId).toBe('session123');
      expect(sessionInfo?.isValid).toBe(true);
    });

    it('should return null for invalid user', async () => {
      mockAuth.mockResolvedValue({
        userId: null,
        sessionId: null,
        getToken: vi.fn(),
      } as any);

      const sessionInfo = await getUserSessionInfo();
      
      expect(sessionInfo).toBeNull();
    });
  });

  describe('refreshAuthenticationIfNeeded', () => {
    it('should refresh token when needed', async () => {
      // First call returns expired token
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: 'user123', exp: expiredTime }))}.test`;
      
      // Second call returns fresh token
      const freshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.test';
      
      const mockGetToken = vi.fn()
        .mockResolvedValueOnce(expiredToken)
        .mockResolvedValueOnce(freshToken);

      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: mockGetToken,
      } as any);

      const result = await refreshAuthenticationIfNeeded();
      
      expect(result.refreshed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should not refresh when token is valid', async () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiZXhwIjoxNzAwMDAwMDAwfQ.test';
      
      mockAuth.mockResolvedValue({
        userId: 'user123',
        sessionId: 'session123',
        getToken: vi.fn().mockResolvedValue(validToken),
      } as any);

      mockGetAuthenticatedSupabaseClient.mockResolvedValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      } as any);

      const result = await refreshAuthenticationIfNeeded();
      
      expect(result.refreshed).toBe(false);
      expect(result.error).toBeUndefined();
    });
  });
});