<template>
  <NuxtLink
    v-bind="nuxtProps"
    :target="willOpenInNewTab ? '_blank' : undefined"
    class="CLink"
    :class="{ underline }"
  >
    <slot>
      {{ link }}
    </slot>
    <v-icon v-if="willOpenInNewTab" icon="mdi:mdi-open-in-new" color="black" size="xsmall" class="ml-1" />
  </NuxtLink>
</template>

<script setup lang="ts">
  // NuxtLink with added "open in new tab" icon if it's an external URL
  // See https://nuxt.com/docs/api/components/nuxt-link
  import { useDefaults } from 'vuetify';
  import type { RouteLocationRaw } from 'vue-router';
  import omit from 'lodash/omit';

  import type { CLinkProps } from '../types';
  
  defineSlots<{ default: () => void }>();

  const _props = defineProps<CLinkProps>();
  const props = useDefaults(_props) as typeof _props;
  const { color, colorHover, underline } = toRefs(props);
  
  const nuxtProps = computed(() => omit(props, 'openInNewTab', 'underline'));
  
  const _isExternalLink = (loc?: RouteLocationRaw) => {
    if (!loc || typeof loc !== 'string') return false;
    if (loc.startsWith('/')) return false; // relative path
    try {
      return new URL(loc).host === new URL(loc).host;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const link = computed(() => props.href || props.to);
  const willOpenInNewTab = computed(() => {
    const openInTab = props.openInNewTab;
    return openInTab === 'external' ? _isExternalLink(link.value) : !!openInTab;
  });
</script>

<style lang="scss">
.CLink {
  --clink-color: v-bind(color);
  --clink-color-hover: v-bind(colorHover);

  font-weight: 500;
  color: var(--clink-color);
  padding-bottom: 2px;
  text-decoration: none;
  cursor: pointer;

  &.underline {
    border-bottom: 1px dashed var(--clink-color);
  }
  
  &:hover {
    color: var(--clink-color-hover);
    border-bottom-color: var(--clink-color-hover);

    .v-icon {
      color: var(--clink-color-hover) !important;
    }
  }
}
</style>
