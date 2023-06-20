<template>
  <v-col class="SubsectionCol" v-bind="$attrs">
    <SubsectionTitle v-if="props.title" :tag="props.titleTag">{{ props.title }}</SubsectionTitle>
    <div class="text-body-1" :class="props.contentClass">
      <slot />
    </div>
  </v-col>
  </template>
  
  <script setup lang="ts">
  defineOptions({
    inheritAttrs: false,
  });
  defineSlots<{ default: () => void }>();
  const props = defineProps<{
    title?: string;
    titleTag?: string;
    contentClass?: string
  }>();
  </script>
  
  <style lang="scss">
  .SubsectionCol {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 12px 0;
    flex-basis: 250px;
  }
  
  .md {
    .SubsectionCol {
      flex-basis: 45%;
    }
  }
  </style>
  