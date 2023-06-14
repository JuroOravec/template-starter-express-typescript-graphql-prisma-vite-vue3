import { CustomAnalyticsInstance, createAnalyticsInstance } from '../lib/analytics';

// See https://nuxt.com/docs/guide/directory-structure/plugins#advanced
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $analytics: CustomAnalyticsInstance;
  }
}

declare module '#app' {
  interface NuxtApp {
    $analytics: CustomAnalyticsInstance;
  }
}

// See https://nuxt.com/docs/guide/directory-structure/plugins#creating-plugins
const analyticsPlugin = defineNuxtPlugin({
  name: 'analytics',
  async setup(nuxtApp) {
    const { vueApp } = nuxtApp;
    const analytics = createAnalyticsInstance();

    await analytics.init();

    vueApp.config.globalProperties.$analytics = analytics;

    return {
      provide: {
        analytics: analytics,
      },
    };
  },
});

export default analyticsPlugin;
