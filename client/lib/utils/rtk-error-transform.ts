import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { formatDuration } from "./formatTime";

// Transformed error response type
export interface TransformedRTKError {
  message: string;
  name: string;
}

// List of error names that are safe to show to the user
// These contain actionable information the user can resolve.
const SAFE_SERVER_ERRORS = [
  "RateLimitingError",
  "QuotaExceededError",
  "ValidationError",
  "NotFoundError",
  "ConflictError",
  "AuthError",
];

// HTTP status code to user-friendly message mapping
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "You need to log in to access this resource.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "A conflict occurred. The resource may already exist.",
  422: "Validation failed. Please check your input.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Server error. Our team has been notified.",
  502: "Service temporarily unavailable. Please try again later.",
  503: "Service is currently under maintenance. Please try again later.",
  504: "Server took too long to respond. Please try again.",
};

/**
 * Transforms RTK Query FetchBaseQueryError into a user-friendly error object.
 * Use this in `transformErrorResponse` callbacks for consistent error handling.
 */
export function transformRTKQueryError(
  response: FetchBaseQueryError,
  options?: {
    /** Custom 404 message (e.g., "Document not found" instead of generic) */
    notFoundMessage?: string;
    /** Custom context for the error (e.g., "loading documents") */
    context?: string;
  },
): TransformedRTKError {
  const status = response.status;

  // 1. Handle Hardcoded Network/Fetch Errors
  if (status === "FETCH_ERROR") {
    return {
      message: options?.context
        ? `Network error while ${options.context}. Please check your internet connection.`
        : "Network error. Please check your internet connection.",
      name: "FetchError",
    };
  }

  if (status === "PARSING_ERROR") {
    return {
      message: "Failed to process server response. Please try again.",
      name: "ParsingError",
    };
  }

  if (status === "TIMEOUT_ERROR") {
    return {
      message: "Request timed out. Please try again.",
      name: "TimeoutError",
    };
  }

  if (status === "CUSTOM_ERROR") {
    return {
      message: (response as any).error || "An error occurred.",
      name: "CustomError",
    };
  }

  // 2. Extract Server Error Data
  const serverError = response.data as any;
  const serverMessage = serverError?.error?.message || serverError?.message;
  const errorName = serverError?.error?.name || "UnknownError";

  // 3. Special Handling: Rate Limiting (Actionable)
  if (errorName === "RateLimitingError") {
    const retryAfterSeconds = serverError?.error?.extra?.retryAfter;
    if (typeof retryAfterSeconds === "number") {
      const formattedTime = formatDuration(retryAfterSeconds);
      return {
        message: `Too many requests. Please try again after ${formattedTime}.`,
        name: errorName,
      };
    }
  }

  // 4. Special Handling: Custom Not Found
  if (status === 404 && options?.notFoundMessage) {
    return {
      message: options.notFoundMessage,
      name: "NotFoundError",
    };
  }

  // 5. Whitelist Logic: Only show the server message if the error name is "SAFE"
  const isSafeError = SAFE_SERVER_ERRORS.includes(errorName);
  const finalMessage = isSafeError
    ? serverMessage || HTTP_STATUS_MESSAGES[status as number]
    : HTTP_STATUS_MESSAGES[status as number] ||
      "An unexpected error occurred. Please try again later.";

  return {
    message: finalMessage,
    name: errorName,
  };
}
