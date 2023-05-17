import 'module-alias/register'; // See https://www.npmjs.com/package/module-alias

import { logger } from './modules/core/lib/logger';
import { createExpressServer } from './modules/servers/httpServer';
import { setupServerChassis } from './modules/core/lib/serverChassis';
import { config } from './modules/core/lib/config';
import { createSmtpServer } from './modules/servers/smtpServer';

const { httpPort, stmpPort, baseUrl } = config;

createExpressServer().then((app) => {
  setupServerChassis(app);
  app.listen({ port: httpPort }, (): void =>
    logger.info(`HTTP server running at ${baseUrl}:${httpPort}`),
  );
});

createSmtpServer().listen(stmpPort, (): void =>
  logger.info(`STMP server running at ${baseUrl}:${stmpPort}`),
);
