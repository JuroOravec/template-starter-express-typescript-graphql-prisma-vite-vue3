# Error Tracker module

1. Configure error tracker instance as defined in [./lib/errorTracker](./lib/errorTracker.ts).
2. Initialize the instance.
3. Provide errorTracker instance.
   1. Available as Nuxt global property e.g. `useNuxtApp().$errorTracker`
   2. Available as Vue global property e.g. `getCurrentInstance().proxy.$errorTracker`
   3. Add a composable `useErrorTracker` that returns errorTracker instance.
