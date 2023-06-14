import { apolloConfig, onApolloError } from '../../datasources/apollo';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['../base-ui', '../base-analytics', '../base-errorTracker'],
  // NOTE: Could this solve the slow startup issues?
  // See https://github.com/nuxt/nuxt/issues/20596
  // experimental: {
  //   watcher
  // },

  // components: boolean | ComponentsOptions | ComponentsOptions['dirs'],
  // imports: ImportsOptions,
  // pages: boolean,
  // telemetry: ModuleOptions$1,
  // devtools: boolean | { enabled: boolean },
  // vue: ...
  app: {
    // baseURL: string,
    // buildAssetsDir: string,
    // cdnURL: string,
    // layoutTransition: NuxtAppConfig['layoutTransition'],
    // pageTransition: NuxtAppConfig['pageTransition'],
    // keepalive: NuxtAppConfig['keepalive'],
    // rootId: string,
    // rootTag: string,
  },
  // plugins: (NuxtPlugin | string)[],
  // css: string[],
  // builder: 'vite' | 'webpack' | { bundle: (nuxt: Nuxt) => Promise<void> },
  // sourcemap: boolean | { server?: boolean, client?: boolean },
  // logLevel: 'silent' | 'info' | 'verbose',
  // build: ...
  // optimization: ...

  // theme: string,
  // rootDir: string,
  // workspaceDir: string,
  // srcDir: './src/modules/main',
  // serverDir: './src/server',
  // buildDir: string,
  // modulesDir: Array<string>,
  // dev: boolean,
  // test: boolean,
  // debug: boolean,
  // ssr: boolean,
  // dir: ...
  // extensions: Array<string>,
  // alias: Record<string, string>,
  // ignoreOptions: any,
  // ignorePrefix: string,
  // ignore: Array<string>,
  // watch: Array<string | RegExp>,
  // watchers: ...
  // hooks: NuxtHooks,
  // runtimeConfig: RuntimeConfig,
  // appConfig: AppConfig,
  // devServer: ...
  // experimental: ...
  // nitro: NitroConfig,
  // routeRules: NitroConfig['routeRules'], // See https://nitro.unjs.io/config/#routerules
  // serverHandlers: NitroEventHandler[],
  // devServerHandlers: NitroDevEventHandler[],
  // postcss: ...
  // router: ...
  typescript: {
    includeWorkspace: true,
  },
  vite: {
    vue: {
      // See https://github.com/nuxt/nuxt/issues/20881#issuecomment-1550070346
      script: {
        defineModel: true,
        // propsDestructure: true
      },
    },
  },
  // webpack: ...

  // components: [
  //   // {
  //   //   // path: '~/components',
  //   //   // Disable adding path to component name. See https://nuxt.com/docs/guide/directory-structure/components#component-names
  //   //   pathPrefix: false,
  //   // },
  // ],
  modules: [
    '@nuxtjs/eslint-module',
    // NOTE: DISABLED because I keep getting `CssSyntaxError` error in vue files:
    // '@nuxtjs/stylelint-module',
    '@nuxtjs/apollo',

    // [
    //   '@nuxtjs/i18n',
    //   { /* module options */ }
    // ],
    // '@nuxtjs/color-mode',
    // 'nuxt-vitest',
    // [
    //   // See https://html-validator.nuxtjs.org/
    //   // See https://html-validate.org/rules/index.html
    //   '@nuxtjs/html-validator',
    //   { /* module options */ },
    // ],
    // 'nuxt-typed-router',
  ],

  // Module options
  eslint: {},
  // stylelint: { cacheLocation: './tmp/' },
  apollo: {
    autoImports: false,
    clientAwareness: true,
    clients: {
      default: apolloConfig,
    },
  },
  devtools: {
    enabled: true,
  },
  hooks: {
    // @ts-expect-error - See https://apollo.nuxtjs.org/recipes/error-handling
    'apollo:error': onApolloError,
  },
});
