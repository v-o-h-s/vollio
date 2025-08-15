/**
 * Enhanced security validation utilities for file uploads and user operations
 */

import { createServerError, ServerErrorType } from './server-error-handling';
import { STORAGE_CONFIG } from '../supabaseClient';

// PDF magic number signatures for validation
const PDF_SIGNATURES = [
  [0x25, 0x50, 0x44, 0x46], // %PDF
];

// Malicious patterns to detect in PDF content
const MALICIOUS_PATTERNS = [
  /\/JavaScript/i,
  /\/JS/i,
  /\/OpenAction/i,
  /\/Launch/i,
  /\/EmbeddedFile/i,
  /\/XFA/i,
  /<script/i,
  /javascript:/i,
  /vbscript:/i,
  /data:text\/html/i,
];

// File extension validation
const ALLOWED_EXTENSIONS = ['.pdf'];

// User quota limits
export const QUOTA_LIMITS = {
  MAX_FILES_PER_USER: 100,
  MAX_STORAGE_PER_USER: 500 * 1024 * 1024, // 500MB
  MAX_UPLOADS_PER_HOUR: 20,
  MAX_UPLOADS_PER_DAY: 100,
};

// Rate limiting windows
export const RATE_LIMIT_WINDOWS = {
  UPLOAD: {
    requests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  API_CALLS: {
    requests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  AUTH_ATTEMPTS: {
    requests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};

export interface SecurityValidationResult {
  valid: boolean;
  error?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

export interface UserQuotaInfo {
  currentFiles: number;
  currentStorage: number;
  uploadsToday: number;
  uploadsThisHour: number;
  canUpload: boolean;
  quotaExceeded: string[];
}

/**
 * Validates PDF file content beyond MIME type checking
 */
export async function validatePDFContent(file: File): Promise<SecurityValidationResult> {
  try {
    // Read first 1024 bytes for header validation
    const headerBuffer = await file.slice(0, 1024).arrayBuffer();
    const headerBytes = new Uint8Array(headerBuffer);

    // Check PDF magic number
    const hasPDFSignature = PDF_SIGNATURES.some(signature =>
      signature.every((byte, index) => headerBytes[index] === byte)
    );

    if (!hasPDFSignature) {
      return {
        valid: false,
        error: 'File does not appear to be a valid PDF',
        severity: 'high',
        details: { reason: 'invalid_pdf_signature' }
      };
    }

    // Read more content for malicious pattern detection (up to 10KB)
    const contentSize = Math.min(file.size, 10 * 1024);
    const contentBuffer = await file.slice(0, contentSize).arrayBuffer();
    const contentText = new TextDecoder('utf-8', { fatal: false }).decode(contentBuffer);

    // Check for malicious patterns
    const maliciousPattern = MALICIOUS_PATTERNS.find(pattern => pattern.test(contentText));
    if (maliciousPattern) {
      return {
        valid: false,
        error: 'PDF contains potentially malicious content',
        severity: 'critical',
        details: { 
          reason: 'malicious_content_detected',
          pattern: maliciousPattern.toString()
        }
      };
    }

    // Check for suspicious file structure
    if (contentText.includes('/EmbeddedFile') && contentText.includes('/JavaScript')) {
      return {
        valid: false,
        error: 'PDF contains embedded files with JavaScript',
        severity: 'critical',
        details: { reason: 'embedded_javascript' }
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to validate PDF content',
      severity: 'medium',
      details: { reason: 'validation_error', error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

/**
 * Validates file extension and name security
 */
export function validateFileName(filename: string): SecurityValidationResult {
  // Check filename length
  if (!filename || filename.length === 0) {
    return {
      valid: false,
      error: 'Filename is required',
      severity: 'medium'
    };
  }

  if (filename.length > 255) {
    return {
      valid: false,
      error: 'Filename is too long (max 255 characters)',
      severity: 'low'
    };
  }

  // Check file extension
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Only PDF files are allowed',
      severity: 'medium'
    };
  }

  // Check for dangerous filename patterns
  const dangerousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*\x00-\x1f]/, // Invalid filename characters and control characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i, // Windows reserved names
    /^\s+|\s+$/, // Leading/trailing whitespace
    /\.(exe|bat|cmd|scr|pif|com|dll|vbs|js|jar|app|deb|rpm)$/i, // Executable extensions
  ];

  const dangerousPattern = dangerousPatterns.find(pattern => pattern.test(filename));
  if (dangerousPattern) {
    return {
      valid: false,
      error: 'Filename contains invalid or dangerous characters',
      severity: 'high',
      details: { pattern: dangerousPattern.toString() }
    };
  }

  // Check for Unicode normalization attacks
  if (filename !== filename.normalize('NFC')) {
    return {
      valid: false,
      error: 'Filename contains invalid Unicode characters',
      severity: 'medium'
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation combining all security checks
 */
export async function validateFileUploadSecurity(file: File): Promise<SecurityValidationResult> {
  // Basic file validation
  if (!file) {
    return {
      valid: false,
      error: 'No file provided',
      severity: 'medium'
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
      severity: 'medium'
    };
  }

  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
      severity: 'low'
    };
  }

  // MIME type validation
  if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF files are allowed',
      severity: 'medium'
    };
  }

  // Filename validation
  const filenameValidation = validateFileName(file.name);
  if (!filenameValidation.valid) {
    return filenameValidation;
  }

  // PDF content validation
  const contentValidation = await validatePDFContent(file);
  if (!contentValidation.valid) {
    return contentValidation;
  }

  return { valid: true };
}

/**
 * Check user quota limits
 */
export async function checkUserQuota(
  supabaseClient: any,
  userId: string
): Promise<UserQuotaInfo> {
  try {
    // Get current file count and total storage
    const { data: files, error: filesError } = await supabaseClient
      .from('pdfs')
      .select('file_size, uploaded_at')
      .eq('user_id', userId);

    if (filesError) {
      throw createServerError(
        ServerErrorType.DATABASE_ERROR,
        `Failed to check user quota: ${filesError.message}`,
        { userId, operation: 'quota_check' },
        filesError
      );
    }

    const currentFiles = files?.length || 0;
    const currentStorage = files?.reduce((total, file) => total + file.file_size, 0) || 0;

    // Calculate uploads in the last 24 hours and 1 hour
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const uploadsToday = files?.filter(file => 
      new Date(file.uploaded_at) > oneDayAgo
    ).length || 0;

    const uploadsThisHour = files?.filter(file => 
      new Date(file.uploaded_at) > oneHourAgo
    ).length || 0;

    // Check quota violations
    const quotaExceeded: string[] = [];
    
    if (currentFiles >= QUOTA_LIMITS.MAX_FILES_PER_USER) {
      quotaExceeded.push(`Maximum ${QUOTA_LIMITS.MAX_FILES_PER_USER} files per user`);
    }
    
    if (currentStorage >= QUOTA_LIMITS.MAX_STORAGE_PER_USER) {
      const maxStorageMB = QUOTA_LIMITS.MAX_STORAGE_PER_USER / (1024 * 1024);
      quotaExceeded.push(`Maximum ${maxStorageMB}MB storage per user`);
    }
    
    if (uploadsToday >= QUOTA_LIMITS.MAX_UPLOADS_PER_DAY) {
      quotaExceeded.push(`Maximum ${QUOTA_LIMITS.MAX_UPLOADS_PER_DAY} uploads per day`);
    }
    
    if (uploadsThisHour >= QUOTA_LIMITS.MAX_UPLOADS_PER_HOUR) {
      quotaExceeded.push(`Maximum ${QUOTA_LIMITS.MAX_UPLOADS_PER_HOUR} uploads per hour`);
    }

    return {
      currentFiles,
      currentStorage,
      uploadsToday,
      uploadsThisHour,
      canUpload: quotaExceeded.length === 0,
      quotaExceeded,
    };
  } catch (error) {
    // If it's already a ServerError, re-throw it
    if (error && typeof error === 'object' && 'type' in error) {
      throw error;
    }

    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      'Failed to check user quota',
      { userId, operation: 'quota_check' },
      error
    );
  }
}

/**
 * Enhanced rate limiting with multiple windows and user-specific limits
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number; violations: number }>();

export function checkEnhancedRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMIT_WINDOWS,
  context?: any
): void {
  const limits = RATE_LIMIT_WINDOWS[limitType];
  const now = Date.now();
  const key = `${limitType}:${identifier}`;
  
  // Clean up expired entries
  for (const [entryKey, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(entryKey);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { 
      count: 1, 
      resetTime: now + limits.windowMs,
      violations: 0
    });
    return;
  }
  
  if (current.count >= limits.requests) {
    current.violations++;
    
    // Increase penalty for repeated violations
    const penaltyMultiplier = Math.min(current.violations, 5);
    const penaltyTime = limits.windowMs * penaltyMultiplier;
    
    throw createServerError(
      ServerErrorType.RATE_LIMIT_ERROR,
      `Rate limit exceeded for ${limitType}. Maximum ${limits.requests} requests per ${limits.windowMs / 1000} seconds. Try again in ${Math.ceil(penaltyTime / 1000)} seconds.`,
      context,
      { 
        limitType, 
        violations: current.violations,
        penaltyTime: penaltyTime / 1000
      }
    );
  }
  
  current.count++;
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .normalize('NFC') // Normalize Unicode
    .replace(/[<>:"|?*\x00-\x1f]/g, '_') // Replace invalid characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 200); // Limit length
}

/**
 * Generate secure storage path with additional entropy
 */
export function generateSecureStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = sanitizeFilename(filename);
  
  return `${userId}/${timestamp}_${randomSuffix}_${sanitizedFilename}`;
}