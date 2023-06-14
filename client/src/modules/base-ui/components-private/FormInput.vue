<template>
  <div class="FormInput">
    <slot name="default" />
    <div class="text-caption global-form-caption">
      <div v-if="props.error" class="global-form-error">
        <slot name="error" v-bind="{ error: props.error }">
          {{ props.error }}
        </slot>
      </div>
      <slot name="hint" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  default: () => void;
  error: (props: { error: string }) => void;
  hint: () => void;
}>();
const props = defineProps<{ error?: string }>();
</script>

<style lang="scss">
.FormInput {
  .v-input__details .v-messages {
    display: none;
  }
}
</style>
