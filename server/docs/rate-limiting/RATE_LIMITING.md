# Rate Limiting Implementation

Rate limiting in the Vollio server is implemented using the **Token Bucket Algorithm**, backed by **Redis** for distributed state management. This system allows for handling traffic bursts while maintaining a consistent throughput limit.

## Architecture

### 1. Core Logic: `RateLimitingService`
The core logic resides in `src/infrastructure/services/RateLimitingService.ts`. It interacts with Redis to manage token buckets for each user.

*   **Algorithm**: Token Bucket.
*   **Storage**: Redis (using `ioredis`).
*   **Atomicity**: A Lua script (`src/shared/utils/token_bucket.lua`) is used to ensure that reading current tokens, refilling based on time elapsed, and consuming tokens happens atomically.

### 2. Fastify Plugin: `rateLimiterPlugin`
A global Fastify plugin (`src/plugins/rateLimiter.ts`) is registered to intercept requests.

*   **Hook**: `preHandler`
*   **Trigger**: It only runs for authenticated users (`request.user`).
*   **Configuration**: It reads the rate limit cost from the route's configuration (`request.routeOptions.config.rateLimit`).

## Configuration

### Default Parameters
*   **Capacity**: 100 tokens (Maximum burst size).
*   **Refill Rate**: 1 tokens per second.

### Route-Specific Weights
Endpoints are assigned costs based on their resource intensity. This is defined directly in the route declaration:

```typescript
// Example: High-cost AI endpoint
fastify.post('/generate', {
  config: {
    rateLimit: { 
      cost: 20, 
      category: "ai" // Optional bucket separation
    }
  },
  // ... handler
});
```

See [Endpoint Weights](./endpoints_weights.md) for a detailed list of costs.

## API Behavior

### Headers
Every authenticated response includes the following header:
*   `X-RateLimit-Remaining`: The number of tokens remaining in the user's bucket.

### Rate Limit Exceeded
When a user exceeds their limit, the server responds with:
*   **Status Code**: `429 Too Many Requests`
*   **Header**: `Retry-After`: Seconds until enough tokens refill to retry the request.
*   **Body**:
    ```json
    {
      "success": false,
      "message": "Too Many Requests",
      "error": {
        "message": "Rate limit exceeded. Please try again later.",
        "retryAfter": 15
      }
    }
    ```

## Redis Keys
Keys are structured as: `rate:<bucket>:<userId>`
*   Example: `rate:request:user-uuid-123`
*   Data stored (Hash):
    *   `tokens`: Current token count.
    *   `last_refill`: Timestamp (seconds) of the last refill.
