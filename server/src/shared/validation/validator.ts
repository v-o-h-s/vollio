import Ajv, { JSONSchemaType } from "ajv";
import { FastifyRequest, FastifyReply } from "fastify";
import { ResponseFormatter } from "../utils/ResponseFormatter";
import { ErrorObject } from "../types/error";
import {
  ValidationError,
  ValidationFieldError,
} from "../errors/ValidationError";
import { sanitizeObject } from "../utils/sanitizer";

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
});

// Fields that should be sanitized for XSS
const DEFAULT_SANITIZABLE_FIELDS = ["name", "title", "description"];

/**
 * Validate body against AJV schema
 */
export function validateBody<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.body);

    if (!valid) {
      throw ValidationError.fromAjvErrors(validate.errors as any[]);
    }
  };
}

/**
 * Validate body against AJV schema AND sanitize string fields
 */
export function validateAndSanitizeBody<T>(
  schema: JSONSchemaType<T>,
  fieldsToSanitize: string[] = DEFAULT_SANITIZABLE_FIELDS
) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Step 1: AJV schema validation
    const valid = validate(request.body);
    if (!valid) {
      throw ValidationError.fromAjvErrors(validate.errors as any[]);
    }

    // Step 2: Sanitization layer
    const { sanitized, errors } = sanitizeObject(
      request.body as Record<string, any>,
      fieldsToSanitize
    );

    if (errors.length > 0) {
      throw new ValidationError({
        message: `Validation failed: ${errors
          .map((e) => e.message)
          .join(", ")}`,
        fieldErrors: errors,
        source: "sanitization",
      });
    }

    // Replace body with sanitized version
    (request as any).body = sanitized;
  };
}

/**
 * Validate params against AJV schema
 */
export function validateParams<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.params);

    if (!valid) {
      throw ValidationError.fromAjvErrors(validate.errors as any[]);
    }
  };
}

/**
 * Validate query against AJV schema
 */
export function validateQuery<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.query);

    if (!valid) {
      throw ValidationError.fromAjvErrors(validate.errors as any[]);
    }
  };
}
