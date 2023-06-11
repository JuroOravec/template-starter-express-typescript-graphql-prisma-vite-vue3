import { Handler } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Joi from 'joi';
import { omit } from 'lodash';
import createHttpError from 'http-errors';

import { createUser, getUserByEmail } from '@/datasources/prisma/endpoints/user';
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
    { usernameField: 'email', passReqToCallback: true },
    async (req, username, password, done): Promise<any> => {
      const prisma = req.context.prisma;

      const { error } = loginSchema.validate({ username, password });

      if (error) {
        return done(createHttpError(400, error));
      }

      try {
        const user = await getUserByEmail(prisma, username);
        if (!user) {
          return done(null, false);
        }

        const match = await verifyPassword(user, password);
        if (!match) {
          return done(null, false);
        }

        return done(null, user); // omit(user, 'password')); // TODO: OMIT PWD ONCE USING IT
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
      return next(createHttpError(401, 'Invalid credentials'));
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
  const prisma = req.context.prisma;
  const { error } = singupValidationSchema.validate(req);

  if (error) {
    return next(createHttpError(400, error.message));
  }

  const { email, password } = req.body;

  const user = await getUserByEmail(prisma, email);

  if (user) {
    return next(createHttpError(400, 'User with given email already exists!'));
  }

  await createUser(prisma, {
    email,
    plaintextPassword: password,
  });

  return next();
};

export const logoutHandler: Handler = async (req, res, _next) => {
  await new Promise<void>((res, rej) => req.logout({}, (err) => (err ? rej(err) : res())));
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
    next(createHttpError(401, 'Not authenticated'));
  }
};
