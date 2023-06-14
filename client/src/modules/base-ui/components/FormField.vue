<template>
  <component
    :is="fieldComp"
    :name="props.name"
    class="FormField"
    v-bind="{ ...props.attrs, ...$attrs }"
  >
    <template #hint> {{ props.hint }} </template>
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

import type { FormField, FormFieldTypeMap } from '../composables/useForm';
import FormInputText from './FormInputText.vue';
import FormInputTextarea from './FormInputTextarea.vue';
import FormInputNum from './FormInputNum.vue';
import FormInputSelect from './FormInputSelect.vue';
import FormInputCheckbox from './FormInputCheckbox.vue';

defineOptions({ inheritAttrs: false });
const props = defineProps<Pick<FormField<FormFieldTypeMap>, 'attrs' | 'name' | 'hint' | 'type'>>();

const componentByType = {
  text: FormInputText,
  textarea: FormInputTextarea,
  number: FormInputNum,
  select: FormInputSelect,
  checkbox: FormInputCheckbox,
} satisfies Record<keyof FormFieldTypeMap, Component>;

const fieldComp = computed(() => componentByType[props.type]);
</script>
