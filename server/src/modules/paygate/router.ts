import { Router } from 'express';

import { paddleWebhookHandler } from './handlers';

export const createPaygateRouter = () => {
  const router = Router({ mergeParams: true });

  // NOTE: This path is set used by each our product on Paddle
  //       Currently it can be changed only from UI and one by one
  router.route('/webhook/paddle').post(paddleWebhookHandler);

  return router;
};
