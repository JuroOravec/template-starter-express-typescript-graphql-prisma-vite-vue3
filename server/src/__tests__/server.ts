import request from 'supertest';

import { createExpressServer } from '../server';

test('It should require authentication', async (): Promise<any> => {
  expect.assertions(1);

  const app = await createExpressServer();

  const result = await request(app)
    .post('/graphql')
    .set('Content-Type', 'application/json');

  expect(result.statusCode).toBe(401);
});
