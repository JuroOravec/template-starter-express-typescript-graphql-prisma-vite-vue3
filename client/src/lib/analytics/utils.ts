import type { MaybePromise } from '../../utils/types';
import type { AnalyticsPlugin, Events } from './types';

export type PluginPayloadMapper<T extends Events> = {
  [Key in keyof T]: (payload: T[Key]) => MaybePromise<object>;
};

/**
 * Given an analytics plugin, transform the payload passed to `trackEvent`,
 * on a per-event basis based on the `eventMap`.
 */
export const mapPluginPayload = <TEvents extends Events, TPlugin extends AnalyticsPlugin<TEvents>>(
  plugin: TPlugin,
  eventMap: PluginPayloadMapper<TEvents>
): TPlugin => {
  const wrappedPlugin = {
    ...plugin,
    trackEvent: async (eventName, eventProps, ...args) => {
      const mapper = eventMap[eventName];
      const mappedPayload = await mapper(eventProps);
      return plugin.trackEvent(eventName, mappedPayload as any, ...args);
    },
  } satisfies TPlugin;
  return wrappedPlugin;
};
