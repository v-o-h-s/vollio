/**
 * Error thrown when a rate limit is exceeded.
 * Contains details about the limit that was exceeded and when it resets.
 */
export class RateLimitingError extends Error {
  public readonly statusCode: number = 429;
  public readonly code: string = "RATE_LIMIT_EXCEEDED";
  public readonly source: string;
  public readonly retryAfter?: number;
  public readonly limit?: number;
  public readonly remaining?: number;
  public readonly reset?: number;
  public readonly details?: Record<string, any>;

  constructor(opts: {
    message?: string;
    source: string;
    retryAfter?: number;
    limit?: number;
    remaining?: number;
    reset?: number;
    details?: Record<string, any>;
  }) {
    super(opts.message || "Rate limit exceeded");
    this.name = "RateLimitingError";
    this.source = opts.source;
    this.retryAfter = opts.retryAfter;
    this.limit = opts.limit;
    this.remaining = opts.remaining;
    this.reset = opts.reset;
    this.details = opts.details;
  }

  /**
   * Returns the HTTP headers compliant with IETF RFC 6585 and others
   */
  public getHeaders(): Record<string, string | number | string[]> {
    const headers: Record<string, string | number> = {};

    if (this.retryAfter !== undefined) {
      headers["Retry-After"] = this.retryAfter;
    }

    if (this.limit !== undefined) {
      headers["X-RateLimit-Limit"] = this.limit;
    }

    if (this.remaining !== undefined) {
      headers["X-RateLimit-Remaining"] = this.remaining;
    }

    if (this.reset !== undefined) {
      headers["X-RateLimit-Reset"] = this.reset;
    }

    return headers;
  }
}
