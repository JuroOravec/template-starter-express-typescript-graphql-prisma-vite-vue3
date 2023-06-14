<template>
  <component :is="listComponent" class="List global-list" v-bind="$attrs">
    <li v-for="item in items" :key="item">
      {{ item }}
    </li>
  </component>
</template>

<script setup lang="ts">
import { useDefaults } from 'vuetify';

defineOptions({ inheritAttrs: false });
const _props = defineProps<{ type?: 'ol' | 'ul'; items: string[] }>();
const props = useDefaults(_props) as typeof _props;

const listComponent = computed(() => props.type);
</script>

<style lang="scss">
.List {
}
</style>
