import type { MaybePromise } from '../../utils/types';
import type {
  AnalyticsCtx,
  AnalyticsInstance,
  AnalyticsOptions,
  AnalyticsPlugin,
  Events,
} from './types';

// Re-export plugins and common types for cleaner interface
export { createMixpanelPlugin } from './pluginMixpanel';
export type { AnalyticsCtx, AnalyticsInstance, AnalyticsOptions, AnalyticsPlugin } from './types';

const serialOnPlugin = async <T extends AnalyticsPlugin<any, any>>(
  plugins: T[],
  onPlugin: (plugin: T) => MaybePromise<void>
) => {
  await plugins.reduce(async (aggPromise, plugin) => {
    await aggPromise;
    await onPlugin(plugin);
  }, Promise.resolve());
};

const parallelOnPlugin = async <T extends AnalyticsPlugin<any, any>>(
  plugins: T[],
  onPlugin: (plugin: T) => MaybePromise<void>
) => {
  await Promise.all(plugins.map(async (plugin) => onPlugin(plugin)));
};

export const createAnalytics = <TEvents extends Events, TCtx extends AnalyticsCtx<TEvents>>(
  options: AnalyticsOptions<TEvents, TCtx>
) => {
  const plugins = options.plugins ?? [];
  const onPlugin = options.parallel ? parallelOnPlugin : serialOnPlugin;

  const pluginCtx = (plugin: AnalyticsPlugin<TEvents, TCtx>) =>
    ({ plugin, plugins, options } as any as TCtx);

  const init = async () => {
    await onPlugin(plugins, async (plugin) => {
      const pluginOptions = plugin.options ?? {};
      await plugin.init(pluginOptions, pluginCtx(plugin));
    });
  };

  const trackEvent = async <TKey extends keyof TEvents>(
    eventName: TKey,
    eventProps: TEvents[TKey]
  ) => {
    await onPlugin(plugins, async (plugin) => {
      await plugin.trackEvent(eventName, eventProps, pluginCtx(plugin));
    });
  };

  const identify = async (userId: string) => {
    await onPlugin(plugins, async (plugin) => {
      await plugin.identify(userId, pluginCtx(plugin));
    });
  };

  const inst = {
    init,
    trackEvent,
    identify,
  } satisfies AnalyticsInstance<TEvents>;

  return inst;
};
