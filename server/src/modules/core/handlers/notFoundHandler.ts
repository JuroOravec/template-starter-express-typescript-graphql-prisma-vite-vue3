import createError from 'http-errors';
import type { Handler } from 'express';

export const notFoundHandler: Handler = (_req, _res, next) => {
  next(createError(404));
};
