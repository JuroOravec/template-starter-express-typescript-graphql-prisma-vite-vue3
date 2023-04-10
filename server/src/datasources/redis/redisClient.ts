import { createClient } from 'redis';

import { config } from '@/modules/core/utils/config';
import { logger } from '@/modules/core/utils/logger';

export const redisClient = createClient({
  url: config.redisUrl,
  // See https://stackoverflow.com/a/70225118/9788634
  legacyMode: true,
});

export const initRedisClient = async (): Promise<void> => {
  redisClient.on('error', (err) => logger.error(`Redis Client Error: ${err}`));

  await redisClient.connect();
};
