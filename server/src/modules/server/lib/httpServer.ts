import bodyParser from 'body-parser';
import express, { Express } from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import compression from 'compression';
import passport from 'passport';
import type { RedisClientType } from 'redis';
import * as Sentry from '@sentry/node';

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
import { config } from '@/modules/core/lib/config';

export const createExpressServer = async ({
  redisClient,
}: {
  redisClient: RedisClientType<any, any, any>;
}): Promise<Express> => {
  if (config.sentryDns) {
    Sentry.init({ dsn: config.sentryDns });
  }

  const app = express();

  // Get real ip from nginx proxy
  app.set('trust proxy', true);

  // Middlewares
  app.use(
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    corsHandler,
    compression(),
    helmetHandler,
    createSessionHandler(redisClient),
    // app.use(createValidateRequestHandler()); // TODO: Enable this?
    // csrfHandler, // TODO - enable for client-facing API - see https://owasp.org/www-community/attacks/csrf
    passport.initialize(),
    passport.session(),
  );

  // See https://docs.sentry.io/platforms/node/guides/express/
  // RequestHandler creates a separate execution context, so that all
  // transactions/spans/breadcrumbs are isolated across requests
  app.use(Sentry.Handlers.requestHandler());

  // Routes
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
    authHandler, // TODO: Disable for dev?
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        // TODO ?
        return {
          user: req,
        };
      },
    }),
  );

  app.use(
    notFoundHandler,
    // Sentry error handler must be before any other error middleware and after all controllers
    Sentry.Handlers.errorHandler(),
    errorHandler,
  );

  return app;
};
