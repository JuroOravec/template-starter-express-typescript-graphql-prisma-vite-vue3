import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import type { RedisClientType } from 'redis';

import { logger } from '../../core/lib/logger';
import { createMailer } from '../../mail/lib/mailer';

// See https://nodemailer.com/extras/smtp-server/
// See https://simonjcarr.medium.com/create-an-smtp-server-with-nodejs-5688d8fd882e
export const createSmtpServer = ({
  redisClient,
}: {
  redisClient: RedisClientType<any, any, any>;
}): SMTPServer => {
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
      logger.info(loggerData, 'Email received - done parsing. Forwarding next.'); // prettier-ignore

      const cacheKey = `emailReceived:msgId:${parsed.messageId}`;
      const isInCache = await redisClient.get(cacheKey);
      if (isInCache) {
        logger.info(loggerData, 'Email not forwarded - already sent.');
        return callback();
      }

      await mailer
        .forwardMail(parsed)
        .then(async () => {
          logger.info(loggerData, 'Email forwarded');
          await redisClient.set(cacheKey, 1, {
            EX: 60 * 60 * 24 * 30, // Expire after month
          });
        })
        .catch(logger.error);

      // NOTE: We don't need to call `stream.on('end', callback);`, unlike shown in docs, since we use mailparser.
      //   Nodemailer's docs suggest calling `callback` of `onData` as `stream.on('end', callback)`.
      //   (See https://nodemailer.com/extras/smtp-server/#processing-incoming-message)
      //   However, looking at implementation of `mailparser.simpleParse`,
      //   it also triggers/waits for `.on('end')`, so we don't need to wait for stream end too.
      //   https://github.com/nodemailer/mailparser/blob/ac11f78429cf13da42162e996a05b875030ae1c1/lib/simple-parser.js#L88
      callback();
    },
    disabledCommands: ['AUTH'], // TODO - remove?
  });

  server.on('error', (err) => {
    logger.error('Error %s', err.message);
  });

  return server;
};
