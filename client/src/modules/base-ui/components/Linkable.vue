<template>
  <NuxtLink
    v-bind="{ ...$attrs, ...nuxtProps }"
    :target="willOpenInNewTab ? '_blank' : undefined"
    class="Linkable"
    :class="{ underline }"
  >
    <slot>
      {{ link }}
    </slot>
    <v-icon v-if="willOpenInNewTab" icon="mdi:mdi-open-in-new" color="black" size="xsmall" />
  </NuxtLink>
</template>

<script setup lang="ts">
  // NuxtLink with added "open in new tab" icon if it's an external URL
  // See https://nuxt.com/docs/api/components/nuxt-link
  import type { NuxtLinkProps } from 'nuxt/app';
  import { useDefaults } from 'vuetify';
  import type { RouteLocationRaw } from 'vue-router';
  import { omit } from 'lodash';
  
  defineSlots<{ default: () => void }>();
  defineOptions({ inheritAttrs: false });

  const _props = defineProps<NuxtLinkProps & {
    // NOTE: Watch out for setting this type to `boolean`, because then it's set
    // to `false` if not defined.
    openInNewTab?: 'external' | unknown;
    underline?: boolean;
    color?: string;
    colorHover?: string;
  }>();
  const props = useDefaults(_props) as typeof _props;
  
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
.Linkable {
  $self: &; // See https://css-tricks.com/using-sass-control-scope-bem-naming/ // TODO MOVE

  --linkable-color: v-bind(color);
  --linkable-color-hover: v-bind(colorHover);

  font-weight: 500;
  color: var(--linkable-color);
  padding-bottom: 2px;
  text-decoration: none;
  cursor: pointer;

  &.underline {
    border-bottom: 1px dashed var(--linkable-color);
  }
  
  &:hover {
    color: var(--linkable-color-hover);
    border-bottom-color: var(--linkable-color-hover);

    .v-icon {
      color: var(--linkable-color-hover) !important;
    }
  }
}
</style>
