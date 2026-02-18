# Middlewares and Request Lifecycle

In this project, we handle request processing and validation using two main patterns in Fastify.

## 1. Global / Root Middleware (Plugins)

These are registered at the application level and run for every request (or every request within a specific plugin scope). They are typically used for cross-cutting concerns like Authentication, Logging, and Dependency Injection.

**Implementation:**

- **Location:** Defined in `src/plugins/` (e.g., `auth.ts`).
- **Registration:** Using `fastify.addHook('onRequest', ...)` or `fastify.addHook('preHandler', ...)`.
- **Use Case:**
  - **Auth:** Verifies JWT tokens and attaches the `user` object to the request.
  - **DI (Awilix):** Injects services and repositories into the request scope.

```typescript
// Example: src/plugins/auth.ts
fastify.addHook("onRequest", async (req, reply) => {
  // Logic that runs for every request...
});
```

---

## 2. Route-Specific Middleware (Hooks)

These are applied only to specific routes or route groups. They are ideal for logic that is not required globally, such as Body Validation or Resource/Quota checking.

**Implementation:**

- **Location:** Utility functions in `src/shared/utils/` or `src/shared/validation/`.
- **Registration:** Passed as an array (or single function) to the `preHandler` option in the route definition.
- **Use Case:**
  - **Validation:** Ensuring the request body matches a schema (e.g., `validateBody`).
  - **Guards:** Checking if a user has enough quota before an expensive operation (e.g., `guardResource`).

### Example: Resource Guarding

When a route requires a resource check (like AI or Storage), we add `guardResource` to the `preHandler` array.

```typescript
// src/interface/routes/document.route.ts
fastify.post(
  "/upload-url",
  {
    preHandler: [guardResource("storage"), validateBody(getStorageUrlSchema)],
    schema: { ... }
  },
  async (request, reply) => {
    // Controller logic...
  }
);
```

### Key Differences

| Feature          | Global Middleware                 | Route-Specific Middleware      |
| :--------------- | :-------------------------------- | :----------------------------- |
| **Registration** | `fastify.addHook`                 | `preHandler` option in route   |
| **Scope**        | All routes in scope               | Explicitly selected routes     |
| **Performance**  | Constant overhead per request     | Only active where needed       |
| **Access**       | `onRequest` (early), `preHandler` | `preHandler` (has parsed body) |
