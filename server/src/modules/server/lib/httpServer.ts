import bodyParser from 'body-parser';
import express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import compression from 'compression';
import passport from 'passport';
import * as Sentry from '@sentry/node';

import { corsHandler, csrfHandler, helmetHandler } from '../../security/handlers';
import { createSessionHandler } from '../../session/handlers';
import { errorHandler, notFoundHandler, createValidateRequestHandler } from '../handlers';
import { apolloServer } from '@/apis/graphql/apolloServer';
import { createAuthRouter } from '../../auth/router';
import { authHandler } from '../../auth/handlers';
import { createServerRouter } from '../router';
import { setupHealthcheck } from './healthcheck';
import { config } from '@/globals/config';
import { createPaygateRouter } from '@/modules/paygate/router';
import { createAppContextHandler } from '../handlers';
import type { MailerClient } from '@/modules/mail/lib/mailer';
import { PrismaClient } from '@prisma/client';
import type { AnyRedisClient } from '@/datasources/redis/types';
import { createMfaRouter } from '@/modules/mfa/router';
import { mfaPathScope } from '@/modules/mfa/constants';
import { createMfa } from '@/modules/mfa/lib/mfa';
import { paygateJobs } from '@/modules/paygate/jobs';
import { createPaddleClient } from '@/datasources/paddle/client';
import { setupJobs } from '@/utils/jobs';
import { catchHandlerError } from '../utils';

export const createExpressServer = async ({
  redisClient,
  mailer,
}: {
  redisClient: AnyRedisClient;
  mailer: MailerClient;
}) => {
  if (config.sentryDns) {
    Sentry.init({ dsn: config.sentryDns });
  }

  const app = express();
  const prisma = new PrismaClient();
  const paddle = createPaddleClient();
  const mfa = createMfa({ redisClient, transporter: mailer.transporter });

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
    createAppContextHandler({ prisma, mailer, mfa }), // TODO - will the "user" field be populated if it's before passport?
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
  app.use('/paygate', createPaygateRouter());
  app.use(mfaPathScope, createMfaRouter({ mfa }));
  setupHealthcheck(app);

  // Set up Apollo server
  await (
    // @ts-ignore Silence this error https://stackoverflow.com/questions/66858790
    apolloServer.start()
  ); // prettier-ignore

  app.use(
    '/graphql',
    catchHandlerError(
      expressMiddleware(apolloServer, {
        context: async ({ req, res }) => {
          return req.context;
        },
      }),
    ),
  );

  app.use(
    notFoundHandler,
    // Sentry error handler must be before any other error middleware and after all controllers
    Sentry.Handlers.errorHandler(),
    errorHandler,
  );

  const disposeJobs = setupJobs({
    jobs: [...paygateJobs],
    args: { prisma, paddle },
    /** By default check every 15 min for updates in products */
    intervalMs: 15 * 60 * 1000,
  });

  const dispose = async () => {
    disposeJobs();
    await apolloServer.stop();
    await prisma.$disconnect();
    await Sentry.close();
  };

  return {
    app,
    dispose,
  };
};
