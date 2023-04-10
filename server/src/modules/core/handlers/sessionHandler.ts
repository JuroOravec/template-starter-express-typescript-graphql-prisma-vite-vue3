import session from 'express-session';
import createRedisStore from 'connect-redis';

import { redisClient } from '@/datasources/redis/redisClient';
import { config } from '../utils/config';

const RedisStore = createRedisStore(session);

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export const sessionHandler = session({
  name: 'session',
  store: new RedisStore({
    // @ts-expect-error - Types are incompatible
    client: redisClient,
  }),
  secret: config.sessionCookieSecret,
  cookie: {
    httpOnly: true,
    maxAge: ONE_WEEK,
    sameSite: 'lax',
    // TODO: Make this env-dependent
    secure: false,
    path: '/',
  },
  resave: true,
  saveUninitialized: false,
});
