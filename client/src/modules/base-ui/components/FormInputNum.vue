<template>
  <FormInput class="FormInputNum" :error="props.error">
    <v-text-field
      type="number"
      hide-details
      :error="!!props.error"
      v-bind="$attrs"
      :model-value="modelValue"
      @update:model-value="updateModelValue"
    />
    <template #hint>
      <slot name="hint" />
    </template>
  </FormInput>
</template>

<script setup lang="ts">
import toNumber from 'lodash/toNumber';

import FormInput from '../components-private/FormInput.vue';

defineOptions({ inheritAttrs: false });
defineSlots<{
  default: () => void;
  hint: () => void;
}>();
const modelValue = defineModel({ required: false, local: true, default: 0 });
const props = defineProps<{
  /** Whether the numeric value should be normalized to integer */
  int?: boolean;
  error?: string;
}>();

const updateModelValue = (newVal: string) => {
  // E.g. if the input is not a clean number, but sth like "10ab20",
  // then drop the "ab20", and keep only the "10".
  const valValidPart = (newVal.match(/^[0-9.,\s]+/)?.[0] ?? '').replace(/[\s,]/g, '');
  const numVal = valValidPart ? toNumber(valValidPart) : 0;
  const roundedVal = props.int ? Math.floor(numVal) : numVal;
  modelValue.value = roundedVal;
};
</script>

<style lang="scss">
.FormInputNum {}
</style>
