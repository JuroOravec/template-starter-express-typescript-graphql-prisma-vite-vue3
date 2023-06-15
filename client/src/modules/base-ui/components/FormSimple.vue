<template>
  <div class="FormSimple">
    <v-form
      v-bind="$attrs"
      class="form"
      :class="{ completed }"
      netlify
      style="gap: 20px;"
      @submit.prevent="onSubmit"
    >
      <slot name="prepend" v-bind="{ ...slotProps }" />

      <div
        v-for="(formGroup, index) in formGroups"
        :key="formGroup.map((f) => f.name).join(',')"
        class="form-step-content"
        :class="[`form-group-${index}`]"
      >
        <slot :name="`group[${index}].prepend`" v-bind="{ formGroup, ...slotProps }" />

        <template v-for="field in formGroup" :key="field.name">
          <slot
            :name="`field[${field.name}].prepend`"
            v-bind="{ field, formGroup, ...slotProps }"
          />
          <FormField v-bind="buildFieldAttrs(field)" />
          <slot :name="`field[${field.name}].append`" v-bind="{ field, formGroup, ...slotProps }" />
        </template>

        <slot :name="`group[${index}].append`" v-bind="{ formGroup, ...slotProps }" />
      </div>

      <slot name="append" v-bind="{ ...slotProps }" />
      <slot name="controls" v-bind="{ ...slotProps }">
        <div class="controls py-6">
          <div class="controls__actions">
            <slot name="action-prepend" v-bind="{ ...slotProps }" />
            <VBtnPrimary :disabled="vuelidate.$invalid" type="submit"> Submit </VBtnPrimary>
            <slot name="action-append" v-bind="{ ...slotProps }" />
          </div>
          <div
            v-if="vuelidate.$errors.length"
            class="controls__error text-caption global-form-caption global-form-error"
          >
            Please fix {{ vuelidate.$errors.length }} error(s) before submission.
          </div>
        </div>
      </slot>
    </v-form>

    <div v-if="completed" class="text-center">
      <slot name="form-completed" v-bind="{ ...slotProps }">
        Thanks for the submission.
        <br />
        <br />
        <VBtnPrimary class="mt-5 py-4" @click="reset"> Submit another </VBtnPrimary>
      </slot>
    </div>

    <div v-if="loading" class="loading-overlay">
      <v-progress-circular color="primary" indeterminate :size="100" :width="10" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends FormField<any, any, any>">
import type { Validation } from '@vuelidate/core';

import type { MaybeGroupedArr } from '@/../lib/typedForm/utils';
import type { FormField, FormFieldToType } from '../composables/useForm';
import { useForm } from '../composables/useForm';

defineOptions({ inheritAttrs: false });
defineSlots<{
  prepend?: (props: typeof slotProps) => void;
  append?: (props: typeof slotProps) => void;
  controls?: (props: typeof slotProps) => void;
  'action-prepend'?: (props: typeof slotProps) => void;
  'action-append'?: (props: typeof slotProps) => void;
  'form-completed'?: (props: typeof slotProps) => void;
} & {
  [Key in `group[${number}].prepend`]?: (props: typeof slotProps & { formGroup: FormField[] }) => void;
} & {
  [Key in `group[${number}].append`]?: (props: typeof slotProps & { formGroup: FormField[] }) => void;
} & {
  [Key in `field[${keyof FormFieldToType<T>}].prepend`]?: (props: typeof slotProps & { field: FormField; formGroup: FormField[] }) => void;
  } & {
  [Key in `field[${keyof FormFieldToType<T>}].append`]?: (props: typeof slotProps & { field: FormField; formGroup: FormField[] }) => void;
}>();

const props = defineProps<{
  fields: MaybeGroupedArr<T>;
  loading?: boolean;
  completed?: boolean;
  /** Allow form data collection via Netlify. See https://docs.netlify.com/forms/setup/#html-forms */
  netlify?: boolean;
}>();
const { fields } = toRefs(props);
const emit = defineEmits<{ submit: [{ vuelidate: Validation; state: Record<string, any> }] }>();

const { vuelidate, formGroups, formFields, formState, formModels, formReset, buildFieldAttrs } =
  useForm(fields);

const onSubmit = () => {
  emit('submit', { vuelidate: vuelidate.value, state: formState.value });
};

const slotProps = {
  vuelidate,
  fields: formFields,
  groups: formGroups,
  state: formState,
  models: formModels,
  reset: formReset,
};

defineExpose({ ...slotProps });
</script>

<style lang="scss">
.FormSimple {
  position: relative;

  .form {
    display: flex;
    flex-direction: column;
    padding: 16px;

    &.completed {
      display: none;
    }
  }

  .form-step-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .controls {
    .VBtnPrimary,
    .VBtnSecondary {
      max-width: 120px;
    }
  }

  .loading-overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #8fc4c7;
    opacity: 0.42;
  }
}
</style>
