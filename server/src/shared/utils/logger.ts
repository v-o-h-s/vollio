import pino from "pino";
import type { LoggerOptions } from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Logger configuration
 *
 * - Development: Pretty console output with colors (pino-pretty)
 * - Production: Sends logs to Seq server via pino-seq
 *
 * Note: In production, we use pino.transport() which handles
 * the ESM pino-seq module correctly.
 */

// Development logger config with pretty output
const devLoggerConfig: LoggerOptions = {
    level: process.env.LOG_LEVEL || "debug",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            singleLine: false,
        },
    },
};

// Production logger config with Seq transport
const prodLoggerConfig: LoggerOptions = {
    level: process.env.LOG_LEVEL || "info",
    base: {
        service: "vollio-api",
        env: process.env.NODE_ENV,
    },
    transport: {
        target: "pino-seq",
        options: {
            serverUrl: process.env.SEQ_SERVER_URL || "http://vollio-seq:5341",
            maxBatchingTime: 2000,
            batchSizeLimit: 10,
        },
    },
};

// Export logger config for Fastify
export const loggerConfig: LoggerOptions = isDev ? devLoggerConfig : prodLoggerConfig;

// Export a standalone logger instance for use outside of Fastify
export const logger = pino(loggerConfig);

export default loggerConfig;
