import { RedisClientOptions, createClient } from 'redis';

import { logger } from '@/modules/core/lib/logger';

export const createRedisClient = (clientOptions?: RedisClientOptions) => {
  const redisClient = createClient(clientOptions);

  redisClient.on('error', (err) => logger.error(`Redis Client Error: ${err}`));

  /** Shorthand for `redisClient.connect().catch(logger.error)` */
  const redisConnect = (): Promise<void> => {
    return redisClient.connect().catch(logger.error);
  };

  return { redisClient, redisConnect };
};
