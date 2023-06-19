<template>
  <span class="Enum" v-bind="$attrs">
    <template v-for="(item, index) in items" :key="item">
      <slot name="item" v-bind="genSlotScope(item, index)">
        <span>
          <slot name="default" v-bind="genSlotScope(item, index)"
            >{{ item }}</slot
          >
          <slot name="divider" v-if="!isLast(index)" v-bind="genSlotScope(item, index)"
            >
            {{ getItemDivider(index) }}</slot
          >
        </span>
      </slot>
    </template>
  </span>
</template>

<script setup lang="ts" generic="T">
import { useDefaults } from 'vuetify';

defineOptions({ inheritAttrs: false });
defineSlots<{
  default?: (props: { item: T; divider: string; isLast: boolean }) => void;
  divider?: (props: { item: T; divider: string; isLast: boolean }) => void;
  item?: (props: { item: T; divider: string; isLast: boolean }) => void;
}>();
const _props = defineProps<{
  items: T[];
  /** String used to divide items, defaults to comma `', '`. */
  divider?: string;
  /** String used to divide last two items, defaults to value set in `divider`. */
  dividerLast?: string;
}>();
const props = useDefaults(_props) as typeof _props;

const divider = computed(() => props.divider ?? ', ');
const dividerLast = computed(() => props.dividerLast ?? divider.value);

const isLast = (idx: number) => idx === props.items.length - 1;
const getItemDivider = (idx: number) => idx === props.items.length - 2 ? dividerLast.value : divider.value;

const genSlotScope = (item: T, idx: number) => ({ item, divider: getItemDivider(idx), isLast: isLast(idx) });
</script>

<style lang="scss">
.Enum {
}
</style>
