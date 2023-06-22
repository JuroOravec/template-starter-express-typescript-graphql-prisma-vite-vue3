import type { NuxtLinkProps } from 'nuxt/app';
import type { VDialog } from 'vuetify/lib/components/index.mjs';

/** Options that can be passed to `Modal.vue` via `useComponentQueue`. */
export type ModalRendererOptions = {
  closeOnClickOutside?: boolean;
} & VDialog['$props'];

/** Main navigation item as used in DefaultLayout */
export interface LayoutNavItem<T extends string = string> {
  to: T;
  title: string;
}

/** Main navigation item as used in a navigation drawer in DefaultLayout */
export type LayoutDrawerNavItem<T extends LayoutNavItem = LayoutNavItem> = T & {
  props: { to: string };
};

export type CLinkProps = NuxtLinkProps & {
  // NOTE: Watch out for setting this type to `boolean`, because then it's set
  // to `false` if not defined.
  openInNewTab?: 'external' | unknown;
  underline?: boolean;
  color?: string;
  colorHover?: string;
};
