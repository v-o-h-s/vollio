export interface RateLimitOptions {
  capacity?: number;
  refillRate?: number;
  cost?: number;
  force?: boolean;
}
export interface ConsumeResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // seconds to wait if rate-limited
}
