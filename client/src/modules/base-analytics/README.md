# Analytics module

1. Configure analytics instance as defined in [./lib/analytics.ts](./lib/analytics.ts).
2. Initialize the instance.
3. Provide analytics instance.
   1. Available as Nuxt global property e.g. `useNuxtApp().$analytics`
   2. Available as Vue global property e.g. `getCurrentInstance().proxy.$analytics`
   3. Add a composable `useAnalytics` that returns analytics instance.
