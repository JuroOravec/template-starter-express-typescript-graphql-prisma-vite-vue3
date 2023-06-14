<template>
<h3 class="SectionTitle" v-bind="$attrs">
  <slot />
</h3>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
defineSlots<{ default: () => void }>();
</script>

<style lang="scss">
.SectionTitle {
  font-family: "Secular One", "Roboto", sans-serif;
  font-size: 2rem !important;
  line-height: 1.5;
  font-weight: 400;
  padding: 4px 20px;
  background-color: #8FC4C7;
  color: white;
}
</style>
  