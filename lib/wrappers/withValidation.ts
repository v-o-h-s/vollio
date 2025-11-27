import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/error-handling/ValidationError";
import { Logger } from "../utils/logger";
export function withValidation<T, Targs extends unknown[] = []>(
  schema: ZodSchema<T>,
  handler: (
    request: NextRequest,
    data: T,
    ...args: Targs
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    ...args: Targs
  ): Promise<NextResponse> => {
    Logger.info("🔍 Starting Zod validation", {
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const validationDetails = result.error.issues.map((issue) => ({
        expected: JSON.stringify(issue.input),
        type: issue.code,
        path: issue.path.filter(
          (p): p is string | number => typeof p !== "symbol"
        ),
        message: issue.message,
      }));

      const errorMessage = result.error.issues
        .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
        .join("; ");

      Logger.warn("Zod validation failed", {
        errors: validationDetails,
        message: errorMessage,
      });

      throw new ValidationError(errorMessage, validationDetails);
    }

    Logger.info("✅ Zod validation passed", {
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    return handler(request, result.data, ...args);
  };
}
