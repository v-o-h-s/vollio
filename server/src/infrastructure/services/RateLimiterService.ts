import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';
import { RateLimitOptions } from '../../shared/types/rateLimiting';

export class RateLimiter {
  private redis: Redis;
  private lua: string;
  private defaultCapacity: number;
  private defaultRefillRate: number;


  constructor(redis: Redis, defaultCapacity: number, defaultRefillRate: number) {
    this.redis = redis;
    this.defaultCapacity = defaultCapacity;
    this.defaultRefillRate = defaultRefillRate;
    this.lua = fs.readFileSync(
      path.join(__dirname, '../../shared/utils/token_bucket.lua'),
      'utf8'
    );
  }

  /** Generate Redis key for a user + bucket type */
  private getKey(userId: string, bucket: string) {
    return `rate:${bucket}:${userId}`;
  }

  /**
   * Try to consume tokens from a bucket
   * @param userId - unique user identifier
   * @param options - cost, capacity, refillRate
   * @param bucket - bucket type: 'request', 'ai', 'uploads', etc
   * @returns true if tokens were available, false if rate-limited
   */
  async tryConsume(
    userId: string,
    options: RateLimitOptions = {},
    bucket: string = 'request'
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const capacity = options.capacity ?? this.defaultCapacity;
    const refillRate = options.refillRate ?? this.defaultRefillRate;
    const cost = options.cost ?? 1;

    const key = this.getKey(userId, bucket);

    const result = await this.redis.eval(
      this.lua,
      1,
      key,
      capacity,
      refillRate,
      cost,
      now
    );

    // Optional: set a TTL so Redis cleans up inactive users automatically
    if (result === 1) {
      await this.redis.expire(key, this.defaultTTL);
    }

    return result === 1;
  }

  /**
   * Get the estimated remaining tokens in a bucket
   * @param userId
   * @param options
   * @param bucket
   * @returns number of remaining tokens
   */
  async getRemaining(
    userId: string,
    options: RateLimitOptions = {},
    bucket: string = 'request'
  ): Promise<number> {
    const capacity = options.capacity ?? this.defaultCapacity;
    const refillRate = options.refillRate ?? this.defaultRefillRate;
    const key = this.getKey(userId, bucket);

    const [tokensStr, lastRefillStr] = await this.redis.hmget(key, 'tokens', 'last_refill');

    if (tokensStr === null || lastRefillStr === null) return capacity;

    const tokens = parseFloat(tokensStr);
    const lastRefill = parseFloat(lastRefillStr);

    if (isNaN(tokens) || isNaN(lastRefill)) return capacity;

    const now = Date.now() / 1000;
    const elapsed = Math.max(0, now - lastRefill);

    return Math.min(capacity, tokens + elapsed * refillRate);
  }
}
