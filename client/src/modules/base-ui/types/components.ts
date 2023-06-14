import type { GlobalComponents } from 'vue';

import type { ArrVal } from '../../../utils/types';

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
