import type { GlobalComponents } from 'vue';
import type { VuetifyOptions } from 'vuetify';
import { aliases as iconAliases, mdi } from 'vuetify/iconsets/mdi';

import { config } from '../../../globals/config';
import type { ArrVal } from '../../../utils/types';

//////////////
// TYPES
//////////////

// NOTE: While components from ./components folder are auto-imported
//       and hence also found on the `GlobalComponents` object,
//       then other Vue components, like Pages and Layouts, are not.
//       For the latter two, we define the names here
const COMPONENT_NAME = [
  // Base module - layouts
  'DefaultLayout',
] as const;

/** Type of all component names that can be used in VuetifyOptions.defaults */
export type ComponentName =
  // Our custom components
  | ArrVal<typeof COMPONENT_NAME>
  // Components defined by Vue & Nuxt
  | keyof GlobalComponents;

//////////////
// CONFIG
//////////////

const aliases = {
  // NOTE: Can't figure out yet how to use Vuetify aliases in Nuxt 3
  // See https://stackoverflow.com/questions/76381264
  // VBtnPrimary: VBtn,
};

/** Defaults for our own components */
const customDefaults = {
  //////////////
  // base-ui module
  //////////////
  DefaultLayout: {
    siteName: config.siteName,
    homeLink: '/',
  },
  SubsectionRow: {
    wrap: true,
    reverse: false,
  },
  CList: {
    type: 'ul',
  },
  CEnum: {
    divider: ', ',
  },
  CLink: {
    openInNewTab: 'external',
    underline: true,
    color: '#1D2E54',
    colorHover: '#E75B5B',
  },
  CLinkable: {
    breakpoints: { md: 400 },
  },
  // VBtnPrimary: {
  //   class: 'cta px-12',
  //   variant: 'flat',
  //   size: 'x-large',
  //   rounded: '0',
  // },
} satisfies Partial<
  Record<ComponentName | keyof typeof aliases, Record<string, unknown>>
>;

/** Defaults for Vuetify components */
const vuetifyDefaults = {
  VTextField: {
    persistentHint: true,
    density: 'compact',
    rounded: 0,
  },
  VTextarea: {
    persistentHint: true,
    density: 'compact',
    rounded: 0,
  },
  VCheckbox: {
    persistentHint: true,
    density: 'compact',
    rounded: 0,
  },
  VSelect: {
    persistentHint: true,
    density: 'compact',
    rounded: 0,
  },
} satisfies VuetifyOptions['defaults'];

export const vuetifyOptions: VuetifyOptions = {
  defaults: {
    ...vuetifyDefaults,
    ...customDefaults,
  },
  // See https://vuetifyjs.com/en/features/icon-fonts/#install-material-icons
  icons: {
    defaultSet: 'mdi',
    aliases: iconAliases,
    sets: {
      mdi,
    },
  },
  aliases,
  // blueprint?: Blueprint;
  // components?: Record<string, any>;
  // date?: DateOptions;
  // directives?: Record<string, any>;
  // display?: DisplayOptions;
  // theme?: ThemeOptions;
  // locale?: LocaleOptions & RtlOptions;
  // ssr?: SSROptions;
};
