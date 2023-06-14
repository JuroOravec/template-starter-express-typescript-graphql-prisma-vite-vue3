<template>
  <FormInput class="FormInputSelect" :error="props.error">
    <v-select
      density="compact"
      hide-details
      :menu-props="{
        ...($attrs.menuProps ?? {}),
        contentClass: ['FormInputSelect__content', ($attrs as any).menuProps?.contentClass].filter(Boolean).join(' '),
      }"
      :error="!!props.error"
      v-bind="$attrs"
    >
    </v-select>
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
.FormInputSelect {
  &__content {
    .v-list-item {
      min-height: 32px !important;
    }
  }
}
</style>
