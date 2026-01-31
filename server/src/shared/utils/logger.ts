import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Logger configuration
 *
 * - Development: Pino with pino-pretty (colorized console output)
 * - Production: Pino with pino-seq (sends logs to Seq server)
 */

let logger: Logger;
let loggerConfig: LoggerOptions;

if (isDev) {
    // Development: pretty console output
    loggerConfig = {
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
    logger = pino(loggerConfig);
} else {
    // Production: send logs to Seq server
    // Using require() to avoid ESM/worker thread issues with pino-seq
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createStream } = require("pino-seq");

    const seqStream = createStream({
        serverUrl: process.env.SEQ_SERVER_URL || "http://vollio-seq:5341",
        maxBatchingTime: 2000,
        batchSizeLimit: 10,
    });

    loggerConfig = {
        level: process.env.LOG_LEVEL || "info",
        base: {
            service: "vollio-api",
            env: process.env.NODE_ENV,
        },
    };

    logger = pino(loggerConfig, seqStream);
}

export { logger, loggerConfig };
export default logger;
