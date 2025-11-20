import { BaseAppError, ErrorSeverity } from "./BaseAppError";

interface ValidationErrorDetail {
    expected: string;
    type: string,
    path: (string | number)[];
    message: string;
}
export class ValidationError extends BaseAppError {
    public readonly details?: ValidationErrorDetail[]
    constructor(
        message: string = "Validation error occurred",
        details: ValidationErrorDetail[],
    ) {
        super(message, {
            severity: ErrorSeverity.LOW,
            userMessage: "There was a validation error. Please check your input and try again.",
            statusCode: 400,

        });
        this.details = details
    }
    getTitle(): string {
        return "Validation Error";
    }
}