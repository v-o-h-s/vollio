import { ServerError } from "./ServerError";

export enum AuthErrorSubType {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  SESSION_INVALID = "SESSION_INVALID",
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
  FORBIDDEN = "FORBIDDEN",
}

export class AuthError extends ServerError {
  constructor(message: string, subError: AuthErrorSubType) {
    super(message, subError);
    this.name = "AuthError";
  }
}
