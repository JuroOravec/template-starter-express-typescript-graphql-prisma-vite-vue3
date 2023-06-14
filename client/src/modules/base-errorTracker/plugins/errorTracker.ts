import { ErrorTrackerInstance, createErrorTrackerInstance } from '../lib/errorTracker';

// See https://nuxt.com/docs/guide/directory-structure/plugins#advanced
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $errorTracker: ErrorTrackerInstance;
  }
}

declare module '#app' {
  interface NuxtApp {
    $errorTracker: ErrorTrackerInstance;
  }
}

// See https://nuxt.com/docs/guide/directory-structure/plugins#creating-plugins
const errorTrackerPlugin = defineNuxtPlugin({
  name: 'analytics',
  async setup(nuxtApp) {
    const { vueApp } = nuxtApp;
    const errorTracker = createErrorTrackerInstance(vueApp);

    vueApp.config.globalProperties.$errorTracker = errorTracker;

    return {
      provide: {
        errorTracker,
      },
    };
  },
});

export default errorTrackerPlugin;
