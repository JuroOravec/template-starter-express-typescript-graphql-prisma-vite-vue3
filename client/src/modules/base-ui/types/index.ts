import type { VDialog } from 'vuetify/lib/components/index.mjs';

/** Options that can be passed to `Modal.vue` via `useComponentQueue`. */
export type ModalRendererOptions = {
  closeOnClickOutside?: boolean;
} & VDialog['$props'];

/** Main navigation item as used in DefaultLayout */
export interface LayoutNavItem<T extends string = string> {
  to: T;
  title: string;
  hideOnMd?: boolean;
}

/** Main navigation item as used in a navigation drawer in DefaultLayout */
export type LayoutDrawerNavItem<T extends LayoutNavItem = LayoutNavItem> = T & {
  props: { to: string };
};
