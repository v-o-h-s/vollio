import { RateLimitOptions } from "../../shared/types/rateLimiting";

export interface IRateLimiter {
  tryConsume(userId: string, options: RateLimitOptions): Promise<boolean>;
  getRemaining(userId: string, options: RateLimitOptions): Promise<number>;
}
