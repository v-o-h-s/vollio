/**
 * Sentry Instrumentation
 *
 * This file MUST be imported before any other modules to ensure
 * Sentry can properly instrument all dependencies.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/fastify/
 */

// Load environment variables FIRST, before Sentry init
import "dotenv/config";

import * as Sentry from "@sentry/node";

// Debug: Log whether Sentry is enabled
const isSentryEnabled = !!process.env.SENTRY_DSN;
if (isSentryEnabled) {
    console.log("[Sentry] Initializing with DSN configured");
} else {
    console.log("[Sentry] DSN not configured - Sentry is disabled");
}

Sentry.init({
    // DSN is required for Sentry to send events
    dsn: process.env.SENTRY_DSN,

    // Environment helps filter issues in Sentry dashboard
    environment:
        process.env.SENTRY_ENVIRONMENT ||
        process.env.NODE_ENV ||
        "development",

    // Release version for tracking deployments
    release: process.env.SENTRY_RELEASE,

    // Tracing sample rate: 1.0 = 100% of transactions
    // In production, use a lower value (e.g., 0.1 = 10%) to reduce costs
    tracesSampleRate:
        Number(process.env.SENTRY_TRACES_SAMPLE_RATE) ||
        (process.env.NODE_ENV === "production" ? 0.1 : 1.0),

    // Include request headers, cookies, and user IP for debugging
    // Disable in regions with strict privacy requirements
    sendDefaultPii: true,

    // Only enable Sentry when DSN is configured
    enabled: !!process.env.SENTRY_DSN,

    // Ignore common expected errors that shouldn't create noise
    ignoreErrors: [
        // Rate limiting is expected behavior
        "RateLimitingError",
        // Validation errors are user input issues
        "ValidationError",
        // 404s are expected
        "NotFoundError",
    ],

    // Before sending an error, you can modify or drop it
    beforeSend(event, hint) {
        // Log to console in development when Sentry is disabled
        if (!process.env.SENTRY_DSN && process.env.NODE_ENV !== "production") {
            console.log("[Sentry] Would have sent event:", event.message);
            return null; // Don't send
        }
        return event;
    },
});

export { Sentry };
