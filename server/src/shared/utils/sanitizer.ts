/**
 * Input sanitization utilities for XSS prevention and content validation.
 */
import xssFilters from "xss-filters";
import { ValidationFieldError } from "../errors/ValidationError";

// Configuration
export const SANITIZATION_LIMITS = {
  MAX_NAME_LENGTH: 255,
  MAX_TITLE_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_CONTENT_LENGTH: 100000,
} as const;

// XSS detection patterns - common attack vectors
const XSS_PATTERNS = [
  /<script\b[^>]*>[\s\S]*?<\/script>/gi, // Script tags
  /<script\b[^>]*>/gi, // Unclosed script tags
  /javascript\s*:/gi, // javascript: protocol
  /on\w+\s*=\s*["']?[^"'>]*/gi, // Event handlers (onclick, onerror, etc.)
  /data:\s*text\/html/gi, // Data URI with HTML
  /<iframe\b[^>]*>/gi, // Iframe injection
  /<embed\b[^>]*>/gi, // Embed tags
  /<object\b[^>]*>/gi, // Object tags
  /expression\s*\(/gi, // CSS expression()
  /url\s*\(\s*["']?\s*javascript:/gi, // CSS url() with javascript
];

/**
 * Check if input contains potential XSS attack patterns
 */
export function containsXSS(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Sanitize text for safe HTML display
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return xssFilters.inHTMLData(input);
}

/**
 * Sanitize text for use in HTML attributes
 */
export function sanitizeAttribute(input: string): string {
  if (!input || typeof input !== "string") return "";
  return xssFilters.inDoubleQuotedAttr(input);
}

/**
 * Validate and sanitize a name field (folder name, document name, etc.)
 */
export function validateAndSanitizeName(
  input: string,
  fieldName: string,
  maxLength: number = SANITIZATION_LIMITS.MAX_NAME_LENGTH
): { sanitized: string; errors: ValidationFieldError[] } {
  const errors: ValidationFieldError[] = [];

  if (!input || typeof input !== "string") {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: "required",
    });
    return { sanitized: "", errors };
  }

  const trimmed = input.trim();

  if (trimmed.length === 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} cannot be empty`,
      code: "required",
    });
    return { sanitized: "", errors };
  }

  if (trimmed.length > maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must not exceed ${maxLength} characters`,
      code: "too_long",
    });
  }

  if (containsXSS(trimmed)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} contains potentially malicious content`,
      code: "xss_detected",
    });
  }

  // Sanitize and truncate
  const sanitized = sanitizeText(trimmed.slice(0, maxLength));
  return { sanitized, errors };
}

/**
 * Validate and sanitize a content field (notes, descriptions, etc.)
 */
export function validateAndSanitizeContent(
  input: string,
  fieldName: string,
  maxLength: number = SANITIZATION_LIMITS.MAX_CONTENT_LENGTH
): { sanitized: string; errors: ValidationFieldError[] } {
  const errors: ValidationFieldError[] = [];

  if (!input || typeof input !== "string") {
    // Content fields are often optional
    return { sanitized: "", errors };
  }

  if (input.length > maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must not exceed ${maxLength} characters`,
      code: "too_long",
    });
  }

  if (containsXSS(input)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} contains potentially malicious content`,
      code: "xss_detected",
    });
  }

  const sanitized = sanitizeText(input.slice(0, maxLength));
  return { sanitized, errors };
}

/**
 * Sanitize an object's string fields recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize: string[] = ["name", "title", "description"]
): { sanitized: T; errors: ValidationFieldError[] } {
  const errors: ValidationFieldError[] = [];
  const sanitized = { ...obj };

  for (const field of fieldsToSanitize) {
    if (typeof sanitized[field] === "string") {
      const result = validateAndSanitizeName(
        sanitized[field],
        field,
        field === "description"
          ? SANITIZATION_LIMITS.MAX_DESCRIPTION_LENGTH
          : SANITIZATION_LIMITS.MAX_NAME_LENGTH
      );
      errors.push(...result.errors);
      (sanitized as any)[field] = result.sanitized;
    }
  }

  return { sanitized, errors };
}
