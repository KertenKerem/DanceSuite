import winston from 'winston';

const { combine, timestamp, json, errors, printf } = winston.format;

// Custom format for console output with colors
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: {
    service: 'dancesuite-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Write to console with JSON format for Fluent Bit to parse
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
        json()
      )
    }),

    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(
        timestamp(),
        json()
      )
    }),

    // Write errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp(),
        json()
      )
    })
  ]
});

// If we're not in production, also log with pretty colors to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      winston.format.colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
    level: 'debug'
  }));
}

// Create a stream object for Morgan HTTP logging middleware
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

export default logger;
