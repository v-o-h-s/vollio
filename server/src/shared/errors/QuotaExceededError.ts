/**
 * Error thrown when a user has exceeded their allocated resources (Storage or AI).
 */
export class QuotaExceededError extends Error {
  public readonly statusCode: number = 403;
  public readonly code: string = "QUOTA_EXCEEDED";
  public readonly resource: "ai" | "storage";

  constructor(resource: "ai" | "storage", message?: string) {
    super(message || `Quota exceeded for ${resource} resources`);
    this.name = "QuotaExceededError";
    this.resource = resource;
  }
}
