import type { Handler } from 'express';

export const catchHandlerError = (fn: Handler) => {
  const catchHandlerErrorWrapper: Handler = (req, res, next, ...args) => {
    return Promise.resolve(fn(req, res, next, ...args)).catch((err) => {
      console.error(err);
      next(err);
    });
  };
  return catchHandlerErrorWrapper;
};
