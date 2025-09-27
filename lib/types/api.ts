/**
 * API-related types for request/response handling and common patterns
 */

// ============================================================================
// GENERIC API TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * Bulk operation response with individual results
 */
export interface BulkOperationResponse<T> {
  success: boolean;
  results?: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  error?: string;
}

/**
 * Database operation result wrapper
 */
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Storage operation result wrapper
 */
export interface StorageOperationResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

/**
 * Database insert operation result
 */
export interface DatabaseInsertResult {
  id: string;
  created: boolean;
}