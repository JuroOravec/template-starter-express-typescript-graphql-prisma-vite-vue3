import helmet, { HelmetOptions } from 'helmet';
import type { Handler } from 'express';

import { config } from '../utils/config';

// See https://stackoverflow.com/a/69958496/9788634
export const helmetOptions: HelmetOptions = config.enableCsp
  ? {
      contentSecurityPolicy: { useDefaults: true },
    }
  : {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      permittedCrossDomainPolicies: false,
    };

export const helmetHandler: Handler = helmet(helmetOptions);
