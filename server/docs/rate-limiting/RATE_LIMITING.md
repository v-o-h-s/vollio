# Rate Limiting Implementation

Rate limiting in the Vollio server is implemented using the **Token Bucket Algorithm**, backed by **Redis** for distributed state management. This system allows for handling traffic bursts while maintaining a consistent throughput limit.

## Architecture

### 1. Core Logic: `RateLimitingService`

The core logic resides in `src/infrastructure/services/RateLimitingService.ts`. It interacts with Redis to manage token buckets for each user.

- **Algorithm**: Token Bucket.
- **Storage**: Redis (using `ioredis`).
- **Atomicity**: A Lua script (`src/infrastructure/database/redis/scripts/token_bucket.lua`) is used to ensure that reading current tokens, refilling based on time elapsed, and consuming tokens happens atomically.

### 2. Fastify Plugin: `rateLimiterPlugin`

A global Fastify plugin (`src/plugins/rateLimiter.ts`) is registered to intercept requests.

- **Hook**: `preHandler`
- **Trigger**:
  - **Authenticated**: Checks `request.user`.
  - **Public**: Checks based on IP if no user is present.
- **Configuration**:
  - **Cost**: Reads `request.routeOptions.config.rateLimit.cost` (defaults to 1).
  - **Capacity/Refill**: Reads from environment variables.

## Configuration & Formulas

We calculate the maximum number of requests a client can make in a given time window using the Token Bucket formula.

### Max Requests Formula

The absolute maximum number of requests possible in a 60-second window (starting with a full bucket) is calculated as:

$$
\text{Max in 1 minute} = \left\lfloor \frac{C + (R \times 60)}{K} \right\rfloor
$$

Where:

- **C** = Capacity (Bucket size / Max Burst)
- **R** = Refill Rate (tokens/second)
- **K** = Cost per request

### Scenarios

#### 1. Public Routes (Low Trust)

- **Capacity (C)**: 5
- **Refill Rate (R)**: ~0.0833 tokens/sec (5 tokens per 60s)
- **Cost (K)**: 1 (Standard)

> **Max requests in 1st minute**: `floor((5 + (0.0833 * 60)) / 1)` = **10 requests**
> **Sustained Rate**: ~5 requests/minute

#### 2. Authenticated Routes (High Trust)

- **Capacity (C)**: 100
- **Refill Rate (R)**: 1 token/sec
- **Cost (K)**: 1 (Standard)

> **Max requests in 1st minute**: `floor((100 + (1 * 60)) / 1)` = **160 requests**
> **Sustained Rate**: 60 requests/minute (1 req/sec)

#### 3. High Cost Endpoints

- **Capacity (C)**: 100
- **Refill Rate (R)**: 1 token/sec
- **Cost (K)**: 25

> **Max requests in 1st minute**: `floor((100 + (1 * 60)) / 25)` = `floor(160 / 25)` = **6 requests**
> **Sustained Rate**: ~2.4 requests/minute

#### 4. Very High Cost Endpoints

- **Capacity (C)**: 100
- **Refill Rate (R)**: 1 token/sec
- **Cost (K)**: 50

> **Max requests in 1st minute**: `floor((100 + (1 * 60)) / 50)` = `floor(160 / 50)` = **3 requests**
> **Sustained Rate**: ~1.2 requests/minute

## Endpoint Categories

| Category      | Cost ($K$) | Max Requests / Min\* | Endpoints (Examples)                                                  |
| :------------ | :--------- | :------------------- | :-------------------------------------------------------------------- |
| **Low**       | $1$        | 160                  | Standard CRUD (Notes, Folders, Highlights), Settings                  |
| **Medium**    | $5$        | 32                   | Google Drive import, Google Classroom course list                     |
| **High**      | $25$       | 6                    | AI Chat (Assistant)                                                   |
| **Very High** | $50$       | 3                    | AI Quizzes, Summary generation, Flashcards, `getDocumentById` (Heavy) |
| **Exempt**    | $0$        | $\infty$             | Health checks, Public status endpoints                                |

_\*Calculated for authenticated routes starting with a full bucket ($C=100, R=1$)._

## Detailed Route Catalog

### 🚀 Exempt (Cost: 0 | Max: ∞)

| Method | Route     | Description                   |
| :----- | :-------- | :---------------------------- |
| `GET`  | `/health` | Server health status          |
| `GET`  | `/ready`  | Readiness probe (Redis check) |
| `GET`  | `/live`   | Liveness probe                |

### 🟢 Low (Cost: 1 | Max: 160/min)

| Method   | Route                      | Resource                 |
| :------- | :------------------------- | :----------------------- |
| `GET`    | `/documents/`              | All Documents            |
| `DELETE` | `/documents/:id`           | Drop Document            |
| `PATCH`  | `/documents/:id/move`      | Move Document            |
| `PUT`    | `/documents/:id/rename`    | Rename Document          |
| `POST`   | `/documents/finish-upload` | Metadata Update          |
| `ANY`    | `/notes/*`                 | All Note operations      |
| `ANY`    | `/folders/*`               | All Folder operations    |
| `ANY`    | `/highlights/*`            | All Highlight operations |
| `GET`    | `/flashcards/*`            | Flashcard Retrieval      |
| `DELETE` | `/flashcards/:id`          | Drop Flashcards          |
| `GET`    | `/quizzes/`                | All Quizzes              |
| `GET`    | `/quizzes/:id`             | Quiz Details             |
| `DELETE` | `/quizzes/:id`             | Drop Quiz                |

### 🟡 Medium (Cost: 5 | Max: 32/min)

| Method   | Route                            | Resource              |
| :------- | :------------------------------- | :-------------------- |
| `POST`   | `/assistant/`                    | AI Chat (Assistant)   |
| `POST`   | `/documents/google-drive`        | Add from Google Drive |
| `GET`    | `/google-classroom/callback`     | OAuth Callback        |
| `GET`    | `/google-classroom/refresh`      | Force Refresh         |
| `GET`    | `/google-classroom/courses/list` | Course Listing        |
| `DELETE` | `/google-classroom/disconnect`   | Revoke Access         |

### 🟠 High (Cost: 25 | Max: 6/min)

| Method | Route                                   | Resource          |
| :----- | :-------------------------------------- | :---------------- |
| `ANY`  | `/settings/*`                           | User Settings     |
| `GET`  | `/google-classroom/connect`             | Auth Init         |
| `GET`  | `/google-classroom/check`               | Token Status      |
| `GET`  | `/google-classroom/status`              | Connection Status |
| `GET`  | `/google-classroom/courses/:id/content` | Content Sync      |
| `GET`  | `/google-classroom/courses`             | Detailed Sync     |

### 🔴 Very High (Cost: 50 | Max: 3/min)

| Method | Route                                | Resource                 |
| :----- | :----------------------------------- | :----------------------- |
| `POST` | `/documents/upload-url`              | Storage Pre-signed URL   |
| `GET`  | `/documents/:id`                     | Deep Retrieval (Heavy)   |
| `POST` | `/documents/:id/generate-summary`    | AI Summary generation    |
| `POST` | `/flashcards/generate-from-document` | AI Flashcards generation |
| `POST` | `/quizzes/`                          | AI Quiz generation       |

## API Behavior

### Headers

Responses include the following headers:

- `X-RateLimit-Limit`: The capacity of the bucket (burst limit).
- `X-RateLimit-Remaining`: The number of tokens currently remaining.

### Rate Limit Exceeded

When a user exceeds their limit, the server responds with:

- **Status Code**: `429 Too Many Requests`
- **Header**: `Retry-After`: Seconds until enough tokens refill to retry.
- **Body**:
  ```json
  {
    "success": false,
    "message": "Too Many Requests", // or "Rate limit exceeded"
    "statusCode": 429,
    "error": {
      "message": "Rate limit exceeded. Please try again later.",
      "retryAfter": 15,
      "remaining": 0,
      "limit": 100
    }
  }
  ```

## Redis Keys

Keys are structured as: `rate:<bucket>:<identifier>`

- **Authenticated**: `rate:<category>:user:<userId>`
  - Example: `rate:request:user:uuid-123`
- **Public**: `rate:request:ip:<ipAddress>`
  - Example: `rate:request:ip:127.0.0.1`

Data stored (Hash):

- `tokens`: Current token count.
- `last_refill`: Timestamp (seconds) of the last refill.
