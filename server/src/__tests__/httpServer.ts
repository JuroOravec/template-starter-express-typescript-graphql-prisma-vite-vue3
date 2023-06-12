import request from 'supertest';

import { createExpressServer } from '../modules/server/lib/httpServer';
import { createRedisClient } from '@/datasources/redis/redisClient';
import { config } from '@/globals/config';

test('It should require authentication', async (): Promise<any> => {
  expect.assertions(1);

  const { redisClient } = createRedisClient({
    url: config.redisUrl,
  });
  const app = await createExpressServer({ redisClient, mailer: {} as any });

  const result = await request(app).post('/graphql').set('Content-Type', 'application/json');

  expect(result.statusCode).toBe(401);
});
