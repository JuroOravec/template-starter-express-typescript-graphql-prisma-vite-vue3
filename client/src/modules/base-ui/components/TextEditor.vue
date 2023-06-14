<template>
  <div class="TextEditor">
    <Codemirror
      v-model="contentModel"
      placeholder="Code goes here..."
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      :disabled="props.readonly"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
// NOTE: I tried using Monaco editor at first, but that didn't work.
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

defineOptions({ inheritAttrs: false });
const contentModel = defineModel({ required: false, local: true, default: '' });
const props = defineProps<{ readonly?: boolean }>()

// See https://github.com/surmon-china/vue-codemirror
const extensions = [javascript(), oneDark];
</script>

<style lang="scss" scoped></style>
