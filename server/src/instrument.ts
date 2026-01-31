/**
 * Sentry Instrumentation
 *
 * This file MUST be imported before any other modules to ensure
 * Sentry can properly instrument all dependencies.
 *
 * Sentry is only enabled in PRODUCTION when SENTRY_DSN is configured.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/fastify/
 */

// Load environment variables FIRST, before Sentry init
import "dotenv/config";

import * as Sentry from "@sentry/node";

const isProduction = process.env.NODE_ENV === "production";
const isSentryEnabled = isProduction && !!process.env.SENTRY_DSN;

// Debug: Log Sentry status
if (isSentryEnabled) {
    console.log("[Sentry] Initializing for production");
} else if (!isProduction) {
    console.log("[Sentry] Disabled in development environment");
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

    // Tracing sample rate: 10% in production to reduce costs
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,

    // Include request headers, cookies, and user IP for debugging
    // Disable in regions with strict privacy requirements
    sendDefaultPii: true,

    // Only enable Sentry in production when DSN is configured
    enabled: isSentryEnabled,

    // Integrations for additional Sentry features
    integrations: [
        // Capture Pino logger calls and send them to Sentry Logs
        // This works with Fastify's built-in Pino logger (req.log, app.log)
        Sentry.pinoIntegration({
            // Send these log levels to Sentry Logs dashboard
            log: {
                levels: ["info", "warn", "error", "fatal"],
            },
            // Optionally capture error/fatal logs as Sentry error events too
            error: {
                levels: ["error", "fatal"],
            },
        }),
    ],

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Ignore common expected errors that shouldn't create noise
    ignoreErrors: [
        // Rate limiting is expected behavior
        "RateLimitingError",
        // Validation errors are user input issues
        "ValidationError",
        // 404s are expected
        "NotFoundError",
    ],
});

export { Sentry };
