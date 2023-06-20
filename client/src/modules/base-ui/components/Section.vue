<template>
  <div class="Section" v-bind="$attrs">
    <SectionTitle v-if="props.title" :id="id">
      {{ props.title }}
    </SectionTitle>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
defineSlots<{ default: () => void }>();
const props = defineProps<{ title?: string; id?: string }>();
</script>

<style lang="scss">
.Section {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 0 10px;
}

.md {
  .Section {
    padding: 0 32px;
  }
}

.lg {
  .Section {
    padding: 0 16px;
  }
}
</style>
