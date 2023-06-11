import type { Handler } from 'express';
import createHttpError from 'http-errors';

import { verifyPaddleWebhook } from './utils';
import type { PaddleWebhookPayload } from '../../datasources/paddle/types';
import type { PaddleEvent, PaddleEventHandler } from './types';

// https://developer.paddle.com/webhook-reference/d8bbc4ae5cefa-security#ip-allowlisting
export const PADDLE_IPS = [
  // Prod IPs
  '34.232.58.13',
  '34.195.105.136',
  '34.237.3.244',
  '35.155.119.135',
  '52.11.166.252',
  '34.212.5.7',
  // Dev IPs
  '34.194.127.46',
  '54.234.237.108',
  '3.208.120.145',
  '44.226.236.210',
  '44.241.183.62',
  '100.20.172.113',
];

export const createPaddleWebhookHandler = (input: {
  publicKey: string;
  eventHandlers: Partial<Record<PaddleEvent, PaddleEventHandler<any>>>;
  allowedIps?: string[] | true;
  skipVerification?: boolean;
}) => {
  const allowedIps = input.allowedIps ?? PADDLE_IPS;
  // Common pathway for all Pebble events before we send them to event- and product-specific
  // functions.
  const paddleWebhookHandler: Handler = async (req, res, next) => {
    try {
      const payload = req.body as PaddleWebhookPayload;
      const paddleIp = req.ips[0] || req.ip;
      const isAllowed = allowedIps === true ? true : allowedIps.includes(paddleIp);
      const isSignatureValid =
        input.skipVerification || verifyPaddleWebhook(input.publicKey, payload);

      // https://softwareengineering.stackexchange.com/questions/21339
      if (!isAllowed || !isSignatureValid) throw createHttpError(403);

      const eventType = payload?.alert_name;
      const eventHandler =
        eventType && ((input.eventHandlers as any)[eventType] as PaddleEventHandler<any>);

      if (!eventType) {
        throw createHttpError(422, `Unprocessable Entity - Event type is not set`);
      } else if (!eventHandler) {
        throw createHttpError(422, `Unprocessable Entity - Unknown event type "${eventType}"`); // prettier-ignore
      }

      // Individual event handlers should define response.
      // https://developer.paddle.com/webhook-reference/bd1986c817a40-webhook-reference#responding-to-events
      await eventHandler(req, res, payload);
    } catch (err) {
      next(err);
    }
  };

  return paddleWebhookHandler;
};
