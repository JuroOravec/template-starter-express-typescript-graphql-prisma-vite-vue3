import { uuid } from '@/utils/uuid';
import type { MaybePromise } from '@/utils/types';
import { logger as parentLogger } from '@/globals/logger';
import type { MfaResponse, MfaStrategy } from '../mfaClient';
import type { Storage } from '../storage';

export type OnDeliverChallenge<TArgs extends object = object> = (input: {
  payload: MfaResponse<any>;
  args: TArgs;
}) => MaybePromise<void>;

export interface MfaStrategyOptions<TArgs extends object = object> {
  storage: Storage;
  onDeliverChallenge: OnDeliverChallenge<TArgs>;
  loggerPrefix?: string;
}

/**
 * Common framework for an MfaStrategy that handles the storage of pass-through data,
 * and verification process.
 *
 * The way the MFA challenge is delivered to user is configurable via `onDeliverChallenge`.
 */
export const createMfaStrategy = <TArgs extends object = object>(
  initInput: MfaStrategyOptions<TArgs>,
) => {
  const { storage, onDeliverChallenge, loggerPrefix } = initInput;

  const logger = parentLogger.child({}, { msgPrefix: loggerPrefix ?? '[mfa-strategy]' });

  const createChallenge = async (input: {
    promptId: string;
    args: TArgs;
    expireInSec?: number;
  }) => {
    const { promptId, args, expireInSec } = input;

    // The token we want the user doing MFA to return
    const response = uuid(64);

    // NOTE: We await because we want to send the email only once
    // the token DEFINITELY IS in the DB.
    logger.debug('Setting prompt response to storage');
    await storage.set(promptId, response, { expireInSec });
    logger.debug('Done setting prompt response to storage');

    // URL that, upon GET request, confirms the MFA challenge
    const payload = {
      promptId,
      response,
      strategy: 'email',
    } satisfies MfaResponse<any>;

    logger.debug('Calling onDeliverChallenge');
    await onDeliverChallenge({ payload, args });
    logger.debug('Done calling onDeliverChallenge');
  };

  const verifyResponse = async (input: { promptId: string; response: string }) => {
    const { promptId, response } = input;

    logger.debug('Getting prompt response from storage');
    const token = await storage.pop(promptId);
    logger.debug('Done getting prompt response from storage');

    // Token is set to have expiry in the DB, that means that:
    // - If we get the token from the pop operation, then the token has not expired
    //   at the time.
    // - If we get no token, it either was already expired or there was no
    //   token for this promptId, but that's the same to us in this case.
    // NOTE: Token should NEVER be an empty string.
    if (!token) return false;

    return response === token;
  };

  return {
    createChallenge,
    verifyResponse,
  } satisfies MfaStrategy<TArgs>;
};
