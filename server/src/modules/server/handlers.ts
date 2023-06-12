import createHttpError, { HttpError } from 'http-errors';
import type { Handler, ErrorRequestHandler, Request } from 'express';
import Joi from 'joi';
import statuses from 'statuses';

import { logger } from '@/globals/logger';
import { AppContextInput, createAppContext } from '@/globals/context';

/**
 * Handler that formats errors
 *
 * Used as one of the last handlers, so that
 * 1) If we get to this handler
 * 2) And there's an error
 * THEN, the response returns an error.
 */
// prettier-ignore
export const errorHandler: ErrorRequestHandler = async (err: HttpError, _req, res, next) => {
  if (!err) {
    return next();
  }

  logger.error(err);

  // See https://github.com/jshttp/http-errors
  const errStatus = err.status || 500;
  const isExposed = err.expose || (err.expose == null && errStatus < 500);

  res.status(errStatus).json({
    error: {
      name: isExposed ? err.name : 'InternalServerError',
      status: errStatus,
      message: isExposed ? err.message : statuses(500),
      // Use the Sentry's event ID for the error reference
      // If Sentry processed the erorr, then res.sentry is the eventId.
      // See `errorHandler` in node_modules/@sentry/node/esm/handlers.js (@sentry/node: ^7.52.1)
      errorId: (res as any)?.sentry ?? null,
    },
  });
};

/**
 * Handler that throws 404 error
 *
 * Used as one of the last handlers, so that if we
 * get to this handler THEN, the response returns an error.
 */
export const notFoundHandler: Handler = (_req, _res, next) => {
  next(createHttpError(404));
};

const requestSchema = Joi.object<Request>({
  headers: Joi.object({
    'content-type': Joi.string().min(1).allow('application/json').required(),
  })
    .required()
    .unknown(true),
  method: Joi.string().min(1).allow('GET', 'POST').required(),
}).required();

/**
 * Handler that validates that the request has the correct shape.
 *
 * Used as one of the first handlers, so that we walidate
 * the correctness of input before processing the request further.
 */
export const createValidateRequestHandler = (schema: Joi.Schema = requestSchema) => {
  const handler: Handler = (req, _res, next) => {
    const { error } = schema.validate(req);

    if (error) {
      // 405 Method Not Allowed
      if (error.details[0].context?.key === 'method') {
        next(createHttpError(405, error.message));
      }
      // 406 Not Acceptable
      if (error.details[0].context?.key === 'content-type') {
        next(createHttpError(406, error.message));
      }
      return;
    }

    next();
  };

  return handler;
};

// prettier-ignore
/** Test handler */
export const helloHandler: Handler = async (req, res, _next) => {
  res.status(200).json({
    data: "Hello world!",
  });
};

/** Provide app context under `req.context` */
export const createAppContextHandler = (input: Omit<AppContextInput, 'req'>) => {
  const appContextHandler: Handler = (req, res, next) => {
    req.context = createAppContext({ ...input, req });
    next();
  };
  return appContextHandler;
};
