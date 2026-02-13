import Redis from "ioredis";
import fs from "fs";
import path from "path";
import {
  ConsumeResult,
  RateLimitOptions,
} from "../../shared/types/rateLimiting";
import { IRateLimitingService } from "../../domain/services/IRateLimitingService";

import {
  Identifier,
  IdentifierType,
  PrefixTypes,
} from "../../shared/utils/rate-limiting";
export class RateLimitingService implements IRateLimitingService {
  private static cachedLua: string | null = null;
  private redis: Redis;
  private lua: string;
  private defaultCapacity: number;
  private defaultRefillRate: number;

  constructor(
    redis: Redis,
    defaultCapacity: number,
    defaultRefillRate: number,
  ) {
    this.redis = redis;
    this.defaultCapacity = defaultCapacity;
    this.defaultRefillRate = defaultRefillRate;

    if (!RateLimitingService.cachedLua) {
      RateLimitingService.cachedLua = fs.readFileSync(
        path.join(__dirname, "../../shared/utils/token_bucket.lua"),
        "utf8",
      );
    }
    this.lua = RateLimitingService.cachedLua;
  }

  /** Generate Redis key for an identifier + bucket type */
  private getKey(identifier: Identifier, keyPrefix: string): string {
    return `${keyPrefix}:${identifier.type}:${identifier.value}`;
  }

  /**
   * Try to consume tokens from a bucket
   * @param identifier - unique identifier (userId, IP, etc)
   * @param options - cost, capacity, refillRate
   * @param bucket - bucket type: 'request', 'ai', 'uploads', etc
   * @returns true if tokens were available, false if rate-limited
   */
  async tryConsume(
    identifier: Identifier,
    options: RateLimitOptions = {},
    bucket: string = PrefixTypes.REQUEST,
  ): Promise<ConsumeResult> {
    const now = Math.floor(Date.now() / 1000);
    const capacity = options.capacity ?? this.defaultCapacity;
    const refillRate = options.refillRate ?? this.defaultRefillRate;
    const cost = options.cost ?? 1;

    const key = this.getKey(identifier, bucket);

    const result = await this.redis.eval(
      this.lua,
      1,
      key,
      capacity,
      refillRate,
      cost,
      now,
      options.force ? "true" : "false",
    );

    const remaining = await this.getRemaining(identifier, options, bucket);

    if (result === 1) {
      // request allowed
      return { allowed: true, remaining };
    } else {
      // calculate retry-after in seconds
      const retryAfter = Math.ceil((cost - remaining) / refillRate);
      return { allowed: false, remaining, retryAfter };
    }
  }

  /**
   * Get the estimated remaining tokens in a bucket
   * @param identifier
   * @param options
   * @param bucket
   * @returns number of remaining tokens
   */
  async getRemaining(
    identifier: Identifier,
    options: RateLimitOptions = {},
    bucket: string = PrefixTypes.REQUEST,
  ): Promise<number> {
    const capacity = options.capacity ?? this.defaultCapacity;
    const refillRate = options.refillRate ?? this.defaultRefillRate;
    const key = this.getKey(identifier, bucket);

    const [tokensStr, lastRefillStr] = await this.redis.hmget(
      key,
      "tokens",
      "last_refill",
    );

    if (tokensStr === null || lastRefillStr === null) return capacity;

    const tokens = parseFloat(tokensStr);
    const lastRefill = parseFloat(lastRefillStr);

    if (isNaN(tokens) || isNaN(lastRefill)) return capacity;

    const now = Date.now() / 1000;
    const elapsed = Math.max(0, now - lastRefill);

    return Math.min(capacity, tokens + elapsed * refillRate);
  }
  async reset(identifier: Identifier, bucket: string = PrefixTypes.REQUEST) {
    const key = this.getKey(identifier, bucket);
    await this.redis.del(key);
  }
}
