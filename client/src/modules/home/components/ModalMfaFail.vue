<template>
  <div class="ModalMfaFail text-body-2 d-flex flex-column">
    <v-alert
      type="error"
      variant="tonal"
      class="mb-12" 
      title="Invalid verification request."
      text="Either the code or the URL that you used was invalid, or it has already expired."
    />
    <VBtnSecondary error class="mx-auto mb-4" @click="() => emit('done')">
      Dismiss
    </VBtnSecondary>
  </div>
</template>

<script setup lang="ts">
import type { ItemDef2Emits } from '@/../lib/componentQueue';
import type { HomeModals } from '../composables/useHomeModal';

// Props and emits to work with useComponentQueue
type Modal = HomeModals['mfaFail'];
type Props = Modal['props'] & { state: Modal['state']; childResult: any };

defineProps<Props>();
const emit = defineEmits<ItemDef2Emits<Modal>>();
</script>

<style lang="scss" scoped>
.ModalMfaFail {
}
</style>
