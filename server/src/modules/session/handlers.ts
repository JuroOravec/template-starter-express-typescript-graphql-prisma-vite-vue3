import session from 'express-session';
import RedisStore from 'connect-redis';

import { config } from '@/globals/config';
import type { AnyRedisClient } from '@/datasources/redis/types';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export const createSessionHandler = (redisClient: AnyRedisClient) => {
  return session({
    name: 'session',
    store: new RedisStore({
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
};
