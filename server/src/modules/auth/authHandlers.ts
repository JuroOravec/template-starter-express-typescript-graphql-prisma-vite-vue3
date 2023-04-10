import { Handler } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Joi from 'joi';
import { omit } from 'lodash';
import createError from 'http-errors';

import {
  createUser,
  getUserByEmail,
} from '@/datasources/serverDb/endpointsUser';
import { logger } from '@/modules/core/utils/logger';
import { verifyPassword } from './utils/encryptPassword';

passport.serializeUser((user: Express.User, done): void => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

const loginSchema = Joi.object().keys({
  username: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string().min(8).required().strip(),
});

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (username, password, done): Promise<any> => {
      const { error } = loginSchema.validate({ username, password });

      if (error) {
        return done(createError(400, error));
      }

      try {
        const user = await getUserByEmail(username);
        if (!user) {
          return done(null, false);
        }

        const match = await verifyPassword(user, password);
        if (!match) {
          return done(null, false);
        }

        return done(null, omit(user, 'password'));
      } catch (err) {
        return done(err);
      }
    },
  ),
);

export const loginHandler: Handler = (req, res, next): void => {
  const authCallback = (err: any, user: any): any => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(createError(401, 'Invalid credentials'));
    }

    req.logIn(user, (err): any => {
      if (err) {
        return next(err);
      }

      return res.json({
        data: user,
      });
    });
  };

  passport.authenticate('local', authCallback)(req, res, next);
};

const singupValidationSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().min(1).required(),
    password: Joi.string().min(5).required(),
  })
    .required()
    .unknown(),
})
  .required()
  .unknown();

export const singupHandler: Handler = async (req, res, next) => {
  const { error } = singupValidationSchema.validate(req);

  if (error) {
    return next(createError(400, error.message));
  }

  const { email, password } = req.body;

  const user = await getUserByEmail(email);

  if (user) {
    return next(createError(400, 'User with given email already exists!'));
  }

  await createUser({
    email,
    plaintextPassword: password,
  });

  return next();
};

export const logoutHandler: Handler = (req, res, next) => {
  req.logout();
  res.status(200).json({
    data: null,
  });
};

/**
 * Checks if there is a valid user session.
 */
export const authHandler: Handler = (req, _res, next): void => {
  if (req.user) {
    next();
  } else {
    next(createError(401, 'Not authenticated'));
  }
};
