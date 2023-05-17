import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';

import { logger } from '../core/lib/logger';
import { createMailer } from '../mail/lib/mailer';

// See https://nodemailer.com/extras/smtp-server/
// See https://simonjcarr.medium.com/create-an-smtp-server-with-nodejs-5688d8fd882e
export const createSmtpServer = (): SMTPServer => {
  const mailer = createMailer();

  const server = new SMTPServer({
    onData: async (stream, session, callback) => {
      logger.info('Email received - parsing');
      // https://nodemailer.com/extras/mailparser/
      const parsed = await simpleParser(stream, {});
      const loggerData = {
        messageId: parsed.messageId,
        from: parsed.from,
        subject: parsed.subject,
      };
      logger.info(
        loggerData,
        'Email received - done parsing. Forwarding next.',
      );
      await mailer
        .forwardMail(parsed)
        .then(() => logger.info(loggerData, 'Email forwarded'))
        .catch(logger.error);

      stream.on('end', callback);
    },
    disabledCommands: ['AUTH'], // TODO - remove?
  });

  server.on('error', (err) => {
    logger.error('Error %s', err.message);
  });

  return server;
};
