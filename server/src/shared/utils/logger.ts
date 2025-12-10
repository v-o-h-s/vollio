const isDev = process.env.NODE_ENV !== 'production';

export const loggerConfig = isDev
  ? {
    level: process.env.LOG_LEVEL || 'debug',
    
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
