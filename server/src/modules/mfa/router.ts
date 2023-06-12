import { Router } from 'express';

import type { MfaClient } from '../../lib/mfa/mfaClient';
import { createMfaHandler } from '../../lib/mfa/handlers';
import { mfaVerifyPath } from './constants';

export const createMfaRouter = <TStrats extends object = object, TData = any>(input: {
  mfa: MfaClient<TStrats, TData>;
}) => {
  const router = Router({ mergeParams: true });

  // NOTE: This path should be called by MfaClient strategies with response tokens.
  router.route(mfaVerifyPath).get(createMfaHandler<TStrats, TData>(input));

  return router;
};
