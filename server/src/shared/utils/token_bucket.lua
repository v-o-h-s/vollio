-- Redis Lua script for Token Bucket rate limiting
-- Keys: 
--   KEYS[1]: userKey (e.g., "rate:userId")
-- Arguments:
--   ARGV[1]: capacity (max tokens)
--   ARGV[2]: refill_rate (tokens per second)
--   ARGV[3]: cost (tokens to consume)
-- Arguments:
--   ARGV[4]: now (current timestamp in seconds)
--   ARGV[5]: force (bool/string: "true" or "1" to consume even if insufficient)

local userKey = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local force = (ARGV[5] == "true" or ARGV[5] == "1")

-- Get current tokens and last refill time
local data = redis.call("HMGET", userKey, "tokens", "last_refill")
local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

-- Initialize if first request
if tokens == nil then
  tokens = capacity
  last_refill = now
end

-- Refill tokens based on elapsed time
local elapsed = math.max(0, now - last_refill)
tokens = math.min(capacity, tokens + elapsed * refill_rate)

-- Try to consume tokens
if tokens >= cost or force then
  tokens = tokens - cost
  redis.call("HMSET", userKey, "tokens", tokens, "last_refill", now)
  return 1 -- Success (allowed)
else
  -- Still update the refilled count even if consumption failed
  redis.call("HMSET", userKey, "tokens", tokens, "last_refill", now)
  return 0 -- Failed (Rate Limited)
end