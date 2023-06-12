import createHttpError from 'http-errors';

import type { AppContext } from '@/globals/context';
import { logger } from '@/globals/logger';
import { config } from '@/globals/config';
import type { MfaOnVerifySucceeded } from '@/lib/mfa/mfaClient';
import type { OnSendEmail } from '@/lib/mfa/strategies/email';
import { sendConfirmationEmail } from '@/modules/mail/mails/formDefaultConfirm';
import { sendMfaDefaultVerifyEmail } from '@/modules/mail/mails/mfaDefaultVerify';
import type { Mfa } from '../lib/mfa';
import type { MfaFlow } from '../types';
import { createChallengePrompt, createMfaRedirectUrl } from '../utils';

/**
 * `args` input of `mfa.createChallenge({ args })`
 *
 * This data is available when sending an email.
 */
export interface ExampleFlowEmailMfaArgs {
  type: 'exampleFlow';
  email: string;
  customerName: string;
}

/**
 * `data` input of `mfa.createChallenge({ data })`
 *
 * This data is available in callback after successful/expired MFA check,
 * used e.g. for sending confirmation email.
 */
export interface ExampleFlowEmailMfaData {
  type: 'exampleFlow';
  customerEmail: string;
  customerName: string;
}

const onInitFlow = async (
  mfa: Mfa,
  input: {
    context: AppContext;
  },
) => {
  const { context } = input;
  const email = 'example@example.com';
  const customerName = 'Mrs Example';

  logger.debug('Triggering an MFA flow for example flow');

  // 4. Send verification email to purchaser of the vote
  mfa.createChallenge(
    createChallengePrompt({
      type: 'exampleFlow',
      strategy: 'email',
      args: {
        email,
        customerName,
      },
      data: {
        customerEmail: email,
        customerName,
      },
    }),
  );
};

const onSendEmail: OnSendEmail<ExampleFlowEmailMfaArgs> = (input) => {
  return sendMfaDefaultVerifyEmail(input);
};

/**
 * Handler that finishes the scraper vote redeem flow.
 * This will:
 *   - Create ScraperVoteTransaction instance
 *   - Send email on successful vote redemption
 */
const onVerifySucceeded: MfaOnVerifySucceeded<
  ExampleFlowEmailMfaData // prettier-ignore
> = async ({ data, req, res, next }) => {
  try {
    if (!data) throw createHttpError(400, 'Data associated with this verification is missing');

    const { mailer } = req.context;
    const { customerEmail, customerName } = data; // prettier-ignore

    // TODO
    // 1. Verify that relevant resources still exist
    // 2. Update DB entries after successful verification

    // 3. Send email on successful vote redemption
    await sendConfirmationEmail(mailer.transporter, {
      toEmail: customerEmail,
      toFirstName: customerName,
      input: {},
    });

    // 4. Redirect user to website where we'll show them confirmation message
    const redirectUrl = createMfaRedirectUrl(config.frontendUrl, data);

    logger.info(`Redirecting to ${redirectUrl}`);
    res.redirect(redirectUrl);
  } catch (err) {
    next?.(err);
  }
};

export const exampleMfaFlow: MfaFlow<ExampleFlowEmailMfaData, ExampleFlowEmailMfaArgs> = {
  onInitFlow,
  onSendEmail,
  onVerifySucceeded,
};
