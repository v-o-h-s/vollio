# Production Readiness Audit

This document outlines potential issues and improvements needed to make the server production-ready.

---

## 🔴 Critical Issues

### 1. Session/Cookie Secrets Using Hardcoded Fallbacks

**File:** [server.ts](file:///home/gyro/Documents/redemption/vollio/server/src/server.ts#L40-L56)

```typescript
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "dev-secret",  // ⚠️ Fallback in production!
});

app.register(fastifySession, {
  secret:
    process.env.SESSION_SECRET ||
    process.env.COOKIE_SECRET ||
    "dev-session-secret-change-in-production",  // ⚠️ Fallback in production!
  ...
});
```

**Risk:** If environment variables aren't set, the server will use weak, known secrets in production, making session hijacking trivial.

**Fix:** Fail fast if secrets are not provided in production:

```typescript
if (process.env.NODE_ENV === "production") {
  if (!process.env.COOKIE_SECRET) throw new Error("COOKIE_SECRET is required");
  if (!process.env.SESSION_SECRET)
    throw new Error("SESSION_SECRET is required");
}
```

---

### 2. CORS Allows All Origins

**File:** [server.ts](file:///home/gyro/Documents/redemption/vollio/server/src/server.ts#L58-L62)

```typescript
app.register(fastifyCors, {
  origin: true,  // ⚠️ Allows ANY origin
  credentials: true,
  ...
});
```

**Risk:** Any website can make authenticated requests to your API, enabling CSRF attacks since `credentials: true` is set.

**Fix:** Whitelist specific origins in production:

```typescript
app.register(fastifyCors, {
  origin: process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL, "https://vollio.app"]
    : true,
  credentials: true,
  ...
});
```

---

### 3. Missing SIGTERM Handler

**File:** [server.ts](file:///home/gyro/Documents/redemption/vollio/server/src/server.ts#L163-L168)

```typescript
process.on("SIGINT", async () => {
  // Only handles SIGINT
  app.log.info("Stopping server");
  await app.close();
  process.exit(0);
});
// ⚠️ Missing: SIGTERM handler for container orchestration (Docker, Kubernetes)
```

**Risk:** Container orchestrators send SIGTERM before SIGKILL. Without handling it, connections aren't gracefully closed.

**Fix:**

```typescript
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    app.log.info(`Received ${signal}, shutting down gracefully`);
    await app.close();
    process.exit(0);
  });
});
```

---

### 4. Redis Connection Without Authentication/TLS

**File:** [container.ts](file:///home/gyro/Documents/redemption/vollio/server/src/plugins/container.ts#L92-L96)

```typescript
const redis = new Redis({
  host: (process.env.REDIS_HOST || "127.0.0.1").trim(),
  port: Number(process.env.REDIS_PORT) || 6379,
  // ⚠️ No password, TLS, or connection options
});
```

**Risk:** Unencrypted, unauthenticated Redis connection. In cloud environments, this is a security vulnerability.

**Fix:**

```typescript
const redis = new Redis({
  host: (process.env.REDIS_HOST || "127.0.0.1").trim(),
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
});
```

---

## 🟠 High Priority Issues

### 5. AI Services Fail Silently

**File:** [GenerativeAiService.ts](file:///home/gyro/Documents/redemption/vollio/server/src/infrastructure/services/GenerativeAiService.ts#L55-L58)

```typescript
} catch (error) {
  this.logger.error({ error }, "GenerativeAiService.generateText failed");
  return createEmptyResult("", modelId);  // ⚠️ Returns empty instead of throwing
}
```

**Risk:** User pays for an AI request but receives empty data with no indication of failure. Same pattern in `generateQuizQuestions`, `generateFlashCards`, `generateSummary`.

**Fix:** Either throw errors or return a result object with an error field:

```typescript
return {
  data: null,
  error: { code: "AI_ERROR", message: "Failed to generate content" },
  usage: EMPTY_TOKEN_USAGE,
  model: modelId,
};
```

---

### 6. Token Rate Limiter Fails Open

**File:** [tokenRateLimiter.ts](file:///home/gyro/Documents/redemption/vollio/server/src/plugins/tokenRateLimiter.ts#L81-L84)

```typescript
} catch (error) {
  // Log error but don't block request - fail open
  request.log.error({ error }, "Token rate limit check failed");
  // ⚠️ Request proceeds even if rate limit check fails
}
```

**Risk:** If Redis is down, users can make unlimited AI requests, potentially draining your API credits.

**Recommendation:** Consider fail-closed for AI endpoints that have real cost:

```typescript
} catch (error) {
  request.log.error({ error }, "Token rate limit check failed");
  throw new RateLimitingError({
    message: "Unable to verify usage quota. Please try again.",
    source: "token_quota_check_failed",
    retryAfter: 30,
    remaining: 0,
  });
}
```

---

### 7. Missing Health Check Endpoint

**Risk:** No way for load balancers to check if the server is healthy (database connected, Redis available).

**Fix:** Add a health check route:

```typescript
app.get("/health", async (request, reply) => {
  // Check Redis
  try {
    await redis.ping();
  } catch {
    return reply.status(503).send({ status: "unhealthy", redis: "down" });
  }
  return reply.send({ status: "healthy" });
});

app.get("/ready", async (request, reply) => {
  // Readiness check for Kubernetes
  return reply.send({ ready: true });
});
```

---

### 8. Environment Variables Not Validated at Startup

**Files:** Multiple files use `process.env.VAR!` with non-null assertion.

```typescript
// supabase.ts
process.env.SUPABASE_URL!;
process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GoogleClassroomService.ts
process.env.GOOGLE_CLIENT_ID!;
process.env.GOOGLE_CLIENT_SECRET!;

// client.ts (AI)
process.env.GENERATIVE_AI_API_KEY!;
```

**Risk:** If any of these are missing, the server starts but crashes when the feature is used.

**Fix:** Create a startup validation module:

```typescript
// src/shared/utils/envValidation.ts
const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "COOKIE_SECRET",
  "SESSION_SECRET",
  "GENERATIVE_AI_API_KEY",
  "VOYAGE_API_KEY",
  "REDIS_HOST",
];

export function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

// Call in server.ts before app initialization
validateEnv();
```

---

## 🟡 Medium Priority Issues

### 9. Potential Sensitive Data in Logs

**File:** [DocumentRepository.ts](file:///home/gyro/Documents/redemption/vollio/server/src/infrastructure/repositories/DocumentRepository.ts#L14-L18)

```typescript
this.logger.info(
  { documentId: document.getId(), name: document.getName() },
  "Adding document to repository"
);
```

**Risk:** Document names might contain sensitive information. Logging at `info` level means they appear in production logs.

**Recommendation:** Use `debug` level for detailed logging or redact potentially sensitive fields.

---

### 10. No Request Timeout Configuration

**Risk:** Long-running requests can exhaust server resources. No explicit timeouts for AI calls or database queries.

**Fix:** Add connection and request timeouts:

```typescript
// server.ts
export const app: FastifyInstance = Fastify({
  logger: loggerConfig,
  connectionTimeout: 30000,  // 30 seconds
  requestTimeout: 60000,     // 60 seconds for AI routes
  ...
});

// For AI routes specifically
fastify.post('/generate-summary', {
  config: { requestTimeout: 120000 }  // 2 minutes for AI
}, handler);
```

---

### 11. Missing CSRF Protection for State-Changing Operations

**File:** [server.ts](file:///home/gyro/Documents/redemption/vollio/server/src/server.ts)

**Risk:** While sessions are HTTP-only, there's no CSRF token protection for POST/PUT/DELETE operations.

**Fix:** Add CSRF plugin for session-based auth:

```typescript
import fastifyCsrf from "@fastify/csrf-protection";

app.register(fastifyCsrf, {
  sessionPlugin: "@fastify/session",
});
```

---

### 12. Inconsistent Sanitization Usage

**File:** Routes use `validateBody` but not always `validateAndSanitizeBody`.

```typescript
// document.route.ts - Uses validateBody (no sanitization)
preHandler: validateBody(renameDocumentSchema);

// Should use validateAndSanitizeBody for name/title fields
preHandler: validateAndSanitizeBody(renameDocumentSchema);
```

**Risk:** XSS protection is inconsistent across endpoints.

**Fix:** Audit all routes and use `validateAndSanitizeBody` for any endpoint accepting user-controlled text.

---

## 🟢 Improvements (Nice to Have)

### 13. Redis Connection Error Handling

**Recommendation:** Add event handlers for Redis connection issues:

```typescript
redis.on("error", (err) => {
  fastify.log.error({ err }, "Redis connection error");
});

redis.on("reconnecting", () => {
  fastify.log.warn("Redis reconnecting...");
});
```

---

### 14. Database Connection Pooling Monitoring

**Recommendation:** Supabase client is created per-request. Consider logging connection pool metrics if issues arise under load.

---

### 15. Structured Error Logging

**Recommendation:** Ensure all error logs include:

- Request ID (correlation)
- User ID (when available)
- Endpoint/operation name
- Error code/type

---

## Checklist for Production Deployment

- [ ] All required environment variables are set (not falling back to defaults)
- [ ] CORS origin is restricted to known frontend domains
- [ ] Redis is configured with authentication and TLS
- [ ] Health check endpoints are exposed to load balancer
- [ ] Request timeouts are configured
- [ ] CSRF protection is enabled
- [ ] All user-input endpoints use sanitization
- [ ] Logging level is set to `info` or `warn`
- [ ] SIGTERM handler is added for graceful shutdown
- [ ] Secrets are rotated and not using development values

---

## Summary of Issues by Severity

| Severity    | Count | Action Required              |
| ----------- | ----- | ---------------------------- |
| 🔴 Critical | 4     | Fix before production        |
| 🟠 High     | 4     | Fix for production stability |
| 🟡 Medium   | 4     | Fix for security hardening   |
| 🟢 Low      | 3     | Nice to have improvements    |
