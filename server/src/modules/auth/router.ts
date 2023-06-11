import { Router } from 'express';

import { authHandler, loginHandler, logoutHandler, singupHandler } from './handlers';

export const createAuthRouter = () => {
  const authRouter = Router();

  authRouter.post('/login', loginHandler);
  authRouter.post('/signup', singupHandler, loginHandler);
  authRouter.post('/logout', logoutHandler);

  // Endpoint to test authentication
  authRouter.post('/test', authHandler, (req, res, _next): void => {
    res.status(200).send();
  });

  return authRouter;
};
