import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

// Transformed error response type
export interface TransformedRTKError {
  message: string;
  name: string;
}

/**
 * Extracts a user-friendly error message from RTK Query error types.
 * Use this when you need to display an error message from a query/mutation error.
 *
 * @example
 * const { error } = useGetDocumentsQuery();
 * if (error) {
 *   return <ErrorDisplay message={getErrorMessage(error)} />;
 * }
 */
export function getErrorMessage(
  error:
    | FetchBaseQueryError
    | SerializedError
    | TransformedRTKError
    | undefined,
  fallback: string = "An unexpected error occurred",
): string {
  if (!error) return fallback;

  // SerializedError has an optional message property
  if ("message" in error && error.message) {
    return error.message;
  }

  // FetchBaseQueryError with string status (FETCH_ERROR, PARSING_ERROR, etc.)
  if ("status" in error && typeof error.status === "string") {
    // Map status types to messages
    switch (error.status) {
      case "FETCH_ERROR":
        return "error" in error
          ? error.error
          : "Network error. Please check your internet connection.";
      case "PARSING_ERROR":
        return "error" in error
          ? error.error
          : "Failed to process server response.";
      case "TIMEOUT_ERROR":
        return "error" in error
          ? error.error
          : "Request timed out. Please try again.";
      case "CUSTOM_ERROR":
        return "error" in error ? error.error : fallback;
      default:
        return fallback;
    }
  }

  // FetchBaseQueryError with numeric status (HTTP errors)
  if (
    "status" in error &&
    typeof error.status === "number" &&
    "data" in error
  ) {
    const data = error.data as Record<string, unknown> | undefined;
    // Try to extract message from server response
    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
      if (
        "error" in data &&
        typeof data.error === "object" &&
        data.error !== null
      ) {
        const errorObj = data.error as Record<string, unknown>;
        if ("message" in errorObj && typeof errorObj.message === "string") {
          return errorObj.message;
        }
      }
    }
    return fallback;
  }

  return fallback;
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
