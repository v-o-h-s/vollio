import { BaseAppError, ErrorSeverity } from "./BaseAppError";
enum ValidationErrorType {
    INVALID_TYPE = "invalid_type", // The input type does not match the expected type.
    INVALID_LITERAL = "invalid_literal", // The input does not match a literal value.
    UNRECOGNIZED_KEYS = "unrecognized_keys", // Extra keys were present when `strict()` is used.
    INVALID_UNION = "invalid_union", // None of the union options matched.
    INVALID_UNION_DISCRIMINATOR = "invalid_union_discriminator", // Discriminator key did not match any union member.
    INVALID_ENUM_VALUE = "invalid_enum_value", // The value is not part of the enum.
    INVALID_ARGUMENTS = "invalid_arguments", // Used for function argument validation.
    INVALID_RETURN_TYPE = "invalid_return_type", // Function return type is invalid.
    INVALID_DATE = "invalid_date", // Invalid Date object or not a Date.
    INVALID_STRING = "invalid_string", // String failed a refinement (e.g., min, max, regex).
    TOO_SMALL = "too_small", // Array, string, or number is smaller than `min`.
    TOO_BIG = "too_big", // Array, string, or number is bigger than `max`.
    CUSTOM = "custom", // A custom refinement failed.
    INVALID_INTERSECTION_TYPES = "invalid_intersection_types", // Intersection of types failed.
    NOT_MULTIPLE_OF = "not_multiple_of", // Number is not a multiple of a given value.
}
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