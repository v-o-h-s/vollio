import Ajv, { JSONSchemaType } from "ajv";
import { FastifyRequest, FastifyReply } from "fastify";

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
      return reply.status(400).send({
        success: false,
        data:null,

        error: "Validation error",
        details: validate.errors,
      });
    }
  };
}

export function validateParams<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.params);

    if (!valid) {
      return reply.status(400).send({
        success: false,
        data:null,

        error: "Validation error",
        details: validate.errors,
      });
    }
  };
}

export function validateQuery<T>(schema: JSONSchemaType<T>) {
  const validate = ajv.compile(schema);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const valid = validate(request.query);

    if (!valid) {
      return reply.status(400).send({
        success: false,
        data:null,
        error: "Validation error",
        details: validate.errors,
      });
    }
  };
}
