import nodemailer from 'nodemailer';
import type { ParsedMail } from 'mailparser';

import { config } from '@/modules/core/lib/config';
import { logger } from '@/modules/core/lib/logger';

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
    // dkim?
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
      address: config.mailServerEmail,
    };

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

    return transporter.sendMail({
      from: adminEmail,
      replyTo: adminEmail,
      to: [config.mailForwardEmail],
      subject: `Email forwarded from ${JSON.stringify(recipients.map(r => r.value[0].address))} (sent from ${JSON.stringify(parsedMail.from?.value[0].address)})`, // prettier-ignore
      text: JSON.stringify(parsedMail, null, 2),
      disableUrlAccess: true,
      disableFileAccess: true,
      // subject: 'Hello ✔', // Subject line
      // text: 'Hello world?', // plain text body
      // html: '<b>Hello world?</b>', // html body
      // watchHtml: '<b>Hello world?</b>' // Apple Watch specific HTML
      // amp: '<b>Hello world?</b>' // AMP4EMAIL specific HTML
      // icalEvent: '<b>Hello world?</b>' // icalEvent event alternative to text or html
      // attachments: [],
    });
  };

  return { mailer: transporter, forwardMail };
};
