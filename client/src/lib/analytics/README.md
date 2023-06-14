# Analytics

Unified and agnostic interface that supports sending analytics / telemetry data to many
services.

Inspired by `analytics` NPM package, but minimalistic and with fully-typed events.

> Why not `analytics`?
>
> I've used it could of times in the past.
>
> The upside is that it has integrations with all the relevant services.
>
> However, from developer experience standpoint, it's not that great:
>
> 1. Missing type support.
>
> - If I wanted to have type names and payloads typed, I still had to
>   create a wrapper around `analytics` instance to get that benefit.
> - The architecture of `analytics` lib reminded me of the likes of Vuex / Redux.
>   The hooks were defined via keys (e.g. `name:track`) with no type support that'd tell you
>   if 1. the string is valid hook, and 2. what's the payload type.
>
> 2. Hard to intercept
>
> - `analytics` was also painful when we had a scenario that we need to send
>   data to 2 or more services, but we need to map the data differently
>   for each service.>

See [useAnalytics.ts in base-analytics module](../../modules/base-analytics/composables/useAnalytics.ts)
for usage examples.
