import { serializeToBase64UriEncode } from '@/utils/encoding';
import type { MfaPrompt } from '../../lib/mfa/mfaClient';
import type { MfaStrategies } from './lib/mfa';

type KeyOf<T extends object> = Extract<keyof T, string>;

/**
 * Helper that makes sure that a "type" property is present in both
 * `args` and `data` properties of the prompt.
 *
 * This ensures that the "type" info is available to both:
 * - `createChallenge` function of individual Mfa strategy implementations
 *   - E.g. we can have the "type" info when creating an email using `mfaEmailStrategy`,
 *     which means we can customize the email based on "type".
 * - `onVerifySucceeded` and `onChallengeExpired` callbacks
 *   - E.g. This enables us to have different downstream logic on successful MFA challenge
 *     based on the "type".
 */
export const createChallengePrompt = <
  TData extends { type: string },
  TKey extends KeyOf<TStrats>,
  TStrats extends MfaStrategies,
>(
  prompt: Omit<MfaPrompt<TStrats, TKey, TData>, 'args' | 'data'> & {
    args: Omit<TStrats[TKey], 'type'>;
    data: Omit<TData, 'type'>;
    type: TData['type'];
  },
): MfaPrompt<TStrats, TKey, TData> => {
  const { args, data, type, ...otherArgs } = prompt;
  return {
    ...otherArgs,
    args: { ...args, type } as TStrats[TKey],
    data: { ...data, type } as TData,
  };
};

/**
 * Create a URL that MFA flow redirects to after (un)successful verification.
 *
 * Use this helper to encode the MFA result payload in a predictable way,
 * so we can reliably parse the data on the frontend.
 */
export const createMfaRedirectUrl = (redirectUrl: string, payload: any) => {
  const redirectUrlObj = new URL(redirectUrl);
  const redirectPayload = serializeToBase64UriEncode(payload);
  redirectUrlObj.searchParams.set('mfa', redirectPayload);
  const finalRedirectUrl = redirectUrlObj.href;
  return finalRedirectUrl;
};
