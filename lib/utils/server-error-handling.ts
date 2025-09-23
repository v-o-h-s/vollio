/**
 * Server-side error handling and logging utilities
 */

import { NextResponse } from 'next/server';

// Server error types
export enum ServerErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Server error severity levels
export enum ServerErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// Server error interface
export interface ServerError {
  type: ServerErrorType;
  message: string;
  severity: ServerErrorSeverity;
  statusCode: number;
  userMessage: string;
  technicalMessage?: string;
  context?: ServerErrorContext;
  timestamp: Date;
  requestId?: string;
  userId?: string;
  details?: any;
}

// Server error context
export interface ServerErrorContext {
  endpoint: string;
  method: string;
  userId?: string;
  userAgent?: string;
  ip?: string;
  fileSize?: number;
  fileName?: string;
  operation?: string;
  duration?: number;
}

// API response interface
export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  requestId?: string;
  timestamp: string;
}

// Error severity to status code mapping
const ERROR_STATUS_CODES: Record<ServerErrorType, number> = {
  [ServerErrorType.VALIDATION_ERROR]: 400,
  [ServerErrorType.AUTHENTICATION_ERROR]: 401,
  [ServerErrorType.AUTHORIZATION_ERROR]: 403,
  [ServerErrorType.DATABASE_ERROR]: 500,
  [ServerErrorType.STORAGE_ERROR]: 500,
  [ServerErrorType.EXTERNAL_SERVICE_ERROR]: 502,
  [ServerErrorType.PROCESSING_ERROR]: 500,
  [ServerErrorType.RATE_LIMIT_ERROR]: 429,
  [ServerErrorType.INTERNAL_ERROR]: 500,
};

// Error type to severity mapping
const ERROR_SEVERITIES: Record<ServerErrorType, ServerErrorSeverity> = {
  [ServerErrorType.VALIDATION_ERROR]: ServerErrorSeverity.LOW,
  [ServerErrorType.AUTHENTICATION_ERROR]: ServerErrorSeverity.MEDIUM,
  [ServerErrorType.AUTHORIZATION_ERROR]: ServerErrorSeverity.MEDIUM,
  [ServerErrorType.DATABASE_ERROR]: ServerErrorSeverity.HIGH,
  [ServerErrorType.STORAGE_ERROR]: ServerErrorSeverity.HIGH,
  [ServerErrorType.EXTERNAL_SERVICE_ERROR]: ServerErrorSeverity.HIGH,
  [ServerErrorType.PROCESSING_ERROR]: ServerErrorSeverity.HIGH,
  [ServerErrorType.RATE_LIMIT_ERROR]: ServerErrorSeverity.MEDIUM,
  [ServerErrorType.INTERNAL_ERROR]: ServerErrorSeverity.CRITICAL,
};

// User-friendly error messages
const USER_ERROR_MESSAGES: Record<ServerErrorType, string> = {
  [ServerErrorType.VALIDATION_ERROR]: 'Invalid request. Please check your input and try again.',
  [ServerErrorType.AUTHENTICATION_ERROR]: 'Authentication required. Please sign in and try again.',
  [ServerErrorType.AUTHORIZATION_ERROR]: 'Access denied. You do not have permission to perform this action.',
  [ServerErrorType.DATABASE_ERROR]: 'Database error occurred. Please try again later.',
  [ServerErrorType.STORAGE_ERROR]: 'File storage error occurred. Please try again later.',
  [ServerErrorType.EXTERNAL_SERVICE_ERROR]: 'External service error occurred. Please try again later.',
  [ServerErrorType.PROCESSING_ERROR]: 'Document processing error occurred. Please try again later.',
  [ServerErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
  [ServerErrorType.INTERNAL_ERROR]: 'Internal server error occurred. Please try again later.',
};

/**
 * Creates a standardized server error
 */
export function createServerError(
  type: ServerErrorType,
  message: string,
  context?: Partial<ServerErrorContext>,
  details?: any
): ServerError {
  const requestId = generateRequestId();
  
  return {
    type,
    message,
    severity: ERROR_SEVERITIES[type],
    statusCode: ERROR_STATUS_CODES[type],
    userMessage: USER_ERROR_MESSAGES[type],
    technicalMessage: message,
    context: context as ServerErrorContext,
    timestamp: new Date(),
    requestId,
    details,
  };
}

/**
 * Maps various error types to ServerError
 */
export function mapToServerError(
  error: any,
  context?: Partial<ServerErrorContext>
): ServerError {
  // Handle Supabase errors
  if (error?.code && typeof error.code === 'string') {
    return mapSupabaseErrorToServerError(error, context);
  }

  // Handle Clerk authentication errors
  if (error?.message?.includes('Unauthorized') || error?.status === 401) {
    return createServerError(
      ServerErrorType.AUTHENTICATION_ERROR,
      'Authentication failed',
      context,
      error
    );
  }

  // Handle validation errors
  if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
    return createServerError(
      ServerErrorType.VALIDATION_ERROR,
      error.message || 'Validation failed',
      context,
      error
    );
  }

  // Handle file size errors
  if (error?.message?.includes('file size') || error?.message?.includes('too large')) {
    return createServerError(
      ServerErrorType.VALIDATION_ERROR,
      error.message || 'File too large',
      context,
      error
    );
  }

  // Handle storage errors
  if (error?.message?.includes('storage') || error?.message?.includes('upload')) {
    return createServerError(
      ServerErrorType.STORAGE_ERROR,
      error.message || 'Storage operation failed',
      context,
      error
    );
  }

  // Handle network/timeout errors
  if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
    return createServerError(
      ServerErrorType.EXTERNAL_SERVICE_ERROR,
      'External service connection failed',
      context,
      error
    );
  }

  // Default to internal error
  return createServerError(
    ServerErrorType.INTERNAL_ERROR,
    error?.message || 'An unexpected error occurred',
    context,
    error
  );
}

/**
 * Maps Supabase errors to ServerError
 */
function mapSupabaseErrorToServerError(
  error: any,
  context?: Partial<ServerErrorContext>
): ServerError {
  const code = error.code;
  const message = error.message || '';

  switch (code) {
    case 'PGRST116': // Row not found or RLS policy violation
      return createServerError(
        ServerErrorType.AUTHORIZATION_ERROR,
        'Access denied or resource not found',
        context,
        error
      );
    
    case 'PGRST301': // Resource not found
      return createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Resource not found',
        context,
        error
      );
    
    case '23505': // Unique constraint violation
      return createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Duplicate resource',
        context,
        error
      );
    
    case '23503': // Foreign key constraint violation
      return createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Invalid reference',
        context,
        error
      );
    
    case '42501': // Insufficient privilege
      return createServerError(
        ServerErrorType.AUTHORIZATION_ERROR,
        'Insufficient permissions',
        context,
        error
      );
    
    default:
      if (message.includes('JWT') || message.includes('token')) {
        return createServerError(
          ServerErrorType.AUTHENTICATION_ERROR,
          'Authentication token invalid or expired',
          context,
          error
        );
      }
      
      if (message.includes('connection') || message.includes('network')) {
        return createServerError(
          ServerErrorType.DATABASE_ERROR,
          'Database connection failed',
          context,
          error
        );
      }
      
      return createServerError(
        ServerErrorType.DATABASE_ERROR,
        message || 'Database error occurred',
        context,
        error
      );
  }
}

/**
 * Logs server errors with appropriate level
 */
export function logServerError(error: ServerError): void {
  const logData = {
    requestId: error.requestId,
    type: error.type,
    severity: error.severity,
    statusCode: error.statusCode,
    message: error.technicalMessage || error.message,
    context: error.context,
    timestamp: error.timestamp.toISOString(),
    userId: error.userId,
    details: error.details,
  };

  // Add structured logging based on severity
  switch (error.severity) {
    case ServerErrorSeverity.CRITICAL:
      console.error('🚨 CRITICAL SERVER ERROR:', JSON.stringify(logData, null, 2));
      // In production, this would also send to external monitoring service
      break;
    
    case ServerErrorSeverity.HIGH:
      console.error('🔥 HIGH SEVERITY SERVER ERROR:', JSON.stringify(logData, null, 2));
      break;
    
    case ServerErrorSeverity.MEDIUM:
      console.warn('⚠️  MEDIUM SEVERITY SERVER ERROR:', JSON.stringify(logData, null, 2));
      break;
    
    case ServerErrorSeverity.LOW:
      console.info('ℹ️  LOW SEVERITY SERVER ERROR:', JSON.stringify(logData, null, 2));
      break;
    
    default:
      console.log('📝 SERVER ERROR:', JSON.stringify(logData, null, 2));
  }

  // In production, you would also:
  // - Send to external logging service (e.g., Sentry, LogRocket, DataDog)
  // - Store in database for analytics
  // - Send alerts for critical errors
  // - Update metrics/monitoring dashboards
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: ServerError,
  includeDetails = false
): NextResponse<APIErrorResponse> {
  const response: APIErrorResponse = {
    success: false,
    error: error.userMessage,
    code: error.type,
    requestId: error.requestId,
    timestamp: error.timestamp.toISOString(),
  };

  // Include technical details in development or for debugging
  if (includeDetails && (process.env.NODE_ENV === 'development' || error.severity === ServerErrorSeverity.LOW)) {
    response.details = {
      technicalMessage: error.technicalMessage,
      context: error.context,
    };
  }

  // Log the error
  logServerError(error);

  return NextResponse.json(response, { status: error.statusCode });
}

/**
 * Generates a unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extracts request context from Next.js request
 */
export function extractRequestContext(
  request: Request,
  endpoint: string,
  userId?: string
): Partial<ServerErrorContext> {
  return {
    endpoint,
    method: request.method,
    userId,
    userAgent: request.headers.get('user-agent') || undefined,
    // Note: Getting real IP in Next.js requires additional setup with reverse proxy headers
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
  };
}

/**
 * Middleware for handling errors in API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context?: Partial<ServerErrorContext>
) {
  return async (...args: T): Promise<R | NextResponse<APIErrorResponse>> => {
    const startTime = Date.now();
    
    try {
      const result = await handler(...args);
      
      // Log successful requests in development
      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - startTime;
        console.log(`✅ ${context?.method || 'REQUEST'} ${context?.endpoint || 'UNKNOWN'} - ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const serverError = mapToServerError(error, {
        ...context,
        duration,
      });
      
      return createErrorResponse(serverError, process.env.NODE_ENV === 'development');
    }
  };
}

/**
 * Validates request parameters and throws appropriate errors
 */
export function validateRequired(value: any, fieldName: string, context?: Partial<ServerErrorContext>): void {
  if (value === undefined || value === null || value === '') {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `${fieldName} is required`,
      context
    );
  }
}

/**
 * Validates UUID format
 */
export function validateUUID(value: string, fieldName: string, context?: Partial<ServerErrorContext>): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(value)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `${fieldName} must be a valid UUID`,
      context
    );
  }
}

/**
 * Validates file upload parameters
 */
export function validateFileUpload(
  file: File | null,
  maxSize: number,
  allowedTypes: string[],
  context?: Partial<ServerErrorContext>
): void {
  if (!file) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'No file provided',
      context
    );
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `File size exceeds ${maxSizeMB}MB limit`,
      { ...context, fileSize: file.size, fileName: file.name }
    );
  }

  if (!allowedTypes.includes(file.type)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `File type ${file.type} is not allowed`,
      { ...context, fileSize: file.size, fileName: file.name }
    );
  }

  if (file.size === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'File is empty',
      { ...context, fileSize: file.size, fileName: file.name }
    );
  }
}

/**
 * Rate limiting helper (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
  context?: Partial<ServerErrorContext>
): void {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  if (current.count >= maxRequests) {
    throw createServerError(
      ServerErrorType.RATE_LIMIT_ERROR,
      `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`,
      context
    );
  }
  
  current.count++;
}