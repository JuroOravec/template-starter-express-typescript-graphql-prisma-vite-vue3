<template>
  <div class="ModalCheckoutFail">
    <div>
      Something went wrong during the checkout process
    </div>
    <VBtnPrimary @click="() => emit('done')">
      Dismiss
    </VBtnPrimary>
  </div>
</template>

<script setup lang="ts">
import type { ItemDef2Emits } from '@/../lib/componentQueue';
import type { HomeModals } from '../composables/useHomeModal';

// Props and emits to work with useComponentQueue
type Modal = HomeModals['checkoutFail'];
type Props = Modal['props'] & { state: Modal['state']; childResult: any };

const props = defineProps<Props>();
const emit = defineEmits<ItemDef2Emits<Modal> & {}>();
</script>

<style lang="scss" scoped>
.ModalCheckoutFail {
}
</style>
