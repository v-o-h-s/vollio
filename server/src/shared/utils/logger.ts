const isDev = process.env.NODE_ENV !== 'production';

export const loggerConfig = isDev
  ? {
    level: process.env.LOG_LEVEL || 'debug',
    serializers: {
      err: (error: Error) => ({
        message: error.message,
        stack: error.stack, // optional, remove in prod
        type: error.name,
        code: (error as any).code, // if your errors have codes
      }),
    },
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }
  : {
    level: process.env.LOG_LEVEL || 'info',
  };

export default loggerConfig;
