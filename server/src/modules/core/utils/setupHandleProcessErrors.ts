import { logger } from './logger';

export const setupHandleProcessErrors = (): void => {
  process.on('unhandledRejection', (err): void => {
    // let uncaughtException handler deal with the error
    throw err;
  });

  process.on('uncaughtException', (err): void => {
    logger.error('Uncaught exception', err);

    process.exit(1);
  });
};
