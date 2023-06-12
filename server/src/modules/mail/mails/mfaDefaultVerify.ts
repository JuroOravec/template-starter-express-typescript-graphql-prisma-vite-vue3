import { config } from '@/globals/config';
import type { MfaEmailStrategyArgs, OnSendEmail } from '@/lib/mfa/strategies/email';

/**
 * Default email sent out to verify an action using email MFA (multi-factor authentication).
 * By clicking on the link, they complete the challenge.
 */
export const sendMfaDefaultVerifyEmail: OnSendEmail<MfaEmailStrategyArgs> = ({
  transporter,
  verificationUrl,
  args,
}) => {
  const subject = `[Action needed]: Complete the verification process.`;

  const text = `Click below to complete the multi-factor authentication process (MFA).

${verificationUrl}

This is an automated message.`;

  return transporter.sendMail({
    from: config.mailServerSystemEmail,
    replyTo: config.mailServerSystemEmail,
    to: [args.email],
    subject,
    text,
    disableUrlAccess: true,
    disableFileAccess: true,
  });
};
