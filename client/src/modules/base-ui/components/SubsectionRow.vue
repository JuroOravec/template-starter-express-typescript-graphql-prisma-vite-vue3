<template>
  <v-row
    class="SubsectionRow"
    :class="{ wrap: props.wrap, reverse: props.reverse }"
    v-bind="$attrs"
  >
    <slot />
  </v-row>
</template>

<script setup lang="ts">
import { useDefaults } from 'vuetify';

defineOptions({
  inheritAttrs: false,
});
defineSlots<{ default: () => void }>();
const _props = defineProps<{ wrap?: boolean; reverse?: boolean }>();
const props = useDefaults(_props) as typeof _props;
</script>

<style lang="scss">
.SubsectionRow {
  max-width: 100%;
  margin: auto;
  justify-content: space-around;
  align-items: center;
  gap: 20px;

  img {
    width: inherit;
    max-width: 350px;
  }

  &.wrap {
    flex-direction: column;
  }
}

.md {
  .SubsectionRow {
    align-items: unset;

    &.reverse {
      flex-direction: row-reverse !important;
    }

    &.wrap {
      flex-direction: row;
    }

    img {
      max-width: 350px;
    }
  }
}

.lg {
  .SubsectionRow {
    img {
      max-width: 320px;
    }
  }
}
</style>
