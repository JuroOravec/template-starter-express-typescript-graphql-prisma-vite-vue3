import type { Component } from 'vue';

import { createNamedUseComponentQueue } from '@/../lib/componentQueue';
import type { ModalRendererOptions } from '@/../modules/base-ui/types';
import type { PaddleCheckoutSuccessEvent } from '@/../datasources/paddle/types';
import ModalCheckoutSx from '../components/ModalCheckoutSx.vue';
import ModalCheckoutFail from '../components/ModalCheckoutFail.vue';
import ModalMfaFail from '../../components/ModalMfaFail.vue';

/** Input / output of all modals used in the home module */
// NOTE: This HAS to be type, NOT interface, see https://stackoverflow.com/a/71394297/9788634
export type HomeModals = {
  checkoutSx: {
    props: { payload: PaddleCheckoutSuccessEvent };
    emit: void;
    state: {};
  };
  checkoutFail: { props: {}; emit: void; state: {} };
  mfaFail: { props: {}; emit: void; state: {} };
};

/** All modals we used in this project */
const homeModals = {
  checkoutSx: ModalCheckoutSx,
  checkoutFail: ModalCheckoutFail,
  mfaFail: ModalMfaFail,
} satisfies Record<keyof HomeModals, Component>;

/** Modal used in home module, with type safety */
// NOTE: Intentionally not auto-imporable by Nuxt to avoid circular dependency with Vuetify
//       See https://github.com/invictus-codes/nuxt-vuetify/issues/17
export const useHomeModal = createNamedUseComponentQueue<
  HomeModals,
  ModalRendererOptions
>(homeModals, { namespace: 'modal' });
