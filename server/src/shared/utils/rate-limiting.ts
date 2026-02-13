import { FastifyRequest } from "fastify";

/**
 * Get client IP from request (considering proxies)
 */
export function getClientIp(request: any): string {
  return (
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.headers["x-real-ip"] ||
    request.ip ||
    "unknown"
  );
}

export enum RateLimitingDegrees {
  EXEMPT = 0,
  LOW = 1,
  MEDIUM = 5,
  HIGH = 25,
  VERY_HIGH = 50,
}
export enum AIRateLimitingDegrees {
  CHAT = 5000,
  DOCUMENT = 30000,
}
export enum IdentifierType {
  IP = "ip",
  USERID = "userId",
}
export type Identifier =
  | { type: IdentifierType.IP; value: string }
  | { type: IdentifierType.USERID; value: string };

export enum PrefixTypes {
  REQUEST = "rate_limiting:request",
  AI_PER_MINUTE = "rate_limiting:resources:ai:per_minute",
  AI_PER_DAY = "rate_limiting:resources:ai:per_day",
  AI_PER_MONTH = "rate_limiting:resources:ai:per_month",
}

export function estimateCost(request: FastifyRequest) {
  const url = request.url;

  // Heavy document-based generation (Summaries, Flashcards, Quizzes)
  if (
    url.includes("generate-summary") ||
    url.includes("generate-from-document") ||
    url.includes("quiz")
  ) {
    return 50000; // Expected high token usage for document processing
  }

  // Standard Assistant/Chat interactions
  if (url.includes("assistant") || url.includes("chat")) {
    return 5000; // Baseline for a typical chat turn
  }

  return 1000; // Default fallback
}
