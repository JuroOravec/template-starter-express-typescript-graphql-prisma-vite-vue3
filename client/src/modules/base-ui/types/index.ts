import type { VDialog } from 'vuetify/lib/components/index.mjs';

/** Options that can be passed to `Modal.vue` via `useComponentQueue`. */
export type ModalRendererOptions = {
  closeOnClickOutside?: boolean;
} & VDialog['$props'];
