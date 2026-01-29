import morgan from 'morgan';
import logger from '../utils/logger.js';

// Create custom tokens for structured logging
morgan.token('user-id', (req) => req.user?.userId || 'anonymous');
morgan.token('user-role', (req) => req.user?.role || 'none');
morgan.token('request-id', (req) => req.id);

// Custom format for JSON logging
const jsonFormat = (tokens, req, res) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: `${tokens['response-time'](req, res)}ms`,
    userId: tokens['user-id'](req, res),
    userRole: tokens['user-role'](req, res),
    requestId: tokens['request-id'](req, res),
    userAgent: tokens['user-agent'](req, res),
    ip: tokens['remote-addr'](req, res),
    referrer: tokens.referrer(req, res)
  });
};

// Create the morgan middleware
export const requestLogger = morgan(jsonFormat, {
  stream: {
    write: (message) => {
      const logObject = JSON.parse(message);

      // Log at different levels based on status code
      if (logObject.status >= 500) {
        logger.error('HTTP Request', logObject);
      } else if (logObject.status >= 400) {
        logger.warn('HTTP Request', logObject);
      } else {
        logger.info('HTTP Request', logObject);
      }
    }
  },
  // Skip logging for health check endpoints
  skip: (req) => req.url === '/health' || req.url === '/api/health'
});

// Add request ID middleware
export const addRequestId = (req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

export default { requestLogger, addRequestId };
