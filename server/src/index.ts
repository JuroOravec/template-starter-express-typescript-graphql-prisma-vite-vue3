import 'module-alias/register'; // See https://www.npmjs.com/package/module-alias
import { effectScope, onScopeDispose } from '@vue/reactivity';

import { logger } from './globals/logger';
import { createExpressServer } from './modules/server/lib/httpServer';
import { config } from './globals/config';
import { createSmtpServer } from './modules/mail/lib/smtpServer';
import { createRedisClient } from './datasources/redis/redisClient';
import { createMailer } from './modules/mail/lib/mailer';

import type * as _ from './shims/express';

process.on('unhandledRejection', (err): void => {
  // let uncaughtException handler deal with the error
  throw err;
});

process.on('uncaughtException', (error): void => {
  logger.error({ error: error.toString(), stack: error.stack }, 'Uncaught exception');
  process.exit(1);
});

const main = () => {
  // See https://github.com/vuejs/rfcs/blob/master/active-rfcs/0041-reactivity-effect-scope.md
  const scope = effectScope();

  const scopeFnPromise = scope.run(async () => {
    const { httpPort, stmpPort, baseUrl } = config;

    const { redisClient, redisConnect } = createRedisClient({
      url: config.redisUrl,
    });
    const mailer = createMailer();

    const httpServerPromise = createExpressServer({ redisClient, mailer })
      .then(({ app: httpApp, dispose }) => {
        const httpServer = httpApp.listen({ port: httpPort }, (): void =>
          logger.info(`HTTP server running at ${baseUrl}:${httpPort}`),
        );

        onScopeDispose(() => {
          dispose();
          httpServer.close();
        });
      })
      .catch((error: Error) =>
        logger.error({ error }, `Uncaught error from HTTP server: ${error.name}`),
      );

    const smtpServerPromise = Promise.resolve(
      createSmtpServer({ redisClient, mailer }).listen(stmpPort, (): void =>
        logger.info(`STMP server running at ${baseUrl}:${stmpPort}`),
      ),
    )
      .then((server) => {
        onScopeDispose(() => {
          server.close();
        });
      })
      .catch((error: Error) =>
        logger.error({ error }, `Uncaught error from SMTP server: ${error.name}`),
      );

    await Promise.all([redisConnect(), httpServerPromise, smtpServerPromise]);
  });

  (scopeFnPromise || Promise.resolve()).catch((error: Error) => {
    logger.error({ error }, `Uncaught error from main(): ${error.name}`);
    scope.stop();
  });
};

main();
