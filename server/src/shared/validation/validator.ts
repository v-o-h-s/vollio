import Ajv, { JSONSchemaType } from "ajv";
import { FastifyRequest, FastifyReply } from "fastify";
import { ResponseFormatter } from "../utils/ResponseFormatter";
import { ErrorObject } from "../types/error";

// Format AJV errors into a frontend-friendly structure:
// - message: short human-friendly message (e.g., "Invalid input at 'email': must have format 'email'")
// - fieldErrors: map of field -> array of error messages
function buildValidationPayload(errors: any[] = []) {
  const fieldErrors: Record<string, string[]> = {};

  for (const e of errors) {
    // e.instancePath is like '/user/email' or '/email' or '' for root
    // Transform to a dot.path like 'user.email' or 'email' or ''
    const rawPath = typeof e.instancePath === 'string' ? e.instancePath.replace(/^\//, '') : '';
    const path = rawPath.replace(/\//g, '.') || (e.params && e.params.missingProperty ? String(e.params.missingProperty) : 'body');
    const msg = e.message ? String(e.message) : (e.keyword ? `${e.keyword} validation failed` : 'invalid');

    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(msg);
  }

  const firstPath = Object.keys(fieldErrors)[0];
  const firstMsg = firstPath ? fieldErrors[firstPath][0] : 'invalid request payload';
  const message = firstPath ? `Invalid input at '${firstPath}': ${firstMsg}` : `Invalid input: ${firstMsg}`;

  return { message, fieldErrors, errors };
}

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
});

export function validateBody<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.body);

    if (!valid) {
      const { message, fieldErrors, errors } = buildValidationPayload(validate.errors as any[]);

      const err: ErrorObject = {
        name: "ValidationError",
        subType: "Ajv",
        message,
        details: JSON.stringify(errors),
        statusCode: 400,
        extra: { errors, fieldErrors },
      };

      return ResponseFormatter.error(reply, err, 400, message);
    }
  };
}

export function validateParams<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.params);

    if (!valid) {
      const { message, fieldErrors, errors } = buildValidationPayload(validate.errors as any[]);

      const err: ErrorObject = {
        name: "ValidationError",
        subType: "Ajv",
        message,
        details: JSON.stringify(errors),
        statusCode: 400,
        extra: { errors, fieldErrors },
      };

      return ResponseFormatter.error(reply, err, 400, message);
    }
  };
}

export function validateQuery<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.query);

    if (!valid) {
      const { message, fieldErrors, errors } = buildValidationPayload(validate.errors as any[]);

      const err: ErrorObject = {
        name: "ValidationError",
        subType: "Ajv",
        message,
        details: JSON.stringify(errors),
        statusCode: 400,
        extra: { errors, fieldErrors },
      };

      return ResponseFormatter.error(reply, err, 400, message);
    }
  };
}
