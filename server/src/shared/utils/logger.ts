import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Logger configuration
 *
 * - Development: Pino with pino-pretty (colorized console output)
 * - Production: Pino with JSON output
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
  // Production: JSON output for log aggregation services
  loggerConfig = {
    level: process.env.LOG_LEVEL || "info",
    base: {
      service: "vollio-api",
      env: process.env.NODE_ENV,
    },
  };

  logger = pino(loggerConfig);
}

export { logger, loggerConfig };
export default logger;
