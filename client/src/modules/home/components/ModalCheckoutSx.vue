<template>
  <div class="ModalCheckoutSx">
    <h4 class="pa-2 py-4">You successfully purchased {{ payload.product.quantity }}x {{ payload.product.name}}!</h4>
    <div class="px-4 d-flex flex-column" style="gap: 16px;">
      <div class="global-emoji-img">
        🎉
      </div>
      <div>
        A confirmation email has been sent to {{ payload.user.email }}.
      </div>
      <div>
        The email includes a redeem code. Use this code to assign {{ formatPrice(total) }}
        to your scraper of choice.
      </div>
      <div>
        Now it's up to you to decide which scraper to give this to. When you're ready, head over to the
        <CLink to="/scrapers">scrapers suggestions section.</CLink>
      </div>
      <VBtnSecondary class="mx-auto my-4" @click="() => emit('done')">
        Dismiss
      </VBtnSecondary>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItemDef2Emits } from '@/../lib/componentQueue';
import type { HomeModals } from '../composables/useHomeModal';
import toNumber from 'lodash/toNumber';

// Props and emits to work with useComponentQueue
type Modal = HomeModals['checkoutSx'];
type Props = Modal['props'] & { state: Modal['state']; childResult: any };

const props = defineProps<Props>();
const emit = defineEmits<ItemDef2Emits<Modal> & {}>();

const total = computed(() => {
  return toNumber(props.payload?.checkout?.prices?.customer?.total ?? '0');
});
</script>

<style lang="scss" scoped>
.ModalCheckoutSx {
  text-align: center;
}
</style>
