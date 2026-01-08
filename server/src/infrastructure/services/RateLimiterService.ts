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
    this.lua = fs.readFileSync(path.join(__dirname, '../../shared/utils/token_bucket.lua'), 'utf8');
  }

  async tryConsume(
    userId: string,
    options: RateLimitOptions = {}
  ): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);

    const capacity = options.capacity ?? this.defaultCapacity;
    const refillRate = options.refillRate ?? this.defaultRefillRate;
    const cost = options.cost ?? 1;

    const key = `rate:${userId}`;

    const result = await this.redis.eval(
      this.lua,
      1,
      key,
      capacity,
      refillRate,
      cost,
      now
    );

    return result === 1;
  }

  async getRemaining(userId: string, options: RateLimitOptions = {}): Promise<number> {
    const capacity = options.capacity ?? this.defaultCapacity;
    const data = await this.redis.hmget(`rate:${userId}`, 'tokens', 'last_refill');
    let tokens = parseFloat(data[0]);
    const lastRefill = parseFloat(data[1]);

    if (!tokens || !lastRefill) return capacity;

    const elapsed = (Date.now() / 1000) - lastRefill;
    tokens = Math.min(capacity, tokens + elapsed * (options.refillRate ?? this.defaultRefillRate));
    return tokens;
  }
}
