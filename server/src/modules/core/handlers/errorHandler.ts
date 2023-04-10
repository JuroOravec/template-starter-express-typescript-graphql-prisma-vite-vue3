import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';

// prettier-ignore
export const errorHandler: ErrorRequestHandler = async (err, _req, res, next) => {
  if (!err) {
    return next();
  }
  
  logger.error(err);
  res.status(err.status).json({
    error: {
      status: err.status,
      message: err.message,
    },
  });
};
