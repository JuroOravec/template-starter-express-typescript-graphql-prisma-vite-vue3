import { createTerminus } from '@godaddy/terminus';

import { logger } from '../lib/logger';

/** Given an Express app, configure it to gracefully  */
export const setupServerChassis = <T>(app: T): void => {
  process.on('unhandledRejection', (err): void => {
    // let uncaughtException handler deal with the error
    throw err;
  });

  process.on('uncaughtException', (err): void => {
    logger.error('Uncaught exception', err);

    process.exit(1);
  });

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
