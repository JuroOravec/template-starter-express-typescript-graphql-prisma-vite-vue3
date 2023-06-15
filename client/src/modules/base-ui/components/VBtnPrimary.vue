<template>
<VBtn
  class="VBtnPrimary"
  :class="{ 'border': props.border }"
  size="x-large"
  color="#5ac1a6"
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
const props = defineProps<{ border?: boolean }>();
</script>

<style lang="scss">
.VBtnPrimary.v-btn {
  height: fit-content !important;
  padding: 4px 48px;
  font-weight: bold;
  color: white !important;
  font-family: 'Secular One', 'Roboto', sans-serif;
  border: 0;
  border-radius: 4px;

  &.border {
    border-bottom: 4px solid white;
  }

  &:hover {
    text-decoration: underline;
  }
}
</style>
  