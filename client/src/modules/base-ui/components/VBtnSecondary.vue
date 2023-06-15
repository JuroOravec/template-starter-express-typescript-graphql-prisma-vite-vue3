<template>
<VBtn
  class="VBtnSecondary px-12"
  :class="{ error: props.error }"
  :variant="props.error ? 'tonal' : 'flat'"
  :color="props.error ? 'error' : undefined"
  size="x-large"
  v-bind="$attrs"
>
  <slot />
</VBtn>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
const props = defineProps<{ error?: boolean }>();
defineSlots<{ default: () => void }>();
</script>

<style lang="scss">
.VBtnSecondary {
  height: fit-content !important;
  padding: 4px 47px !important;
  font-weight: normal;
  background-color: white;
  color: #868686;
  font-family: 'Secular One', 'Roboto', sans-serif;
  border: 1px solid #a6a6a6;
  border-width: 1px !important;

  &:hover {
    text-decoration: underline;
  }

  &.v-btn--disabled {
    border: 0;
  }

  .v-btn__content {
    opacity: 0.8;
  }

  &.error {
    border-color: var(--v-theme-error);

    .v-btn__underlay {
      opacity: 0.05;
    }
  }
}
</style>
  