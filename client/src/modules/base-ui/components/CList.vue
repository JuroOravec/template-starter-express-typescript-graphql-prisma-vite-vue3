<template>
  <component :is="listComponent" class="CList global-list" v-bind="$attrs">
    <template v-for="item in items" :key="item">
      <slot name="item" v-bind="{ item }">
        <li>
          <slot name="default" v-bind="{ item }">
            {{ item }}
          </slot>
        </li>
      </slot>
    </template>
  </component>
</template>

<script setup lang="ts" generic="T">
import { useDefaults } from 'vuetify';

defineOptions({ inheritAttrs: false });
defineSlots<{
  default?: (props: { item: T }) => void;
  item?: (props: { item: T }) => void;
}>();
const _props = defineProps<{ type?: 'ol' | 'ul'; items: T[] }>();
const props = useDefaults(_props) as typeof _props;

const listComponent = computed(() => props.type);
</script>

<style lang="scss">
.CList {
}
</style>
