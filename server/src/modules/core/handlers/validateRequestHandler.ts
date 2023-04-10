import createError from 'http-errors';
import type { Handler } from 'express';
import Joi from 'joi';

const requestSchema = Joi.object<Request>({
  headers: Joi.object({
    'content-type': Joi.string().min(1).allow('application/json').required(),
  })
    .required()
    .unknown(true),
  method: Joi.string().min(1).allow('GET', 'POST').required(),
}).required();

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
