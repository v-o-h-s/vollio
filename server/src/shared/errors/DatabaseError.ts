import { ServerError } from "./ServerError";

export enum DatabaseSubError {
  GENERAL = "GENERAL",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  CONSTRAINT_ERROR = "CONSTRAINT_ERROR",
  ACCESS_DENIED = "ACCESS_DENIED",
  NOT_FOUND = "NOT_FOUND",
  RLS_VIOLATION_ERROR = "RLS_VIOLATION_ERROR",
}

export class DatabaseError extends ServerError {
  public code: string;
  public details: any;
  public originalError: any;
  public timestamp: string;
  public statusCode: number;

  constructor(error?: any, message?: string) {
    const errorMessage = error?.message || message || "General database error";
    const subError = mapCodeToSubError(error?.code);

    // Prioritize explicit type, then mapped subError, then GENERAL
    super(errorMessage, error?.type || subError || DatabaseSubError.GENERAL);

    this.name = "DatabaseError";
    this.code = error?.code || "GENERAL";
    this.details = error?.details || {};
    this.originalError = error;
    this.timestamp = new Date().toISOString();
    this.statusCode = error?.statusCode || 500;
  }
}

function mapCodeToSubError(code: string) {
  switch (code) {
    case "PGRST000":
      return DatabaseSubError.CONNECTION_ERROR;
    case "PGRST101":
      return DatabaseSubError.CONSTRAINT_ERROR;
    case "PGRST116":
      return DatabaseSubError.ACCESS_DENIED;
    case "PGRST301":
      return DatabaseSubError.NOT_FOUND;
    case "42501":
      return DatabaseSubError.RLS_VIOLATION_ERROR;
    default:
      return DatabaseSubError.GENERAL;
  }
}
