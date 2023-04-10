import { Router } from 'express';

import {
  authHandler,
  loginHandler,
  logoutHandler,
  singupHandler,
} from './authHandlers';

export const authRouter = Router();

authRouter.post('/login', loginHandler);
authRouter.post('/signup', singupHandler, loginHandler);
authRouter.post('/logout', logoutHandler);

// TODO: REMOVE
authRouter.post('/test', authHandler, (req, res, next): void => {
  res.status(200).send();
});
