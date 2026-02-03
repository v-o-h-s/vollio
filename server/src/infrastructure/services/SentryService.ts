import "dotenv/config";
import * as Sentry from "@sentry/node";
import {
  httpIntegration,
  onUncaughtExceptionIntegration,
  onUnhandledRejectionIntegration,
} from "@sentry/node";

export class SentryService {
  private static isInitialized = false;

  static initialize(): void {
    const dsn = process.env.SENTRY_DSN;
    const environment = process.env.SENTRY_ENVIRONMENT || "development";
    const tracesSampleRate = parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1",
    );

    if (!dsn) {
      console.warn("Sentry DSN not configured. Error tracking disabled.");
      return;
    }

    if (this.isInitialized) {
      console.warn("Sentry already initialized. Skipping re-initialization.");
      return;
    }

    Sentry.init({
      dsn,
      environment,
      tracesSampleRate,
      integrations: [
        httpIntegration(),
        onUncaughtExceptionIntegration(),
        onUnhandledRejectionIntegration(),
      ],
      // Performance Monitoring
      profilesSampleRate: 0.1,
      // Capture 10% of transactions for performance monitoring
      // In production, recommend setting to 0.1 (10%)
      debug: process.env.NODE_ENV === "development",
      beforeSend(event, hint) {
        // Filter out sensitive data before sending to Sentry
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        return event;
      },
    });

    this.isInitialized = true;
    console.log(`Sentry initialized for ${environment} environment`);
  }

  static captureException(error: Error, tags?: Record<string, string>): void {
    if (!this.isInitialized) {
      console.warn("Sentry not initialized. Exception not captured.");
      return;j
    }

    Sentry.captureException(error, {
      tags: tags || {},
    });
  }

  static captureMessage(
    message: string,
    level: Sentry.SeverityLevel = "info",
  ): void {
    if (!this.isInitialized) {
      console.warn("Sentry not initialized. Message not captured.");
      return;
    }

    Sentry.captureMessage(message, level);
  }

  static setUser(userId: string, email?: string, username?: string): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }

  static clearUser(): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser(null);
  }

  static addBreadcrumb(
    message: string,
    category?: string,
    level?: Sentry.SeverityLevel,
  ): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.addBreadcrumb({
      message,
      category,
      level,
    });
  }

  static setContext(name: string, context: Record<string, any>): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setContext(name, context);
  }

  static setTag(key: string, value: string): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setTag(key, value);
  }

  static async close(timeout = 2000): Promise<boolean> {
    if (!this.isInitialized) {
      return true;
    }

    return await Sentry.close(timeout);
  }

  static flush(timeout = 2000): Promise<boolean> {
    if (!this.isInitialized) {
      return Promise.resolve(true);
    }

    return Sentry.flush(timeout);
  }
}
