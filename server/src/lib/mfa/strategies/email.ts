import type { Transporter } from 'nodemailer';

import type { MfaResponse } from '../mfaClient';
import type { MaybePromise } from '@/utils/types';
import { sendMfaDefaultVerifyEmail } from '@/modules/mail/mails/mfaDefaultVerify';
import { logger as parentLogger } from '@/globals/logger';
import { MfaStrategyOptions, OnDeliverChallenge, createMfaStrategy } from './base';
import { MfaResponseSerializer, urlSerializer } from '../serializers';

/** The minimum data than needs to be passed to the strategy on `createChallenge` */
export interface MfaEmailStrategyArgs {
  email: string;
}

export type OnSendEmail<TArgs extends MfaEmailStrategyArgs = MfaEmailStrategyArgs> = (input: {
  transporter: Transporter;
  payload: MfaResponse<any>;
  verificationUrl: string;
  args: TArgs;
}) => MaybePromise<void>;

export interface EmailMfaStrategyOptions<TArgs extends MfaEmailStrategyArgs = MfaEmailStrategyArgs>
  extends Omit<MfaStrategyOptions<MfaEmailStrategyArgs>, 'onDeliverChallenge'> {
  transporter: Transporter;
  verificationUrl: string;
  /**
   * Given a verification URL and payload, serialize the payload INTO the URL.
   *
   * By default, the payload is first `JSON.stringify`'d, then `base64`'d, then `encodeURIComponent`'d.
   * Such serialized payload is set as the `t=` query parameter on the URL.
   *
   * Example:
   * ```ts
   * serializer('https://example.com/mfa/verify', payload)
   * // => 'https://example.com/mfa/verify?t=d7wdy67tyhr3ugrg3wyrg3u...'
   * ```
   */
  serializer?: MfaResponseSerializer;
  onSendEmail?: OnSendEmail<TArgs>;
}

/**
 * Email MFA strategy that uses nodemailer to send emails containing verification URL.
 *
 * The verification URL should point to an endpoint that eventually triggers `MfaClient.verifyResponse`.
 *
 * That way, when the user clicks on the verification link, they complete the MFA challenge.
 *
 * The kind of email that's sent can be overriden via `onSendEmail`.
 */
export const createEmailMfaStrategy = <TArgs extends MfaEmailStrategyArgs = MfaEmailStrategyArgs>(
  initInput: EmailMfaStrategyOptions<TArgs>,
) => {
  const {
    transporter,
    verificationUrl,
    serializer = urlSerializer,
    onSendEmail = sendMfaDefaultVerifyEmail,
    ...baseOptions
  } = initInput;

  const loggerPrefix = '[mfa-strategy-email]';
  const logger = parentLogger.child({}, { msgPrefix: loggerPrefix });

  const onDeliverChallenge: OnDeliverChallenge<TArgs> = async ({ payload, args }) => {
    logger.debug('Serializing payload');
    const url = await serializer(verificationUrl, payload);

    logger.debug('Calling onSendEmail');
    await onSendEmail({ transporter, payload, verificationUrl: url, args });
    logger.debug('Done calling onSendEmail');
  };

  const strategy = createMfaStrategy({ ...baseOptions, loggerPrefix, onDeliverChallenge });
  return strategy;
};
