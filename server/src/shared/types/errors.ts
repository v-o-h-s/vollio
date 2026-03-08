export enum ErrorName {
  QuotaExceededError = "QuotaExceededError",
  RateLimitingError = "RateLimitingError",
  NotFoundError = "NotFoundError",
  ValidationError = "ValidationError",
  ConflictError = "ConflictError",
  AuthError = "AuthError",
  DatabaseError = "DatabaseError",
  ServerError = "ServerError",
}

export enum AppErrorCode {
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  CONFLICT = "CONFLICT",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  DATABASE_ERROR = "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
