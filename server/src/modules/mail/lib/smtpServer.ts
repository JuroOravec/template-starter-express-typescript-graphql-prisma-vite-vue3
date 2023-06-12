import { logger } from '@/globals/logger';
import type { AnyRedisClient } from '@/datasources/redis/types';
import { createManagedSmtpServer } from '@/lib/stmpServer';
import type { MailerClient } from './mailer';

export const createSmtpServer = ({
  redisClient,
  mailer,
}: {
  redisClient: AnyRedisClient;
  mailer: MailerClient;
}) => {
  const server = createManagedSmtpServer({
    redisClient,
    onMail: (mail) => {
      return mailer.forwardMail(mail).then(async () => {
        logger.info('Email forwarded');
      });
    },
  });

  return server;
};
