import type { Nil } from '@/utils/types';
import type { AnyRedisClient } from '../types';
import { logger } from '@/globals/logger';

////////////////////////////////////
// PROMPT TOKEN
////////////////////////////////////

const createMfaPromptTokenKey = (promptId: string) => `mfa:promptToken:${promptId}`; // prettier-ignore

export const storeMfaPromptToken = async (
  redis: AnyRedisClient,
  promptId: string | Nil,
  token: string,
  expiryInMs?: number,
) => {
  if (!promptId) {
    logger.warn('storeMfaPromptToken called with no prompt ID.');
    return;
  }

  const key = createMfaPromptTokenKey(promptId);
  await redis.set(key, token, {
    PX: expiryInMs,
  });
};

export const popMfaPromptToken = async (redis: AnyRedisClient, promptId: string | Nil) => {
  if (!promptId) {
    logger.warn('popMfaPromptToken called with no prompt ID.');
    return null;
  }

  const key = createMfaPromptTokenKey(promptId);
  const token = await redis.getDel(key);
  return token;
};
