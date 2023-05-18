import { createTerminus } from '@godaddy/terminus';

import { logger } from '../../core/lib/logger';

/** Given Express app, configure healthcheck endpoint using terminus */
export const setupHealthcheck = <T>(app: T): void => {
  const onSignal = (): any => {
    logger.info('Kill signal received');
  };

  const onShutdown = (): any => {
    logger.info('Shutting down server');
  };

  const healthCheck = (): any => {
    return Promise.resolve(true);
  };

  createTerminus(app, {
    healthChecks: {
      '/healthcheck': healthCheck,
    },
    onSignal,
    onShutdown,
  });
};
