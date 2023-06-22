<template>
  <h3 class="SectionTitle">
    <CLinkable :id="props.id" color="white" color-hover="white">
      <slot />
    </CLinkable>
  </h3>
</template>

<script setup lang="ts">
defineSlots<{ default: (props: {}) => void }>();
const props = defineProps<{
  id?: string;
}>();
</script>

<style lang="scss">
.SectionTitle {
  font-family: "Secular One", "Roboto", sans-serif;
  font-size: 2rem !important;
  line-height: 1.5;
  font-weight: 400;
  padding: 8px 20px 4px;
  background-color: #8FC4C7;
  color: white;
}
</style>
