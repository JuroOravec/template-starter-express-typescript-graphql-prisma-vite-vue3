<template>
  <v-row
    class="SubsectionRow"
    :class="{ wrap, reverse, fullw: fullWidth }"
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
const _props = defineProps<{
  wrap?: boolean;
  reverse?: boolean;
  fullWidth?: boolean;
}>();
const props = useDefaults(_props) as typeof _props;
const { wrap, reverse, fullWidth } = toRefs(props);
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

  &.fullw {
    width: 100%;
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
