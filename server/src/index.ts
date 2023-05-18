import 'module-alias/register'; // See https://www.npmjs.com/package/module-alias

import { logger } from './modules/core/lib/logger';
import { createExpressServer } from './modules/server/lib/httpServer';
import { config } from './modules/core/lib/config';
import { createSmtpServer } from './modules/server/lib/smtpServer';
import { createRedisClient } from './datasources/redis/redisClient';

process.on('unhandledRejection', (err): void => {
  // let uncaughtException handler deal with the error
  throw err;
});

process.on('uncaughtException', (err): void => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

const main = async () => {
  const { httpPort, stmpPort, baseUrl } = config;

  const { redisClient, redisConnect } = createRedisClient({
    url: config.redisUrl,
  });

  createExpressServer({ redisClient }).then((httpApp) => {
    httpApp.listen({ port: httpPort }, (): void =>
      logger.info(`HTTP server running at ${baseUrl}:${httpPort}`),
    );
  });

  createSmtpServer({ redisClient }).listen(stmpPort, (): void =>
    logger.info(`STMP server running at ${baseUrl}:${stmpPort}`),
  );

  await redisConnect();
};

main();
