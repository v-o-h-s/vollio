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
        // Only sending warn/error/fatal to stay within free 5GB/month tier
        Sentry.pinoIntegration({
            // Send only important log levels to Sentry Logs dashboard
            log: {
                levels: ["warn", "error", "fatal"],
            },
            // Capture error/fatal logs as Sentry error events too
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
        // Authentication errors (user not logged in, expired token)
        "AuthError",
        // Network errors from client disconnects
        "ECONNRESET",
        "ECONNABORTED",
        "EPIPE",
        // Request aborted by client
        "Request aborted",
        "Client network socket disconnected",
    ],

    // Deny URLs - ignore errors from bots, crawlers, browser extensions
    denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
    ],

    // Filter out transactions you don't need to trace
    tracesSampler: ({ name, attributes, parentSampled }) => {
        // Always skip health check endpoints (high volume, low value)
        if (name.includes("/health") || name.includes("/ready") || name.includes("/live")) {
            return 0; // Don't trace
        }

        // Skip static assets if any
        if (name.includes("/static") || name.includes("/assets")) {
            return 0;
        }

        // Use the default sample rate for everything else
        return Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1;
    },
});

export { Sentry };
