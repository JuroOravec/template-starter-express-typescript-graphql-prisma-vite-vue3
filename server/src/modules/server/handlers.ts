import bodyParser from 'body-parser';
import createError from 'http-errors';
import type { Handler, ErrorRequestHandler } from 'express';
import Joi from 'joi';

import { logger } from '../core/lib/logger';

/**
 * Handler that parse request body.
 *
 * Used as one of the first handlers, so that all subsequent
 * handlers have the body content available nicely parsed.
 */
export const bodyParserHandler: Handler = bodyParser.json();

/**
 * Handler that formats errors
 *
 * Used as one of the last handlers, so that
 * 1) If we get to this handler
 * 2) And there's an error
 * THEN, the response returns an error.
 */
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

/**
 * Handler that throws 404 error
 *
 * Used as one of the last handlers, so that if we
 * get to this handler THEN, the response returns an error.
 */
export const notFoundHandler: Handler = (_req, _res, next) => {
  next(createError(404));
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
export const createValidateRequestHandler = (
  schema: Joi.Schema = requestSchema,
) => {
  const handler: Handler = (req, _res, next) => {
    const { error } = schema.validate(req);

    if (error) {
      // 405 Method Not Allowed
      if (error.details[0].context?.key === 'method') {
        next(createError(405, error.message));
      }
      // 406 Not Acceptable
      if (error.details[0].context?.key === 'content-type') {
        next(createError(406, error.message));
      }
      return;
    }

    next();
  };

  return handler;
};

// prettier-ignore
/** Test handler */
export const helloHandler: Handler = async (req, res, next) => {
  res.status(200).json({
    data: "Hello world!",
  });
};
