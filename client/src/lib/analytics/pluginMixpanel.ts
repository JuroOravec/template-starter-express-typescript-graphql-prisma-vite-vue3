import mixpanel, { Config as MixpanelConfig } from 'mixpanel-browser';

import type { AnalyticsPlugin, AnalyticsCtx } from './types';

// See https://github.com/mixpanel/mixpanel-js/blob/8ac526e5cb8563d11e2206046ab986c6491ac6d7/doc/readme.io/javascript-full-api-reference.md#mixpanelset_config
const defaultMixpanelOptions = {
  persistence: 'localStorage',
  // opt_out_tracking_by_default: false
  // opt_out_persistence_by_default: false
  // opt_out_tracking_cookie_prefix,
  // ignore_dnt: false
} satisfies Partial<MixpanelConfig>;

/** Analytics plugin that sends the analytics data to Mixpanel */
export const createMixpanelPlugin = <
  TEvents extends Record<string, unknown>,
  TCtx extends AnalyticsCtx<TEvents>,
>(
  mixpanelToken: string,
  config?: Partial<MixpanelConfig>,
) => {
  const isDisabled = !mixpanelToken;

  return {
    name: 'mixpanel',
    init: () => {
      if (isDisabled) return;

      return mixpanel.init(mixpanelToken, {
        ...defaultMixpanelOptions,
        ...config,
      });
    },
    trackEvent: (eventName, eventProps) => {
      if (isDisabled) return;

      return new Promise<any>((res) =>
        mixpanel.track(eventName as string, eventProps as any, res),
      );
    },
    identify: (userId) => {
      if (isDisabled) return;

      return mixpanel.identify(userId);
    },
  } satisfies AnalyticsPlugin<TEvents, TCtx>;
};
