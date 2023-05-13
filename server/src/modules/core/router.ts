import { Router } from 'express';

import { helloHandler } from './handlers';

export const createCoreRouter = () => {
  const coreRouter = Router({ mergeParams: true });

  coreRouter.route('/hello').get(helloHandler);

  return coreRouter;
};
