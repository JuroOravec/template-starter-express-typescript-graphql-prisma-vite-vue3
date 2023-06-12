import type { Transporter } from 'nodemailer';

import { config } from '@/globals/config';
import type { AnyRedisClient } from '@/datasources/redis/types';
import { OnSendEmail, createEmailMfaStrategy } from '@/lib/mfa/strategies/email';
import { createRedisStorageWithKeyExpiry, createRedisStorage } from '@/lib/mfa/storage';
import { MfaClient, MfaOnVerifySucceeded, createMfaClient } from '@/lib/mfa/mfaClient';
import { sendMfaDefaultVerifyEmail } from '../../mail/mails/mfaDefaultVerify';
import type {
  BaseEmailMfaArgs,
  ExtractMfaFlowArgs,
  ExtractMfaFlowData,
  MfaFlow,
  MfaType,
} from '../types';
import { exampleMfaFlow } from '../flows/exampleFlow';
import { mfaPathScope, mfaVerifyPath } from '../constants';

/**
 * All strategies available on our `MfaClient` instance.
 *
 * To support multiple input types for the same strategy, use union.
 * Example:
 * ```ts
 * export interface MfaStrategies {
 *   email: ScraperVoteEmailMfaArgs | { type: 'otherType'; email: string; customArg: 22 }
 * }
 * ```
 *
 * Inside `onSendEmail` you can then distinguish between different "types" like so
 * ```ts
 * if (args.type === 'exampleFlow') {
 *   ...
 * }
 * ```
 */
export interface MfaStrategies {
  email: ExtractMfaFlowArgs<typeof exampleMfaFlow>;
}

/**
 * All data types available on our `MfaClient` instance.
 *
 * To support multiple input types for the same strategy, use union.
 */
export type MfaData = ExtractMfaFlowData<typeof exampleMfaFlow>;

/** Our instance of `MfaClient` */
export type Mfa = MfaClient<MfaStrategies, MfaData>;

/** The source of truth on what MFA flows are available */
const mfaFlowHandlers = {
  exampleFlow: exampleMfaFlow,
} satisfies Record<MfaType, MfaFlow<MfaData, any>>;

/** Create the instance of MfaClient specific to our app */
export const createMfa = (input: { redisClient: AnyRedisClient; transporter: Transporter }) => {
  const { redisClient, transporter } = input;

  // MFA strategy that sends email to the recipient. The email contains
  // a link that, once clicked, verifies the action.
  const mfaEmailStrategy = createEmailMfaStrategy<BaseEmailMfaArgs>({
    storage: createRedisStorage({ client: redisClient, keyPrefix: 'mfa-strategy-email:' }),
    transporter,
    verificationUrl: `${config.baseUrl}${mfaPathScope}${mfaVerifyPath}`,
    onSendEmail: onSendEmailHandlers,
  });

  const mfa = createMfaClient<MfaStrategies, MfaData>({
    strategies: { email: mfaEmailStrategy },
    storage: createRedisStorageWithKeyExpiry({ client: redisClient, keyPrefix: 'mfa-client:' }),
    onVerifySucceeded: onVerifySucceededHandlers,
    // NOTE: On failed attemp, we don't have access to any contextual info
    // so we can't determine if we should handle the failure in any special way.
    // HENCE, the failure is handled the same for all workflows.
    onVerifyFailed: ({ res, next }) => {
      try {
        const urlObj = new URL(config.frontendUrl);
        urlObj.searchParams.set('mfa-fail', '1');
        res.redirect(urlObj.href);
      } catch (err) {
        next(err);
      }
    },
  });

  return mfa;
};

/** Handle the creation of different emails based on the args type */
const onSendEmailHandlers: OnSendEmail<BaseEmailMfaArgs> = (input) => {
  // We want to reuse this instance of email strategy, as it manages prompt keys in Redis.
  // However, each email-based MFA flow may want to send out different email.
  //
  // Hence, to support more email-based MFA challenges, we pick the handler by the payload type.
  const flowHandler = mfaFlowHandlers[input.args.type];
  if (flowHandler) {
    return flowHandler.onSendEmail(input as any);
  }
  return sendMfaDefaultVerifyEmail(input);
};

/** Success handlers for individual data types */
const onVerifySucceededHandlers: MfaOnVerifySucceeded<MfaData> = (input) => {
  // prettier-ignore
  if (!input.req) throw Error('MfaCLient.onVerifySucceeded callback triggered outside of Express request handler context');

  // We want to reuse the MfaClient instance, as it manages payload keys in storage (Redis).
  // However, each MFA flow may want to do different downstream logic after
  // successful MFA chellenge.
  //
  // Hence, to support more MFA flows, we pick the handler by the payload type.
  const flowHandler = mfaFlowHandlers[input.data!.type];
  if (flowHandler) {
    return flowHandler.onVerifySucceeded(input);
  }
};
