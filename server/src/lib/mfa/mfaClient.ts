import type { NextFunction, Request, Response } from 'express';

import type { MaybePromise } from '@/utils/types';
import { uuid } from '@/utils/uuid';
import { logger as parentLogger } from '@/globals/logger';
import type { StorageWithExpiry } from './storage';

type KeyOf<T extends object> = Extract<keyof T, string>;

export interface HandlerContext {
  req: Request<any>;
  res: Response<any, any>;
  next: NextFunction;
}

export type MfaOnVerifySucceeded<TData = any> = (
  input: { promptId: string; data: TData | null } & HandlerContext,
) => MaybePromise<void>;
export type MfaOnVerifyFailed = MfaOnVerifySucceeded<null>;

export type MfaClient<TStrats extends object = object, TData = any> = ReturnType<
  typeof createMfaClient<TStrats, TData>
>;

export interface MfaInput<TStrats extends object = object, TData = any> {
  storage: StorageWithExpiry<TData>;
  strategies?: Partial<{
    [Key in KeyOf<TStrats>]: MfaStrategy<TStrats[Key]>;
  }>;
  promptExpiryInSec?: number;
  /** Called when a user successfully responded to a (non-expired) challenge. */
  onVerifySucceeded?: MfaOnVerifySucceeded<TData>;
  /** Called when a user responded incorrectly to a challenge. (e.g. either expired, or wrong token, ...) */
  onVerifyFailed?: MfaOnVerifyFailed;
  onChallengeExpired?: (input: { promptId: string; data: TData | null }) => MaybePromise<void>;
}

export interface MfaPrompt<
  TStrats extends object = object,
  TKey extends KeyOf<TStrats> = KeyOf<TStrats>,
  TData = any,
> {
  /** Specific strategy for creating and verifying MFA challenge */
  strategy: TKey;
  /** Strategy-specific input passed to said stretegy */
  args: TStrats[TKey];
  /**
   * JSON serializable data stored with the challenge.
   *
   * This data will be passed to success / failure callbacks. Use it to
   * identify what kind of action was being confirmed and for what resource.
   */
  data: TData;
}

export interface MfaResponse<TStrats extends object = object> {
  /** Specific strategy for creating and verifying MFA challenge */
  strategy: KeyOf<TStrats>;
  promptId: string;
  response: string;
}

export interface VerifyResult<TData = any> {
  success: boolean;
  data: TData | null;
}

type VerifyResponseInput<TStrats extends object = object> = MfaResponse<TStrats> & HandlerContext;

/**
 * Strategy is the connector to (possibly external) services that deliver
 * the challenges to users.
 *
 * Examples:
 * - Email strategy - sends MFA challenge via email
 * - Notification strategy - sends MFA challenge via notification
 */
export interface MfaStrategy<TArgs = any> {
  createChallenge: (input: { promptId: string; args: TArgs; expireInSec?: number; }) => MaybePromise<void>; // prettier-ignore
  verifyResponse: (input: { promptId: string; response: string }) => MaybePromise<boolean>;
}

/**
 * Handles multi-factor authentication (MFA) challenges and verification.
 *
 * Specific MFA strategies (e.g. email, notification, authenticator app, ...)
 * can be set via `MfaClient.addStrategy`.
 *
 * Added strategies can be removed again with `MfaClient.removeStrategy`.
 *
 * Calls `onVerifySucceeded` on successful processing of MFA challenge.
 *
 * Conversely, calls `onChallengeExpired` when challenge expires without
 * a valid response.
 *
 * Prompt time to live is set via `promptExpiryInSec`.
 *
 * NOTE: There's two levels of caching going on here
 *
 * 1. The obvious one is the secret / token that user
 *    has to receive and then send us back to confirm
 *    the MFA process. We refer to these as `promptToken`.
 *
 * 2. However, we want to allow to pass data through the MFA
 *    process. Meaning that if someone calls `MfaClient.createChallenge`
 *    with some `data`, then this `data` should be passed
 *    to the onSuccess / onFailure callbacks.
 *
 *    However, the callbacks may be triggered hours to days from
 *    the creation of the MFA prompt, and it may be called in
 *    a different context altogether (e.g. a different server instance).
 *
 *    Hence, we serialize and store the pass-through data in storage.
 *    We refer to these as `promptData`.
 */
export const createMfaClient = <
  /** Define allowed strategy names and their challenge creation args */
  TStrats extends object = object,
  /** Data passed through to success/failure callbacks */
  TData = any,
>(
  clientInput: MfaInput<TStrats, TData>,
) => {
  const promptExpiryInSec = clientInput.promptExpiryInSec ?? 60 * 60; /* 1 hr */
  const strategies = new Map<KeyOf<TStrats>, MfaStrategy>();
  const logger = parentLogger.child({}, { msgPrefix: '[mfa]' });

  const addStrategy = (name: KeyOf<TStrats>, strat: MfaStrategy) => {
    strategies.set(name, strat);
    return () => removeStrategy(name);
  };

  const removeStrategy = (name: KeyOf<TStrats>) => {
    strategies.delete(name);
  };

  /**
   * Using a specified strategy, trigger the action of prompting
   * user to verify themselves.
   */
  const createChallenge = async <TKey extends KeyOf<TStrats>>(
    prompt: MfaPrompt<TStrats, TKey, TData>,
  ) => {
    const { strategy, data, args } = prompt;
    const strat = validateStrategy(strategy);

    // Store associated data for the prompt
    const promptId = uuid(16);
    logger.debug('Setting prompt and its data to storage');
    await clientInput.storage.set(promptId, data, { expireInSec: promptExpiryInSec });
    logger.debug('Done setting prompt and its data to storage');

    logger.info(`Creating challenge with strategy "${strategy}"`);
    await strat.createChallenge({ promptId, args, expireInSec: promptExpiryInSec });
    logger.debug(`Done creating challenge with strategy "${strategy}"`);
  };

  /**
   * Assuming the user has been previously prompted for verification,
   * this method verifies validity of received "response" token.
   *
   * Throws on failure.
   */
  // prettier-ignore
  const verifyResponse = async (input: VerifyResponseInput<TStrats>): Promise<VerifyResult<TData>> => {
    const { promptId, response, strategy, req, res, next } = input;

    const strat = validateStrategy(strategy);

    logger.debug({ strategy }, `Verifying response for strategy "${strategy}"`);
    const success = await strat.verifyResponse({ promptId, response });
    logger.info({ success, strategy }, `Done verifying response for strategy "${strategy}" - success: ${success}`); // prettier-ignore

    if (!success) {
      logger.debug('Calling onVerifyFailed');
      await clientInput.onVerifyFailed?.({ promptId, data: null, req, res, next });
      logger.debug('Done calling onVerifyFailed');

      return { success, data: null };
    }

    // Call success callback with promptId and data
    logger.debug('Getting prompt and its data from storage');
    const data = await clientInput.storage.pop(promptId);
    logger.debug('Done getting prompt and its data to storage');

    logger.debug('Calling onVerifySucceeded');
    await clientInput.onVerifySucceeded?.({ promptId, data, req, res, next });
    logger.debug('Done calling onVerifySucceeded');

    return { success, data };
  };

  const validateStrategy = (strategy: KeyOf<TStrats>) => {
    const strat = strategies.get(strategy);

    if (!strategy) throw Error('No MFA strategy given');
    if (!strat) throw Error(`MFA strategy "${strategy}" does not exist`);

    return strat;
  };

  // Listen on challenge expiry events
  clientInput.storage.onExpired(async (promptId) => {
    // Call failure callback with promptId and data
    logger.debug('Getting prompt and its data from storage');
    const data = await clientInput.storage.pop(promptId);
    logger.debug('Done getting prompt and its data to storage');

    logger.debug('Calling onChallengeExpired');
    await clientInput.onChallengeExpired?.({ promptId, data });
    logger.debug('Done calling onChallengeExpired');
  });

  // Load passed-in strategies
  Object.entries(clientInput.strategies || {}).forEach(([key, strat]) =>
    strategies.set(key as KeyOf<TStrats>, strat as MfaStrategy),
  );

  return {
    addStrategy,
    removeStrategy,
    createChallenge,
    verifyResponse,
  };
};
