// AIErrorNormalizer.ts

import { BaseAppError, ErrorSeverity } from "./BaseAppError";

export interface NormalizedAIError {
  name: string; // e.g. "BadRequestError", "APIConnectionError"
  message: string; // readable message
  status: number; // HTTP status code
  type: string; // semantic type: invalid_request, server_error, network_error...
  code?: string | number; // provider-specific code
  param?: string; // invalid param
  raw: any; // always store original error
}

export class AIError extends BaseAppError {
  public name: string;
  public type: string;
  public code?: string | number;
  public param?: string;
  public raw: any;
  static normalize(err: any): NormalizedAIError {
    // 1. Fallbacks
    let name = err?.name || "AIError";
    let message = err?.message || "Unknown AI error";
    let status = err?.status || err?.statusCode || 500;
    let type = "unknown_error";
    let code: string | number | undefined;
    let param: string | undefined;

    // 2. Errors shaped like: { error: { message, type, code, param } }
    if (err?.error && typeof err.error === "object") {
      message = err.error.message || message;
      type = err.error.type || type;
      code = err.error.code || code;
      param = err.error.param || param;
      status = err.status || status;
    }

    // 3. OpenRouter weird format: { message, status } or { detail }
    if (!err.error && err?.message && err?.status) {
      message = err.message;
      status = err.status;
      type = "provider_error";
    }
    if (err?.detail) {
      message = err.detail;
      type = "provider_error";
    }

    // 4. SDK-level errors: APIConnectionError, Timeout, etc.
    if (name.includes("APIConnection") || name.includes("Timeout")) {
      type = "network_error";
      status = 503;
    }

    // 5. Rate limiting
    if (name.includes("RateLimit") || status === 429) {
      type = "rate_limit_error";
      status = 429;
    }

    // 6. Authentication errors
    if (name.includes("Authentication") || status === 401 || status === 403) {
      type = "auth_error";
    }

    // 7. Validation errors
    if (name.includes("BadRequest") || status === 400) {
      type = "invalid_request_error";
    }

    // 8. Server-side issues
    if (status >= 500) {
      type = "server_error";
    }

    return {
      name,
      message,
      status,
      type,
      code,
      param,
      raw: err, // always keep raw for logs
    };
  }
  private constructor(err: any) {
    const normalized = AIError.normalize(err);
    super(normalized.message, {
      severity:
        normalized.status >= 500
          ? ErrorSeverity.CRITICAL
          : normalized.status >= 400
          ? ErrorSeverity.HIGH
          : ErrorSeverity.MEDIUM,
      userMessage: normalized.message,
      statusCode: normalized.status,
      cause: err instanceof Error ? err : undefined,
    });
    this.name = normalized.name;
    this.type = normalized.type;
    this.code = normalized.code;
    this.param = normalized.param;
    this.raw = normalized.raw;
  }

  static fromError(err: any): AIError {
    return new AIError(err);
  }

  getTitle() {
    return this.name;
  }
}
