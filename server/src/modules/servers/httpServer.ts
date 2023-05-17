import express, { Express } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import compression from 'compression';
import passport from 'passport';

import { bodyParserHandler } from '../core/handlers';
import { corsHandler, csrfHandler, helmetHandler } from '../security/handlers';
import { createSessionHandler } from '../session/handlers';
import {
  errorHandler,
  notFoundHandler,
  createValidateRequestHandler,
} from '../core/handlers';
import { apolloServer } from '../../apis/graphql/apolloServer';
import { createRedisClient } from '../../datasources/redis/redisClient';
import { createAuthRouter } from '../auth/router';
import { authHandler } from '../auth/handlers';
import { createCoreRouter } from '../core/router';
import { config } from '../core/lib/config';
import { logger } from '../core/lib/logger';

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
  // app.use('/graphql', authHandler); // TODO: Disable for dev?
  app.get('/hello', createCoreRouter());
  app.use('/auth', createAuthRouter());
  app.post('/ingest/email', (req, res, next) => {
    logger.info('EMAIL IN "/ingest/email"');
    logger.info(req.body);
  });

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
