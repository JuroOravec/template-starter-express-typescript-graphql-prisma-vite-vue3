import * as Sentry from '@sentry/vue';
import type { App } from 'vue';

import { config } from '@/../globals/config';
import type { MaybePromise } from '@/../utils/types';

export type ErrorTrackerOptions = Omit<
  Parameters<typeof Sentry.init>[0],
  'app'
>;

export interface ErrorTrackerInstance {
  init: (options?: ErrorTrackerOptions) => MaybePromise<void>;
  captureEvent: typeof Sentry.captureEvent;
  captureException: typeof Sentry.captureException;
  captureMessage: typeof Sentry.captureMessage;
  captureUserFeedback: typeof Sentry.captureUserFeedback;
}

/** Our instance of error tracker specific to this project */
export const createErrorTrackerInstance = (vueApp: App) => {
  // NOTE: We route errors via server if configured
  const useTunnel =
    config.errorTrackUrl && config.errorTrackUrl !== config.errorTrackSentryDns;
  const init = (options?: ErrorTrackerOptions) => {
    Sentry.init({
      dsn: config.errorTrackSentryDns || undefined,
      tunnel: (useTunnel && config.errorTrackUrl) || undefined,
      enabled: !!config.errorTrackUrl,
      environment: config.appEnv,
      sampleRate: 1.0,
      tracesSampleRate: 0,
      ...options,
      app: vueApp,
    });
  };

  return {
    init,
    captureEvent: Sentry.captureEvent,
    captureException: Sentry.captureException,
    captureMessage: Sentry.captureMessage,
    captureUserFeedback: Sentry.captureUserFeedback,
  } satisfies ErrorTrackerInstance;
};
