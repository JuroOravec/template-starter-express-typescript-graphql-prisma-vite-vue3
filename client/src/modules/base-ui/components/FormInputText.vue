<template>
  <FormInput class="FormInputText" :error="props.error">
    <v-text-field
      hide-details
      :error="!!props.error"
      v-bind="$attrs"
    />
    <template #hint>
      <slot name="hint" />
    </template>
  </FormInput>
</template>

<script setup lang="ts">
import FormInput from '../components-private/FormInput.vue';

defineOptions({ inheritAttrs: false });
defineSlots<{
  default: () => void;
  hint: () => void;
}>();
const props = defineProps<{ error?: string }>();
</script>

<style lang="scss">
.FormInputText {}
</style>
