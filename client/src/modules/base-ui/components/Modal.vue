<template>
  <v-dialog
    :model-value="isOpen"
    class="Modal"
    width="auto"
    v-bind="{ ...$attrs, ...currItem?.rendererProps }"
    @update:modelValue="onUpdate"
  >
    <component
      v-if="currItem?.component"
      :is="currItem.component"
      :state="currItem.state"
      :child-result="childResult"
      class="Modal__content elevation-6"
      @done="onItemDone"
      v-bind="currItem.props"
    /> 
  </v-dialog>
</template>

<script setup lang="ts">
import { useComponentQueue } from '@/../lib/componentQueue';
import type { ModalRendererOptions } from '../types';

defineSlots<{ default: () => void }>();
defineOptions({ inheritAttrs: false });

const { currItem, childResult, onItemDone } = useComponentQueue<ModalRendererOptions>({ namespace: 'modal' });

const isOpen = computed(() => !!currItem.value);

const onUpdate = (val: boolean) => {
  // DO NOTHING if no item loaded, or close on outside not set, or item is being opened 
  if (!currItem.value || !currItem.value?.rendererProps?.closeOnClickOutside || val) return;

  // Close the modal to unblock the queue.
  onItemDone();
};

</script>

<style lang="scss">
.Modal {
  .Modal__content {
    background-color: white;
    padding: 12px;
    border-radius: 4px;
  }
}
</style>
