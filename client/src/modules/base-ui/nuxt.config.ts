import { vuetifyOptions } from './config/vuetify';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@invictus.codes/nuxt-vuetify'],

  vuetify: {
    vuetifyOptions,
    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
      useIconCDN: true,
      /* vite-plugin-vuetify options */
      styles: 'sass',
      // styles: true | 'none' | 'expose' | 'sass' | { configFile: string },
      autoImport: true,
    },
  },
});
