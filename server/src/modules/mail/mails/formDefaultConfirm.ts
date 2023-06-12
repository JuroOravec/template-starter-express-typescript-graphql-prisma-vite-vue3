import { startCase } from 'lodash';
import type { Transporter } from 'nodemailer';

import { config } from '@/globals/config';
import type { PartialNil } from '@/utils/types';

interface FormConfirmInput {
  toEmail: string;
  toFirstName: string;
  input: PartialNil<object>;
}

const textBodyTemplate = (input: FormConfirmInput) => {
  const formattedInputFields = Object.entries(input.input)
    .map(([key, value]) => `• ${startCase(key)}: ${value}`)
    .join('\n');

  return `Hi ${input.toFirstName} 👋

This is to confirm we've received your submission:

${formattedInputFields}

Cheers mate 🥵

Email sent out from Starter template.
`;
};

/** Example confirmation email sent when we receive a form submission */
export const sendConfirmationEmail = (transporter: Transporter, input: FormConfirmInput) => {
  const subject = `We received your form submission`.replace(/\s+/, ' ');

  return transporter.sendMail({
    from: config.mailServerPublicEmail,
    replyTo: config.mailServerPublicEmail,
    to: [input.toEmail],
    bcc: [config.mailForwardEmail],
    subject,
    text: textBodyTemplate(input),
    disableUrlAccess: true,
    disableFileAccess: true,
  });
};
