import type { Handler } from 'express';
import createHttpError from 'http-errors';

import { MfaResponseDeserializer, urlDeserializer } from './serializers';
import type { MfaClient } from './mfaClient';
import { logger } from '@/globals/logger';

/**
 * Multi-factor authentication (MFA) handler.
 *
 * We expect that the `MfaClient` strategies will instruct users/other systems
 * to call an endpoint that has this handler as part of the MFA process.
 *
 * This handler:
 * - Extracts MFA payload from incoming Requests
 * - Attempts to complete the verification process.
 *   - If verification succeeds, then `onVerifySucceeded` is triggered with appropriate data
 * - Based on the outcome of the verification, the handler redirects to
 *   either `successRedirect` or `failureRedirect`.
 */
export const createMfaHandler = <TStrats extends object = object, TData = any>(input: {
  mfa: MfaClient<TStrats, TData>;
  /**
   * Given a URL, define how the MFA payload should be extracted from the URL.
   *
   * By default, the payload is expected to be on the `t=` query parameter.
   * The payload is then `decodeURIComponent`'d, then un`base64`'d, then `JSON.parse`'d.
   */
  deserializer?: MfaResponseDeserializer<TStrats>;
}) => {
  const { mfa, deserializer = urlDeserializer } = input;

  const handler: Handler = async (req, res, next) => {
    try {
      logger.info(`Processing an MFA response`);

      // See https://stackoverflow.com/questions/10183291
      const url = new URL(req.url, `http://${req.headers.host}`).href;
      const payload = await deserializer(url);
      if (!payload) throw createHttpError(400, 'Failed to extract MFA payload from Reqest.');

      const { promptId, response, strategy } = payload;
      await mfa.verifyResponse({ promptId, response, strategy, req, res, next }); // prettier-ignore

      logger.info(`Done processing an MFA response`);
    } catch (err) {
      next(err);
    }
  };

  return handler;
};
