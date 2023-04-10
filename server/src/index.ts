import 'module-alias/register'; // See https://www.npmjs.com/package/module-alias

// import { setupHandleProcessErrors } from './modules/core/utils/setupHandleProcessErrors';
import { logger } from './modules/core/utils/logger';
import { createExpressServer } from './server';
import { setupServerChassis } from './modules/core/utils/serverChassis';
import { config } from './modules/core/utils/config';

// setupHandleProcessErrors();

const { port, baseUrl } = config;

createExpressServer().then((app) => {
  setupServerChassis(app);

  app.listen({ port }, (): void =>
    logger.info(`Server running at ${baseUrl}:${port}`),
  );
});
