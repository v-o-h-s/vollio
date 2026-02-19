import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { formatDuration } from "./formatTime";

// Transformed error response type
export interface TransformedRTKError {
  message: string;
  name: string;
}

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
 *
 * @example
 * transformErrorResponse: (response) => transformRTKQueryError(response),
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

  // Network/fetch errors (no connection, CORS, etc.)
  if (status === "FETCH_ERROR") {
    return {
      message: options?.context
        ? `Network error while ${options.context}. Please check your internet connection.`
        : "Network error. Please check your internet connection.",
      name: "FetchError",
    };
  }

  // JSON parsing errors
  if (status === "PARSING_ERROR") {
    return {
      message: "Failed to process server response. Please try again.",
      name: "ParsingError",
    };
  }

  // Timeout errors
  if (status === "TIMEOUT_ERROR") {
    return {
      message: "Request timed out. Please try again.",
      name: "TimeoutError",
    };
  }

  // Custom errors
  if (status === "CUSTOM_ERROR") {
    return {
      message: (response as any).error || "An error occurred.",
      name: "CustomError",
    };
  }

  // HTTP errors - extract server error from data
  const serverError = response.data as any;
  const serverMessage = serverError?.error?.message || serverError?.message;
  const errorName = serverError?.error?.name || "UnknownError";
  if (errorName === "RateLimitingError") {
    // Retry-After is typically in seconds
    const retryAfterSeconds = serverError?.error?.extra?.retryAfter;

    if (typeof retryAfterSeconds === "number") {
      const formattedTime = formatDuration(retryAfterSeconds);
      return {
        message: `Too many requests. Please try again after ${formattedTime}.`,
        name: errorName,
      };
    }

    return {
      message: "Too many requests. Please try again later.",
      name: errorName,
    };
  }
  // Use custom 404 message if provided
  if (status === 404 && options?.notFoundMessage) {
    return {
      message: options.notFoundMessage,
      name: "NotFoundError",
    };
  }

  return {
    message:
      serverMessage ||
      HTTP_STATUS_MESSAGES[status as number] ||
      "An unexpected error occurred",
    name: errorName,
  };
}
