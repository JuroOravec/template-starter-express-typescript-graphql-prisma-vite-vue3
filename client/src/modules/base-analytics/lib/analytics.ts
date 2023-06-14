import { config } from '@/../globals/config';
import { AnalyticsInstance, createAnalytics, createMixpanelPlugin } from '@/../lib/analytics';
import { PluginPayloadMapper, mapPluginPayload } from '@/../lib/analytics/utils';

/** Source of truth for what kind of events we track and what's the expected payload */
export interface AnalyticsEvents {
  page: { pageName: string | null };
}

/** Analytics instance with event types scoped to this project */
export type CustomAnalyticsInstance = AnalyticsInstance<AnalyticsEvents>;

/** Our instance of analytics specific to this project */
export const createAnalyticsInstance = (): CustomAnalyticsInstance => {
  const mixpanelPlugin = createMixpanelPlugin(config.analyticsMixpanelToken ?? '', {
    opt_out_tracking_cookie_prefix: 'yodese',
    api_host: config.analyticsUrl,
  });
  const analytics = createAnalytics({
    plugins: [mapPluginPayload(mixpanelPlugin, payloadMapper)],
  });
  return analytics;
};

/** Event payload transformations before they are sent out via e.g. Mixpanel */
const payloadMapper = {
  page: (d) => ({ ...d, pageName: d.pageName || 'unknown' }),
} satisfies PluginPayloadMapper<AnalyticsEvents>;
