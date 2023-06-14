<template>
  <div class="Section" v-bind="$attrs">
    <v-hover>
      <template #="{ isHovering }">
        <SectionTitle v-if="props.title" :id="kebabCase(props.title)">
          <span v-if="isHovering"> # </span>
          {{ props.title }}
        </SectionTitle>
      </template>
    </v-hover>
    <slot />
  </div>
</template>

<script setup lang="ts">
import kebabCase from 'lodash/kebabCase';

defineOptions({
  inheritAttrs: false,
});
defineSlots<{ default: () => void }>();
const props = defineProps<{ title?: string }>();
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
