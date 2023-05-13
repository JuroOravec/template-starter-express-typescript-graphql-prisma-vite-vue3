import cors, { CorsOptions } from 'cors';
import type { Handler } from 'express';
import createError from 'http-errors';
import helmet, { HelmetOptions } from 'helmet';

import { config } from '@/modules/core/lib/config';

const corsOptions: CorsOptions = {
  // TODO: Configure this based on enableCors config value
  origin: (origin, cb) => cb(null, origin),
  credentials: true,
};

export const corsHandler: Handler = cors(corsOptions);

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

// See https://stackoverflow.com/a/69958496/9788634
export const helmetOptions: HelmetOptions = config.enableCsp
  ? {
      contentSecurityPolicy: { useDefaults: true },
    }
  : {
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      permittedCrossDomainPolicies: false,
    };

export const helmetHandler: Handler = helmet(helmetOptions);
