import { SMTPServer, SMTPServerOptions } from 'smtp-server';
import { ParsedMail, simpleParser } from 'mailparser';
import type { pino } from 'pino';

import { logger } from '@/globals/logger';
import { hasEmailMessageId, storeEmailMessageId } from '@/datasources/redis/endpoints/mail';
import type { AnyRedisClient } from '@/datasources/redis/types';
import type { MaybePromise } from '@/utils/types';

// See https://nodemailer.com/extras/smtp-server/
// See https://simonjcarr.medium.com/create-an-smtp-server-with-nodejs-5688d8fd882e
/** An SMTP server with nicities on top */
export const createManagedSmtpServer = (input: {
  redisClient: AnyRedisClient;
  options?: SMTPServerOptions;
  logger?: pino.Logger;
  onMail: (mail: ParsedMail, ctx: { server: SMTPServer }) => MaybePromise<void>;
  onError?: (error: Error, ctx: { server: SMTPServer }) => MaybePromise<void>;
}) => {
  const { redisClient, onMail, onError, options } = input;
  const log = input.logger ?? logger;

  const server = new SMTPServer({
    ...options,
    onData: async (stream, session, callback) => {
      log.info('Email received - parsing');

      // https://nodemailer.com/extras/mailparser/
      const parsed = await simpleParser(stream, {});

      const loggerData = {
        messageId: parsed.messageId,
        from: parsed.from,
        subject: parsed.subject,
      };
      log.info(loggerData, 'Email received - done parsing. Forwarding next.'); // prettier-ignore

      // NOTE: For some reason emails from Gmail are re-sent multiple times.
      // To avoid processing the same email multiple times, we store IDs
      // of processed emails.
      const isInCache = await hasEmailMessageId(redisClient, parsed.messageId);
      if (isInCache) {
        log.info(loggerData, 'Email not forwarded - already sent.');
        return callback();
      }

      await Promise.resolve(onMail(parsed, { server }))
        .then(async () => {
          // Remember that we've processed this particular email
          await storeEmailMessageId(redisClient, parsed.messageId);
          log.info(loggerData, 'Email processed.');
        })
        .catch((error) => log.error({ ...loggerData, error }, 'Failed to process email.'));

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
    log.error(`Error ${err.message}`);
    onError?.(err, { server });
  });

  return server;
};
