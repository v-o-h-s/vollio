import { ServerError } from "./ServerError";

export class NotFoundError extends ServerError {
  public details?: any;
  constructor(message: string, details?: any) {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
    this.details = details;
  }
}
