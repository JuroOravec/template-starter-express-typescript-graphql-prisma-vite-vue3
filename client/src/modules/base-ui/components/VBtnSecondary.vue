<template>
<VBtn
  class="VBtnSecondary px-12"
  variant="flat"
  size="x-large"
  rounded="0"
  v-bind="$attrs"
>
  <slot />
</VBtn>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
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

  &:hover {
    text-decoration: underline;
  }

  &.v-btn--disabled {
    border: 0;
  }
}
</style>
  