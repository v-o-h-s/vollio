import {
  ConsumeResult,
  RateLimitOptions,
} from "../../shared/types/rateLimiting";

export interface IRateLimitingService {
  tryConsume(
    userId: string,
    options: RateLimitOptions,
    bucket: string
  ): Promise<ConsumeResult>;
  getRemaining(userId: string, options: RateLimitOptions): Promise<number>;
}
