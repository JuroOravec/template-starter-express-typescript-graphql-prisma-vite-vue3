import { serializeToBase64UriEncode, deserializeFromBase64UriEncode } from '@/utils/encoding';
import type { MaybePromise } from '@/utils/types';
import type { MfaResponse } from './mfaClient';

export type MfaResponseSerializer<TStrats extends object = object> = (url: string, payload: MfaResponse<TStrats>) => MaybePromise<string>; // prettier-ignore
export type MfaResponseDeserializer<TStrats extends object = object> = (url: string) => MaybePromise<MfaResponse<TStrats> | null>; // prettier-ignore

/**
 * Given a verification URL and payload, serialize the payload INTO the URL.
 *
 * The payload is first `JSON.stringify`'d, then `base64`'d, then `encodeURIComponent`'d.
 * Such serialized payload is set as the `t=` query parameter on the URL.
 *
 * Example:
 * ```ts
 * serializer('https://example.com/mfa/verify', payload)
 * // => 'https://example.com/mfa/verify?t=d7wdy67tyhr3ugrg3wyrg3u...'
 * ```
 */
export const urlSerializer: MfaResponseSerializer = (url, payload) => {
  const serializedPayload = serializeToBase64UriEncode(payload);
  const urlObj = new URL(url);
  urlObj.searchParams.set('t', serializedPayload);
  return urlObj.href;
};

/** The reverse action of {@link urlSerializer} */
export const urlDeserializer: MfaResponseDeserializer = (url: string) => {
  const urlObj = new URL(url);
  const serializedPayload = urlObj.searchParams.get('t');
  if (!serializedPayload) return null;
  return deserializeFromBase64UriEncode(serializedPayload);
};
