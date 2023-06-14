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
      class="Modal__content"
      @done="onItemDone"
      v-bind="currItem.props"
    /> 
  </v-dialog>
</template>

<script setup lang="ts">
import { useComponentQueue } from '@/../lib/componentQueue';

defineSlots<{ default: () => void }>();
defineOptions({ inheritAttrs: false });

const { currItem, childResult, onItemDone } = useComponentQueue({ namespace: 'modal' });

const isOpen = computed(() => !!currItem.value);

const onUpdate = (val: boolean) => {
  if (val) return;
  if (!val && currItem.value) {
    // This was likely caused by clicking outside. In that case we close the onItemDone
    // ourselves to unblock the modal queue.
    onItemDone();
  }
};

</script>

<style lang="scss">
.Modal {
  .Modal__content {
    background-color: white;
  }
}
</style>
