<template>
  <CLink :id="slug" class="CLinkable" :class="classes" @click="onLinkClick">
    <span class="CLinkable__hash">#</span>
    <span ref="containerEl">
      <slot />
    </span>
  </CLink>
</template>

<script setup lang="ts">
import { useDefaults } from 'vuetify';

defineSlots<{
  default: (props: {}) => void;
}>();
const _props = defineProps<{
  id?: string;
  breakpoints?: Record<'md', number>;
}>();
const props = useDefaults(_props) as typeof _props;
const { breakpoints } = toRefs(props);

const router = useRouter();
const { classes } = useDisplayClasses(breakpoints);

const containerEl = ref<HTMLElement | null>(null);

/** Either use provided ID or derive slug from slot content */
const slug = computed(() => {
  if (props.id) return props.id;

  const titleText = containerEl.value?.textContent;
  // Convert "Happy & Bon+Bon  " to "happy-bon-bon"
  const titleSlug = titleText?.trim().toLocaleLowerCase().replace(/[^0-9a-zA-Z-]+/g, '-');
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
