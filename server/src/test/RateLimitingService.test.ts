import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { RateLimitingService } from "../infrastructure/services/RateLimitingService";
import { IdentifierType, PrefixTypes } from "../shared/utils/rate-limiting";
import Redis from "ioredis";

describe("RateLimitingService", () => {
  let rateLimiter: RateLimitingService;
  // Use 'any' or a partial mock type to avoid complex ioredis type mocking
  let redisMock: { eval: Mock; hmget: Mock };

  beforeEach(() => {
    // Create a mock object with just the methods we need
    redisMock = {
      eval: vi.fn(),
      hmget: vi.fn(),
    };

    // Inject the mock into the service (cast as unknown as Redis to satisfy type checker)
    rateLimiter = new RateLimitingService(redisMock as unknown as Redis, 10, 1);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("tryConsume", () => {
    it("should allow request when tokens are available (Lua script returns 1)", async () => {
      // Mock Lua script returning 1 (success)
      redisMock.eval.mockResolvedValue(1);
      // Mock getRemaining to return a valid number (tokens, last_refill)
      redisMock.hmget.mockResolvedValue(["9", (Date.now() / 1000).toString()]);

      const result = await rateLimiter.tryConsume({
        type: IdentifierType.USERID,
        value: "user1",
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(8);
      expect(redisMock.eval).toHaveBeenCalled();
    });

    it("should block request when tokens are not available (Lua script returns 0)", async () => {
      // Mock Lua script returning 0 (failure)
      redisMock.eval.mockResolvedValue(0);
      // Mock getRemaining returning 0 tokens
      redisMock.hmget.mockResolvedValue(["0", (Date.now() / 1000).toString()]);

      const result = await rateLimiter.tryConsume({
        type: IdentifierType.USERID,
        value: "user1",
      });

      expect(result.allowed).toBe(false);
      // If 0 tokens and we tried to consume 1, remaining is 0 (or technically -1 logic depending on lua, but we mock hmget)
      // The service implementation calls getRemaining after the lua script.
      expect(result.remaining).toBeLessThan(1);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("should use custom options when provided", async () => {
      redisMock.eval.mockResolvedValue(1);
      redisMock.hmget.mockResolvedValue(["18", (Date.now() / 1000).toString()]);

      await rateLimiter.tryConsume(
        { type: IdentifierType.USERID, value: "user1" },
        { cost: 2, capacity: 20 },
      );

      // Verify Lua script was called with custom capacity (ARGV[1]) and cost (ARGV[3])
      expect(redisMock.eval).toHaveBeenCalledWith(
        expect.any(String), // script
        1, // numKeys
        expect.stringContaining(`${PrefixTypes.REQUEST}:userId:user1`), // key
        20, // capacity
        1, // default refill rate
        2, // cost
        expect.any(Number), // now
      );
    });
  });

  describe("getRemaining", () => {
    it("should return capacity if no data exists in Redis", async () => {
      redisMock.hmget.mockResolvedValue([null, null]);

      const remaining = await rateLimiter.getRemaining({
        type: IdentifierType.USERID,
        value: "user1",
      });

      expect(remaining).toBe(10); // default capacity
    });

    it("should calculate remaining tokens correctly based on time elapsed", async () => {
      const now = Date.now() / 1000;
      const lastRefill = now - 5; // 5 seconds ago
      const currentTokens = 2;
      const refillRate = 1;

      // Mock hmget to return stored tokens and last_refill
      redisMock.hmget.mockResolvedValue([
        currentTokens.toString(),
        lastRefill.toString(),
      ]);

      const remaining = await rateLimiter.getRemaining({
        type: IdentifierType.USERID,
        value: "user1",
      });

      // Expected: 2 + (5 * 1) = 7

      // Allow for slight precision differences in execution time

      expect(remaining).toBeGreaterThanOrEqual(6.9);

      expect(remaining).toBeLessThanOrEqual(7.1);
    });

    it("should not exceed capacity even if a lot of time has passed", async () => {
      const now = Date.now() / 1000;

      const lastRefill = now - 1000000; // A long time ago

      const currentTokens = 5;

      const refillRate = 1;

      redisMock.hmget.mockResolvedValue([
        currentTokens.toString(),

        lastRefill.toString(),
      ]);

      const remaining = await rateLimiter.getRemaining({
        type: IdentifierType.USERID,
        value: "user1",
      });

      expect(remaining).toBe(10); // Should cap at the default capacity
    });
  });

  describe("Bucket Isolation", () => {
    it("should use different Redis keys for different buckets", async () => {
      redisMock.eval.mockResolvedValue(1);

      redisMock.hmget.mockResolvedValue(["10", (Date.now() / 1000).toString()]);

      // Request 1: regular request

      await rateLimiter.tryConsume(
        { type: IdentifierType.USERID, value: "user1" },
        {},
        "request",
      );

      expect(redisMock.eval).toHaveBeenCalledWith(
        expect.any(String),

        1,

        `${PrefixTypes.REQUEST}:userId:user1`,

        10,

        1,

        1,

        expect.any(Number),
      );

      // Request 2: AI request

      await rateLimiter.tryConsume(
        { type: IdentifierType.USERID, value: "user1" },
        {},
        PrefixTypes.AI_PER_MINUTE,
      );

      expect(redisMock.eval).toHaveBeenCalledWith(
        expect.any(String),

        1,

        `${PrefixTypes.AI_PER_MINUTE}:userId:user1`,

        10,

        1,

        1,

        expect.any(Number),
      );
    });
  });
});
