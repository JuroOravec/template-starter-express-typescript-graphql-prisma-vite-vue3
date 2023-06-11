import { init } from '@paralleldrive/cuid2';

/**
 * Generate unique ID with specified length. ID contains only [a-z0-9].
 *
 * Creates uuids of 16 characters by default.
 *
 * Uses cuid2 to generate random strings for security,
 * see https://github.com/paralleldrive/cuid2.
 */
export const uuid = (size = 16) => {
  const createId = init({ length: size });
  return createId();
};
