import 'module-alias/register'; // See https://www.npmjs.com/package/module-alias

import { logger } from './modules/core/lib/logger';
import { createExpressServer } from './server';
import { setupServerChassis } from './modules/core/lib/serverChassis';
import { config } from './modules/core/lib/config';

const { port, baseUrl } = config;

createExpressServer().then((app) => {
  setupServerChassis(app);

  app.listen({ port }, (): void =>
    logger.info(`Server running at ${baseUrl}:${port}`),
  );
});
