import {
  ConsumeResult,
  RateLimitOptions,
} from "../../shared/types/rateLimiting";
import { Identifier } from "../../shared/utils/rate-limiting";

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
  reset(identifier: Identifier, bucket?: string): Promise<void>;
}
