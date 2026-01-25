-- Token Quota Lua Script
-- Purpose: Atomically check and consume tokens with automatic reset handling
-- 
-- Keys:
--   KEYS[1]: daily usage key (token:quota:{userId}:daily)
--   KEYS[2]: monthly usage key (token:quota:{userId}:monthly)
--
-- Arguments:
--   ARGV[1]: weighted tokens to consume
--   ARGV[2]: daily limit
--   ARGV[3]: monthly limit
--   ARGV[4]: current timestamp (seconds since epoch)
--   ARGV[5]: daily reset timestamp (start of today in seconds)
--   ARGV[6]: monthly reset timestamp (start of month in seconds)
--
-- Returns:
--   {allowed (0 or 1), daily_used, monthly_used, reason}
--   reason: 0 = allowed, 1 = daily_limit, 2 = monthly_limit

local daily_key = KEYS[1]
local monthly_key = KEYS[2]

local tokens_to_consume = tonumber(ARGV[1])
local daily_limit = tonumber(ARGV[2])
local monthly_limit = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local daily_reset_ts = tonumber(ARGV[5])
local monthly_reset_ts = tonumber(ARGV[6])

-- Get current usage, check for reset
local daily_data = redis.call("HMGET", daily_key, "used", "reset_ts")
local monthly_data = redis.call("HMGET", monthly_key, "used", "reset_ts")

local daily_used = tonumber(daily_data[1]) or 0
local daily_last_reset = tonumber(daily_data[2]) or 0
local monthly_used = tonumber(monthly_data[1]) or 0
local monthly_last_reset = tonumber(monthly_data[2]) or 0

-- Check if daily quota needs reset (if last reset was before today)
if daily_last_reset < daily_reset_ts then
  daily_used = 0
  redis.call("HMSET", daily_key, "used", 0, "reset_ts", now)
end

-- Check if monthly quota needs reset (if last reset was before this month)
if monthly_last_reset < monthly_reset_ts then
  monthly_used = 0
  redis.call("HMSET", monthly_key, "used", 0, "reset_ts", now)
end

-- Check daily limit
if daily_used + tokens_to_consume > daily_limit then
  return {0, daily_used, monthly_used, 1}  -- Daily limit exceeded
end

-- Check monthly limit
if monthly_used + tokens_to_consume > monthly_limit then
  return {0, daily_used, monthly_used, 2}  -- Monthly limit exceeded
end

-- Consume tokens
local new_daily = daily_used + tokens_to_consume
local new_monthly = monthly_used + tokens_to_consume

redis.call("HMSET", daily_key, "used", new_daily, "reset_ts", now)
redis.call("HMSET", monthly_key, "used", new_monthly, "reset_ts", now)

-- Set expiry to prevent stale data (2 days for daily, 35 days for monthly)
redis.call("EXPIRE", daily_key, 172800)   -- 2 days
redis.call("EXPIRE", monthly_key, 3024000)  -- 35 days

return {1, new_daily, new_monthly, 0}  -- Success
