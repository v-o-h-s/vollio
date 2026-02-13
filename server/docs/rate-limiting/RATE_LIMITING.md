# Standard API Rate Limiting

This document focuses on the standard API rate limiting system designed to protect Vollio's server infrastructure (CPU, Database, Bandwidth). If you are looking for AI Model Usage / Quota management, please see [AI_QUOTA.md](./AI_QUOTA.md).

## 1. Overview

Vollio uses a **Token Bucket Algorithm** backed by Redis to manage request throughput. There is a distinct bucket for every user (Authenticated) and every IP address (Public).

---

## 2. Limits & Capacities

The system distinguishes between **Public** access (low trust) and **Authenticated** user access (high trust).

| Client Type       | Capacity (Burst) | Refill Rate   | Sustained Requests/Min\* | Default                        |
| :---------------- | :--------------- | :------------ | :----------------------- | :----------------------------- |
| **Public / IP**   | 10 Tokens        | ~0.16 req/sec | **~10 Requests**         | `PUBLIC_ROUTES_LIMIT_CAPACITY` |
| **Authenticated** | 100 Tokens       | 1 req/sec     | **160 Requests**         | `RATE_LIMIT_CAPACITY`          |

_> Calculated as `Max = Capacity + (RefillRate _ 60)` assuming typical usage.\*

---

## 3. Request Costs

Different API endpoints consume different amounts of tokens based on their resource intensity.

| Tier          | Cost   | Max Requests / Min | Description         | Examples                                        |
| :------------ | :----- | :----------------- | :------------------ | :---------------------------------------------- |
| **Low**       | **1**  | 160                | Standard Operations | CRUD Notes, Folders, Highlights                 |
| **Medium**    | **5**  | 32                 | Moderate Operations | Google Drive Import, OAuth Callback             |
| **High**      | **25** | 6                  | Heavy Operations    | **Deep Document Retrieval**, AI Chat Initiation |
| **Very High** | **50** | 3                  | Resource Intensive  | Document Upload Presigning (Large files)        |

### Key Categorization Table

**Low Cost (1)**:

- `GET /documents/` (List)
- `ANY /notes/*`
- `ANY /folders/*`
- `ANY /highlights/*`
- `GET /quizzes/` (List)

**Medium Cost (5)**:

- `POST /documents/google-drive`
- `GET /google-classroom/*` (Most routes)

**High Cost (25)**:

- `GET /documents/:id` (Deep Retrieval) **<-- MOVED to High**
- `POST /assistant/` (API Overhead only, AI tokens separate)

**Very High Cost (50)**:

- `POST /documents/upload-url` (S3 pre-signing)

---

## 4. Configuration

Environment Variables controlling the API Rate Limiter:

```env
# Public / IP Based Limit
PUBLIC_ROUTES_LIMIT_CAPACITY=10
PUBLIC_ROUTES_REFILL_RATE=1

# Authenticated User Limit
RATE_LIMIT_CAPACITY=100
RATE_LIMIT_REFILL_RATE=1
```

## 5. Usage in Routes

Routes can be configured with specific costs using the `config.rateLimit` object:

```typescript
// Example: Setting a LOW cost for a standard route
fastify.get(
  "/notes",
  {
    config: {
      rateLimit: {
        request: { cost: RateLimitingDegrees.LOW },
      },
    },
  },
  handler,
);

// Example: Setting a HIGH cost for a resource intensive route
fastify.post(
  "/documents/upload-url",
  {
    config: {
      rateLimit: {
        request: { cost: RateLimitingDegrees.VERY_HIGH },
      },
    },
  },
  handler,
);
```

For AI Quota configuration, see [AI_QUOTA.md](./AI_QUOTA.md).
