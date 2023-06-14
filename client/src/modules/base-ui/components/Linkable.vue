<template>
  <NuxtLink v-bind="{ ...$attrs, ...props }" class="Linkable">
    <slot />
    <v-icon v-if="willOpenInNewTab" icon="mdi:mdi-open-in-new" color="black" size="xsmall" />
  </NuxtLink>
</template>

<script setup lang="ts">
  // NuxtLink with added "open in new tab" icon if it's an external URL
  // See https://nuxt.com/docs/api/components/nuxt-link
  import type { NuxtLinkProps } from 'nuxt/app';
  import { useDefaults } from 'vuetify';
  import type { RouteLocationRaw } from 'vue-router';
  
  const _props = defineProps<NuxtLinkProps & { openInNewTab?: boolean | null }>();
  const props = useDefaults(_props) as typeof _props;

  defineSlots<{ default: () => void }>();
  defineOptions({ inheritAttrs: false });

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
  const willOpenInNewTab = typeof props.openInNewTab === 'boolean' ? props.openInNewTab : _isExternalLink(props.href || props.to);
</script>

<style lang="scss">
$color: #1D2E54;
$color-hover: #E75B5B;

.Linkable {
  $self: &; // See https://css-tricks.com/using-sass-control-scope-bem-naming/ // TODO MOVE

  font-weight: 500;
  color: $color;
  padding-bottom: 2px;
  border-bottom: 1px dashed $color;
  text-decoration: none;
  
  &:hover {
    color: $color-hover;
    border-bottom-color: $color-hover;
  }
}
</style>
