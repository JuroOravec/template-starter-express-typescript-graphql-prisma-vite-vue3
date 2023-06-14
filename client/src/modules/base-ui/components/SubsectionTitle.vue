<template>
  <div class="SubsectionTitle" v-bind="$attrs">
    <div v-if="props.tag" class="section-tag text-body-2">{{ props.tag }}</div>
    <h4>
      <slot />
    </h4>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
defineSlots<{ default: () => void }>();
const props = defineProps<{ tag?: string }>();
</script>

<style lang="scss">
.SubsectionTitle {
  h4 {
    font-size: 1.5rem !important;
    font-weight: bold;
    padding: 16px 20px 12px;
    background-color: #D2D8B1;
    color: #363636;
  }

  .section-tag {
    width: fit-content;
    font-weight: 500;
    padding: 2px 5px 0;
    background-color: #E75B5B;
    color: white;
  }
}
</style>
