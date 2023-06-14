<template>
  <div class="ModalCheckoutSx">
    <div>
      Congrats!
      <br />
      <br />
      Your purchase was successful.

      <br />
      <br />
      You bought:
      <br />
      <br />
      {{ product }}

      <br />
      <br />
      A confirmation email has been sent to your email

      <br />
      <br />
      About you:

      <br />
      <br />
      {{ user }}
    </div>
    <VBtnPrimary @click="() => emit('done')"> Dismiss </VBtnPrimary>
  </div>
</template>

<script setup lang="ts">
import type { ItemDef2Emits } from '@/../lib/componentQueue';
import type { HomeModals } from '../composables/useHomeModal';

// Props and emits to work with useComponentQueue
type Modal = HomeModals['checkoutSx'];
type Props = Modal['props'] & { state: Modal['state']; childResult: any };

const props = defineProps<Props>();
const emit = defineEmits<ItemDef2Emits<Modal> & {}>();

const product = computed(() => JSON.stringify(event.product))
const user = computed(() => JSON.stringify(event.user))
</script>

<style lang="scss" scoped>
.ModalCheckoutSx {
}
</style>
