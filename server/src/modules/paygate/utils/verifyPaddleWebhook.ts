// Taken from https://github.com/daveagill/verify-paddle-webhook/blob/9f7d9d3cf8afe6ba28724496f26ecad165992202/index.js
// See https://developer.paddle.com/webhook-reference/ZG9jOjI1MzUzOTg2-verifying-webhooks
import crypto from 'crypto';
import { serialize } from 'php-serialize';

import type { PaddleWebhookPayload } from '../types/paddle';

/**
 * Verify a Paddle webhook payload to confirm it was sent by Paddle.
 *
 * @param {string} publicKey
 * A Paddle public-key
 * @param {Object.<string, string>} webhookData
 * The webhook payload parameters formatted as a JS object
 * @returns {boolean}
 * Returns true when the webhookData is valid for the public key,
 * otherwise returns false.
 */
export const verifyPaddleWebhook = <T extends PaddleWebhookPayload>(
  publicKey: string,
  webhookData: T,
) => {
  // extract the signatue from the remainder of the payload
  // the signature actually signs the remainder
  const { p_signature: signature, ...otherProps } = webhookData;

  // sort by key (asciibetical)
  // also be sure to convert any numbers into strings
  const sorted = {} as any;
  for (const k of Object.keys(otherProps).sort()) {
    const key = k as keyof typeof otherProps;
    const v = otherProps[key];
    sorted[key] = v?.toString() ?? null;
  }

  // PHP-style serialization to utf8 format string
  const serialized = serialize(sorted);

  // initialise a Verify instance
  const verifier = crypto.createVerify('sha1');
  verifier.update(serialized);
  verifier.end();

  // verify but don't propagate exceptions,. Any errors (such as a malformed
  // public key) are considered false for our purposes. We are not interested
  // in reporting 'why' the validation failed.
  try {
    return verifier.verify(publicKey, signature, 'base64');
  } catch (err) {
    return false;
  }
};
