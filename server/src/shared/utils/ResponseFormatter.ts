import { FastifyReply } from "fastify";
import { ErrorObject } from "../types/error";

/**
 * Utility class for formatting standardized API responses
 * Ensures consistent response structure across all endpoints
 * 
 * Response Format:
 * {
 *   success: boolean,
 *   message: string,
 *   data: T | null,
 *   error: ErrorObject | null
 * }
 */
export class ResponseFormatter {
    /**
     * Send a success response in the standard format
     * @param res Express Response object
     * @param data The response data payload
     * @param message Success message
     * @param statusCode HTTP status code (default: 200)
     */
    static success<T>(
        res: FastifyReply,
        data: T | null = null,
        message: string = "Success",
        statusCode: number = 200
    ): FastifyReply {
        return res.status(statusCode).send({
            success: true,
            message: message,
            data: data,
            error: null,
        });
    }

    /**
     * Send an error response in the standard format
     * @param res Express Response object
     * @param errorObject Error object with type and message
     * @param statusCode HTTP status code
     * @param message Error message
     */
    static error(
        res: FastifyReply,
        errorObject: ErrorObject,
        statusCode: number = 400,
        message?: string
    ): FastifyReply {
        return res.status(statusCode).send({
            success: false,
            message: message || errorObject.message,
            data: null,
            error: errorObject,
        });
    }
}
