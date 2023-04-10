import { createTerminus } from '@godaddy/terminus';

import { logger } from './logger';

/** Given an Express app, configure it to gracefully  */
export const setupServerChassis = <T>(app: T): void => {
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
