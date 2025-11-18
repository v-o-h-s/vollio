import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export function withValidation(schema: ZodSchema, handler: (request: NextRequest) => Promise<NextResponse>) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const result = schema.safeParse(request.body);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    errorType: "VALIDATION_ERROR",
                    error: {
                        message: "Invalid request body",
                        issues: result.error.issues,
                    },
                },
                { status: 400 }
            );
        }

        return handler(request);
    };
}