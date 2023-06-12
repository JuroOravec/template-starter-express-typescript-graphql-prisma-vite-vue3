import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { ParsedMail } from 'mailparser';

import { config } from '@/globals/config';
import { logger } from '@/globals/logger';

export type MailerClient = {
  transporter: Transporter;
  forwardMail: (parsedMail: ParsedMail) => Promise<any>;
};

const getRecipients = (parsedMail: ParsedMail) => {
  let recipients = parsedMail.to
    ? !Array.isArray(parsedMail.to)
      ? [parsedMail.to]
      : parsedMail.to
    : [];

  if (!recipients.length) {
    recipients = parsedMail.cc
      ? !Array.isArray(parsedMail.cc)
        ? [parsedMail.cc]
        : parsedMail.cc
      : [];
  }

  return recipients;
};

// Troubleshooting:
// - Missing credentials for "PLAIN" - https://stackoverflow.com/questions/51973751
export const createMailer = () => {
  // See https://www.twilio.com/blog/send-smtp-emails-node-js-sendgrid
  const transporter = nodemailer.createTransport({
    host: config.mailRelayHost,
    port: config.mailRelayPort,
    auth: {
      user: config.mailRelayUser,
      pass: config.mailRelayPassword,
    },
  });

  // Verify connection configuration
  transporter
    .verify()
    .then(() => logger.info('Mail transporter is ready to take messages'))
    .catch((error) => logger.error(error));

  /** Forward email with sender info pre-configured. */
  const forwardMail = (parsedMail: ParsedMail) => {
    const adminEmail = {
      name: 'Admin',
      address: config.mailServerSystemEmail,
    };

    const recipients = getRecipients(parsedMail);
    const subject = `Email forwarded from ${JSON.stringify(recipients.map(r => r.value[0].address))} (sent from ${JSON.stringify(parsedMail.from?.value[0].address)})`; // prettier-ignore

    return transporter.sendMail({
      from: adminEmail,
      replyTo: adminEmail,
      to: [config.mailForwardEmail],
      subject,
      text: JSON.stringify(parsedMail, null, 2),
      disableUrlAccess: true,
      disableFileAccess: true,
      // html: '<b>Hello world?</b>', // html body
      // watchHtml: '<b>Hello world?</b>' // Apple Watch specific HTML
      // amp: '<b>Hello world?</b>' // AMP4EMAIL specific HTML
      // icalEvent: '<b>Hello world?</b>' // icalEvent event alternative to text or html
      // attachments: [],
    });
  };

  return { transporter, forwardMail } satisfies MailerClient;
};
