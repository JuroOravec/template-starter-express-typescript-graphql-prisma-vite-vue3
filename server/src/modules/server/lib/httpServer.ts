import express, { Express } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import compression from 'compression';
import passport from 'passport';
import type { RedisClientType } from 'redis';

import { bodyParserHandler } from '../handlers';
import {
  corsHandler,
  csrfHandler,
  helmetHandler,
} from '../../security/handlers';
import { createSessionHandler } from '../../session/handlers';
import {
  errorHandler,
  notFoundHandler,
  createValidateRequestHandler,
} from '../handlers';
import { apolloServer } from '@/apis/graphql/apolloServer';
import { createAuthRouter } from '../../auth/router';
import { authHandler } from '../../auth/handlers';
import { createServerRouter } from '../router';
import { setupHealthcheck } from './healthcheck';

export const createExpressServer = async ({
  redisClient,
}: {
  redisClient: RedisClientType<any, any, any>;
}): Promise<Express> => {
  const app = express();

  // Get real ip from nginx proxy
  app.set('trust proxy', true);

  // Middlewares
  app.use(
    bodyParserHandler,
    corsHandler,
    compression(),
    helmetHandler,
    createSessionHandler(redisClient),
    // app.use(createValidateRequestHandler()); // TODO: Enable this?
    csrfHandler,
    passport.initialize(),
    passport.session(),
  );

  // Routes
  app.use('/graphql', authHandler); // TODO: Disable for dev?
  app.get('/hello', createServerRouter());
  app.use('/auth', createAuthRouter());
  setupHealthcheck(app);

  // Set up Apollo server
  await (
    // @ts-ignore Silence this error https://stackoverflow.com/questions/66858790
    apolloServer.start()
  ); // prettier-ignore
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        // TODO ?
        return {
          user: req,
        };
      },
    }),
  );

  app.use(notFoundHandler, errorHandler);

  return app;
};
