import express, { Express } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import compression from 'compression';
import passport from 'passport';

import { bodyParserHandler } from './modules/core/handlers';
import {
  corsHandler,
  csrfHandler,
  helmetHandler,
} from './modules/security/handlers';
import { createSessionHandler } from './modules/session/handlers';
import {
  errorHandler,
  notFoundHandler,
  createValidateRequestHandler,
} from './modules/core/handlers';
import { apolloServer } from './apis/graphql/apolloServer';
import { createRedisClient } from './datasources/redis/redisClient';
import { createAuthRouter } from './modules/auth/router';
import { authHandler } from './modules/auth/handlers';
import { createCoreRouter } from './modules/core/router';
import { config } from './modules/core/lib/config';

export const createExpressServer = async (): Promise<Express> => {
  const app = express();
  const { redisClient, redisConnect } = createRedisClient({
    url: config.redisUrl,
  });

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
  // app.use('/graphql', authHandler); // TODO: Enable this?
  app.get('/hello', createCoreRouter());
  app.use('/auth', createAuthRouter());

  // Set up Apollo server
  // @ts-ignore - Silence this error https://stackoverflow.com/questions/66858790
  await apolloServer.start();
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

  await redisConnect();

  return app;
};
