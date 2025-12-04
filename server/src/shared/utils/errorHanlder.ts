import { FastifyReply, FastifyRequest } from "fastify";
import { ServerError } from "../errors/ServerError";
import { DatabaseError } from "../errors/DatabaseError";
import { ErrorObject } from "../types/error";
import { NotFoundError } from "../errors/NotFoundError";

export function errorHandler(
  error: any,
  req: FastifyRequest,
  res: FastifyReply
) {
  if (error instanceof DatabaseError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,

      extra: {
        code: error.code,
        originalError: error.originalError,
        timestamp: error.timestamp,
      },
    };

    // Log the error using the request logger for context
    req.log.error({ err: error, ...errorObj }, "Database Error Occurred");

    return res.status(error.statusCode).send({
      success: false,
      status: error.statusCode,
      data: null,
      error: errorObj,
    });
  }

  // Handle other ServerErrors
  if (error instanceof ServerError) {
    const statusCode = 500;
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.message,
      statusCode: statusCode,
      extra: {},
    };

    req.log.error({ err: error }, "Server Error Occurred");

    return res.status(statusCode).send({
      success: false,
      status: statusCode,
      data: null,
      error: errorObj,
    });
  }
  if (error instanceof NotFoundError) {
    const errorObj: ErrorObject = {
      name: error.name,
      subType: error.subType,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      extra: {},
    };

    req.log.error({ err: error }, "Not Found Error Occurred");

    return res.status(error.statusCode).send({
      success: false,
      status: error.statusCode,
      data: null,
      error: errorObj,
    });
  }

  // Handle unexpected errors
  req.log.error({ err: error }, "Unexpected Error Occurred");

  const statusCode = error.statusCode || 500;
  const errorObj: ErrorObject = {
    name: error.name || "UnknownError",
    subType: "INTERNAL_SERVER_ERROR",
    message: error.message || "An unexpected error occurred",
    details: "Internal Server Error",
    statusCode: statusCode,
    extra: {},
  };

  return res.status(statusCode).send({
    success: false,
    status: statusCode,
    data: null,
    error: errorObj,
  });
}
