import type { Handler } from 'express';
import createError from 'http-errors';

import { config } from '../utils/config';

/**
 * Note: This is a very basic CSRF technique assuming, that a form can not add
 * custom headers to a request. Be aware that due to some bugs this might still
 * be possible to exploit. Make sure to include an header "X-CSRF-TOKEN" with
 * any value (but not empty) to any request from the client.
 */
export const csrfHandler: Handler = (req, _res, next): void => {
  if (!config.enableCsrf) {
    return next();
  }

  if (req.get('X-CSRF-TOKEN')) {
    next();
  } else {
    next(createError(403));
  }
};
