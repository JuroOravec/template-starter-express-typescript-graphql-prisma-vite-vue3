import { logger } from '@/globals/logger';
import { isEmailBlocked } from '../constants/blocklist';
import type { MailerClient } from './mailer';
import type { AnyRedisClient } from '@/datasources/redis/types';
import { createManagedSmtpServer } from '@/lib/stmpServer';

export const createSmtpServer = ({
  redisClient,
  mailer,
}: {
  redisClient: AnyRedisClient;
  mailer: MailerClient;
}) => {
  const server = createManagedSmtpServer({
    redisClient,
    onMail: async (mail) => {
      const senderAddress = mail.from?.value[0]?.address;
      const isSenderIgnored = !senderAddress || (await isEmailBlocked(senderAddress));
      if (isSenderIgnored) return;

      // Forward received emails
      return mailer.forwardMail(mail).then(async () => {
        logger.info('Email forwarded');
      });
    },
  });

  return server;
};
