<template>
  <CLink v-bind="linkProps" :underline="linkUnderline" :id="slug" class="CLinkable" :class="classes" @click="onLinkClick">
    <span class="CLinkable__hash">#</span>
    <span ref="containerEl">
      <slot />
    </span>
  </CLink>
</template>

<script setup lang="ts">
import { useDefaults } from 'vuetify';
import omit from 'lodash/omit';

import type { CLinkProps } from '../types';

defineSlots<{
  default: (props: {}) => void;
}>();
const _props = defineProps<CLinkProps & {
  id?: string;
  breakpoints?: Record<'md', number>;
}>();
const props = useDefaults(_props) as typeof _props;
const { breakpoints } = toRefs(props);

const linkProps = computed(() => omit(props, 'id', 'breakpoints'));
const linkUnderline = computed(() => false || linkProps.value.underline);

const router = useRouter();
const { classes } = useDisplayClasses(breakpoints);

const containerEl = ref<HTMLElement | null>(null);

/** Either use provided ID or derive slug from slot content */
const slug = computed(() => {
  if (props.id) return props.id;

  const titleText = containerEl.value?.textContent;
  // Convert "Happy & Bon+Bon  " to "happy-bon-bon"
  const titleSlug = titleText?.trim().toLocaleLowerCase()
    .replace(/['"`]+/g, '') // remove quote marks, so `don't` will be converted to `dont` instead of `don-t`
    .replace(/[^0-9a-zA-Z-]+/g, '-') // convert unsupported characters to '-'
    .replace(/^\-+|\-+$/g, ''); // remove leading and trailing dashes 
  return titleSlug;
});

const onLinkClick = async () => {
  // The the ID to the URL
  await router.push({ hash: `#${slug.value}` });
  // And copy it to clipboard
  await navigator.clipboard.writeText(location.href);
};
</script>

<style lang="scss">
$self: '.CLinkable';
#{ $self } {
  &__hash {
    // This hides it on small displays
    display: none;
    // This shows it only on hover
    opacity: 0;
  }

  &:hover {
    #{ $self }__hash {
      opacity: 1;
    }
  }

  &.md {
    #{ $self }__hash {
      display: inline;
    }
  }
}
</style>
