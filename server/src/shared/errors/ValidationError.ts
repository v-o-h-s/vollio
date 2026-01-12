/**
 * Error thrown when input validation fails.
 * Combines schema validation (AJV) with sanitization checks.
 */

export interface ValidationFieldError {
  field: string;
  message: string;
  code:
    | "xss_detected"
    | "too_long"
    | "invalid_format"
    | "required"
    | "type_error"
    | "pattern_mismatch";
}

export class ValidationError extends Error {
  public readonly statusCode: number = 400;
  public readonly code: string = "VALIDATION_ERROR";
  public readonly fieldErrors: ValidationFieldError[];
  public readonly source: "schema" | "sanitization" | "custom";

  constructor(opts: {
    message?: string;
    fieldErrors: ValidationFieldError[];
    source?: "schema" | "sanitization" | "custom";
  }) {
    super(opts.message || "Validation failed");
    this.name = "ValidationError";
    this.fieldErrors = opts.fieldErrors;
    this.source = opts.source || "custom";
  }

  /**
   * Create a ValidationError from AJV errors
   */
  static fromAjvErrors(errors: any[]): ValidationError {
    const fieldErrors: ValidationFieldError[] = errors.map((e) => {
      const rawPath =
        typeof e.instancePath === "string"
          ? e.instancePath.replace(/^\//, "")
          : "";
      const field =
        rawPath.replace(/\//g, ".") ||
        (e.params?.missingProperty ? String(e.params.missingProperty) : "body");

      let code: ValidationFieldError["code"] = "invalid_format";
      if (e.keyword === "required") code = "required";
      else if (e.keyword === "type") code = "type_error";
      else if (e.keyword === "pattern") code = "pattern_mismatch";

      return {
        field,
        message: e.message || `${e.keyword} validation failed`,
        code,
      };
    });

    const firstError = fieldErrors[0];
    const message = firstError
      ? `Invalid input at '${firstError.field}': ${firstError.message}`
      : "Validation failed";

    return new ValidationError({
      message,
      fieldErrors,
      source: "schema",
    });
  }
}
