import type { MaybePromise } from '@/utils/types';
import type { MfaClient, MfaOnVerifySucceeded } from '../../lib/mfa/mfaClient';
import type { OnSendEmail } from '../../lib/mfa/strategies/email';

/**
 * NOTE: To be able to discern between different "kinds"s of invocations
 * inside `onSendEmail`, the `Args` input needs to use different `type` value:
 *
 * Example:
 * ```ts
 * type MfaType = 'exampleFlow' | 'bzz';
 * ```
 */
export type MfaType = 'exampleFlow';

/** A collection of callbacks that together describe a single MFA flow */
export interface MfaFlow<TData = any, TArgs extends BaseEmailMfaArgs = BaseEmailMfaArgs> {
  onInitFlow: (mfa: MfaClient<any>, ...args: any[]) => MaybePromise<any>;
  onSendEmail: OnSendEmail<TArgs>;
  onVerifySucceeded: MfaOnVerifySucceeded<TData>;
}

export type ExtractMfaFlowData<T extends MfaFlow<any, any>> = T extends MfaFlow<infer U, any> ? U : never; // prettier-ignore
export type ExtractMfaFlowArgs<T extends MfaFlow<any, any>> = T extends MfaFlow<any, infer U> ? U : never; // prettier-ignore

/** Minimum type that must be passed to `args` input of `mfa.createChallenge({ args })` */
export interface BaseEmailMfaArgs {
  email: string;
  type: MfaType;
}
