import type { MaybePromise } from '../../utils/types';

export type Events = { [Key in string]: any };

/** Unified entrypoint for passing the telemetry data to multiple analytics services. */
export interface AnalyticsInstance<TEvents extends Events = Events> {
  init: () => MaybePromise<void>;
  trackEvent: <TKey extends keyof TEvents>(
    eventName: TKey,
    eventProps: TEvents[TKey]
  ) => MaybePromise<void>;
  identify: (id: string) => MaybePromise<void>;
}

/** Single plugin passes the telemetry data to a single analytics service. */
export interface AnalyticsPlugin<
  TEvents extends Events = Events,
  TCtx extends AnalyticsCtx<TEvents> = AnalyticsCtx<TEvents>
> {
  name: string;
  options?: TCtx['options'];
  init: (options: TCtx['options'], ctx: TCtx) => MaybePromise<void>;
  trackEvent: <TKey extends keyof TEvents>(
    eventName: TKey,
    eventProps: TEvents[TKey],
    ctx: TCtx
  ) => MaybePromise<void>;
  identify: (id: string, ctx: TCtx) => MaybePromise<void>;
}

/** Context available to AnalyticsPlugins methods. */
export interface AnalyticsCtx<TEvents extends Events = Events, TOpts extends object = object> {
  options: AnalyticsOptions<TEvents, AnalyticsCtx<TEvents, TOpts>>;
  plugin: AnalyticsPlugin<TEvents, AnalyticsCtx<TEvents, TOpts>>;
  plugins: AnalyticsPlugin<TEvents, AnalyticsCtx<TEvents, TOpts>>[];
}

export interface AnalyticsOptions<
  TEvents extends Events = Events,
  TCtx extends AnalyticsCtx<TEvents> = AnalyticsCtx<TEvents>
> {
  plugins?: AnalyticsPlugin<TEvents, TCtx>[];
  parallel?: boolean;
}
