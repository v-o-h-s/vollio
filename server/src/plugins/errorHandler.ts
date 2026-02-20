import { FastifyReply, FastifyRequest } from "fastify";
import { ServerError } from "../shared/errors/ServerError";
import { DatabaseError } from "../shared/errors/DatabaseError";
import { ErrorObject } from "../shared/types/error";
import { NotFoundError } from "../shared/errors/NotFoundError";
import { RateLimitingError } from "../shared/errors/RateLimitingError";
import { ValidationError } from "../shared/errors/ValidationError";
import { ConflictError } from "../shared/errors/ConflictError";
import { QuotaExceededError } from "../shared/errors/QuotaExceededError";
import { SentryService } from "../infrastructure/services/SentryService";
import { ResponseFormatter } from "../shared/utils/ResponseFormatter";

export function errorHandler(
  error: any,
  req: FastifyRequest,
  res: FastifyReply,
) {
  if (error instanceof DatabaseError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,

      extra: {
        code: error.code,
        originalError: error.originalError,
        timestamp: error.timestamp,
      },
    };

    // Log the error using the request logger for context
    req.log.error({ err: error, ...errorObj }, "Database Error Occurred");

    // Report to Sentry (but not rate limit errors)
    SentryService.captureException(error, {
      errorType: "DatabaseError",
      userId: req.user?.id || "anonymous",
      route: req.url,
    });

    return ResponseFormatter.error(res, errorObj, error.statusCode);
  }

  // Handle other ServerErrors
  if (error instanceof ServerError) {
    const statusCode = 500;
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.message,
      statusCode: statusCode,
      extra: {},
    };

    req.log.error({ err: error }, "Server Error Occurred");

    // Report to Sentry
    SentryService.captureException(error, {
      errorType: "ServerError",
      userId: req.user?.id || "anonymous",
      route: req.url,
    });

    return ResponseFormatter.error(res, errorObj, statusCode);
  }
  if (error instanceof ConflictError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.message,
      statusCode: error.statusCode,
      extra: {},
    };

    req.log.warn({ err: error }, "Conflict Error Occurred");

    return ResponseFormatter.error(res, errorObj, error.statusCode);
  }

  if (error instanceof NotFoundError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      extra: {},
    };

    req.log.error({ err: error }, "Not Found Error Occurred");

    // Report to Sentry
    SentryService.captureException(error, {
      errorType: "NotFoundError",
      userId: req.user?.id || "anonymous",
      route: req.url,
    });

    return ResponseFormatter.error(res, errorObj, error.statusCode);
  }

  if (error instanceof ValidationError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.source,
      message: error.message,
      details: JSON.stringify(error.fieldErrors),
      statusCode: error.statusCode,
      extra: {
        fieldErrors: error.fieldErrors,
      },
    };

    req.log.warn({ err: error }, "Validation Error Occurred");

    return ResponseFormatter.error(res, errorObj, error.statusCode);
  }

  if (error instanceof RateLimitingError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: "rate_limit_exceeded",
      message: error.message,
      details: "Rate limit exceeded for " + error.source,
      statusCode: error.statusCode,
      extra: {
        source: error.source,
        retryAfter: error.retryAfter,
        limit: error.limit,
        remaining: error.remaining,
        reset: error.reset,
        details: error.details,
      },
    };

    // Set rate limit headers
    const headers = error.getHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      res.header(key, value);
    });

    req.log.warn({ err: error }, "Rate Limiting Error Occurred");

    return ResponseFormatter.error(res, errorObj, error.statusCode);
  }

  if (error instanceof QuotaExceededError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.resource,
      message: error.message,
      details: `You have exceeded your ${error.resource} quota. Please upgrade your plan.`,
      statusCode: error.statusCode,
      extra: {
        code: error.code,
        resource: error.resource,
      },
    };

    req.log.warn({ err: error }, "Quota Exceeded Error Occurred");

    return ResponseFormatter.error(res, errorObj, error.statusCode);
  }

  // Handle unexpected errors
  req.log.error({ err: error }, "Unexpected Error Occurred");

  // Report to Sentry
  SentryService.captureException(error, {
    errorType: "UnexpectedError",
    userId: req.user?.id || "anonymous",
    route: req.url,
  });

  const statusCode = error.statusCode || 500;
  const errorObj: ErrorObject = {
    name: error.name || "UnknownError",
    subType: "INTERNAL_SERVER_ERROR",
    message: error.message || "An unexpected error occurred",
    details: "Internal Server Error",
    statusCode: statusCode,
    extra: {},
  };

  return ResponseFormatter.error(res, errorObj, statusCode);
}
