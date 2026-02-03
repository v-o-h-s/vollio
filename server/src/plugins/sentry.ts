import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import * as Sentry from "@sentry/node";
import { SentryService } from "../infrastructure/services/SentryService";

export const sentryPlugin = fp(async (fastify: FastifyInstance) => {
  // Start span for each request (performance monitoring)
  fastify.addHook("onRequest", async (request, reply) => {
    // Start a new span for this request
    Sentry.startSpan({
      op: "http.server",
      name: `${request.method} ${request.routeOptions.url || request.url}`,
    }, () => {
      // The span will be automatically managed
    });

    // Set user context if available (auth plugin runs before this)
    if (request.user?.id) {
      SentryService.setUser(request.user.id, request.user.email);
      
      // Add user context to current scope
      Sentry.getCurrentScope().setUser({
        id: request.user.id,
        email: request.user.email,
      });
    } else {
      // Clear user context for non-authenticated requests
      SentryService.clearUser();
      Sentry.getCurrentScope().setUser(null);
    }

    // Add breadcrumb for request
    SentryService.addBreadcrumb(
      `${request.method} ${request.url}`,
      "http",
      "info"
    );

    // Set request context
    Sentry.getCurrentScope().setContext("request", {
      method: request.method,
      url: request.url,
      headers: request.headers,
      query: request.query,
    });
  });

  // Capture errors that bypass error handler
  fastify.addHook("onError", async (request, reply, error) => {
    SentryService.captureException(error, {
      errorType: "UncaughtError",
      userId: request.user?.id || "anonymous",
      route: request.url,
      method: request.method,
    });
  });
});
