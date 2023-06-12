import { Nil } from '@/utils/types';
import type { AnyRedisClient } from '../types';
import { logger } from '@/globals/logger';

const createEmailMessageIdKey = (msgId: string) => `emailReceived:msgId:${msgId}`;

export const storeEmailMessageId = (redis: AnyRedisClient, msgId: string | Nil) => {
  if (!msgId) {
    logger.warn('storeEmailMessageId called with no message ID.');
    return;
  }

  const key = createEmailMessageIdKey(msgId);
  return redis.set(key, 1, {
    EX: 60 * 60 * 24 * 30, // Expire after month
  });
};

export const hasEmailMessageId = async (redis: AnyRedisClient, msgId: string | Nil) => {
  if (!msgId) {
    logger.warn('hasEmailMessageId called with no message ID.');
    return false;
  }

  const key = createEmailMessageIdKey(msgId);
  const isInCache = await redis.get(key);
  return !!isInCache;
};
