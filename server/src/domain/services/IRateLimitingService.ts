import {
  ConsumeResult,
  RateLimitOptions,
} from "../../shared/types/rateLimiting";
import { Identifier } from "../../infrastructure/services/RateLimitingService";

export interface IRateLimitingService {
  tryConsume(
    identifier: Identifier,
    options: RateLimitOptions,
    bucket?: string,
  ): Promise<ConsumeResult>;
  getRemaining(
    identifier: Identifier,
    options: RateLimitOptions,
    bucket?: string,
  ): Promise<number>;
}
