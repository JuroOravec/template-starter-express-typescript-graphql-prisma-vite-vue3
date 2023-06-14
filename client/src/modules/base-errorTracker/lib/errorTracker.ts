import {
  init as sentryInit,
  captureEvent,
  captureException,
  captureMessage,
  captureUserFeedback,
} from '@sentry/vue';
import type { App } from 'vue';

import { config } from '@/../globals/config';

export interface ErrorTrackerInstance {
  captureEvent: typeof captureEvent;
  captureException: typeof captureException;
  captureMessage: typeof captureMessage;
  captureUserFeedback: typeof captureUserFeedback;
}

/** Our instance of error tracker specific to this project */
export const createErrorTrackerInstance = (vueApp: App) => {
  // NOTE: We route errors via server if configured
  const useTunnel = config.errorTrackUrl && config.errorTrackUrl !== config.errorTrackSentryDns;
  sentryInit({
    app: vueApp,
    dsn: config.errorTrackSentryDns || undefined,
    tunnel: (useTunnel && config.errorTrackUrl) || undefined,
    enabled: !!config.errorTrackUrl,
    environment: config.appEnv,
    sampleRate: 1.0,
    tracesSampleRate: 0,
  });

  return {
    captureEvent,
    captureException,
    captureMessage,
    captureUserFeedback,
  } satisfies ErrorTrackerInstance;
};
