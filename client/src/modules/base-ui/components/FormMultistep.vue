<template>
  <div class="FormMultistep">
    <v-form
      class="form"
      :class="{ completed }"
      v-bind="$attrs"
      :data-netlify="netlify"
      @submit.prevent="onSubmit"
    >
      <v-carousel
        v-model="formStep"
        :continuous="false"
        :show-arrows="false"
        hide-delimiters
        progress="primary"
        height="inherit"
        class="pa-4 d-flex flex-column"
        style="gap: 40px"
      >
        <slot name="prepend" v-bind="{ ...slotProps }" />

        <v-carousel-item
          v-for="(formGroup, index) in formGroups"
          :key="formGroup.map((f) => f.name).join(',')"
          eager
          :content-class="`form-step-content form-group-${index}`"
        >
          <slot :name="`group[${index}].prepend`" v-bind="{ formGroup, ...slotProps }" />

          <template v-for="field in formGroup" :key="field.name">
            <slot
              :name="`field[${field.name}].prepend`"
              v-bind="{ field, formGroup, ...slotProps }"
            />
            <FormField v-bind="buildFieldAttrs(field)" />
            <slot
              :name="`field[${field.name}].append`"
              v-bind="{ field, formGroup, ...slotProps }"
            />
          </template>

          <slot :name="`group[${index}].append`" v-bind="{ formGroup, ...slotProps }" />
        </v-carousel-item>

        <slot name="append" v-bind="{ ...slotProps }" />
        <slot name="controls" v-bind="{ ...slotProps }">
          <div class="controls py-6">
            <div class="controls__actions d-flex justify-space-between">
              <slot name="action-prepend" v-bind="{ ...slotProps }" />
              <VBtnSecondary :disabled="!hasPrevStep" @click="goPrevStep"> Prev </VBtnSecondary>
              <VBtnPrimary v-if="hasNextStep" @click="goNextStep"> Next </VBtnPrimary>
              <VBtnPrimary v-else :disabled="vuelidate.$invalid" type="submit">
                Submit
              </VBtnPrimary>
              <slot name="action-append" v-bind="{ ...slotProps }" />
            </div>
            <div
              v-if="!hasNextStep && vuelidate.$errors.length"
              class="controls__error text-caption global-form-caption global-form-error text-right"
            >
              Please fix {{ vuelidate.$errors.length }} error(s) before submission.
            </div>
          </div>
        </slot>
      </v-carousel>
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

const { vuelidate, formGroups, formFields, formState, formModels, formReset, buildFieldAttrs } = useForm(fields);

const onSubmit = () => {
  emit('submit', { vuelidate: vuelidate.value, state: formState.value });
};

/////////////////////////
// STEPPER + FROM STATE
/////////////////////////

const formStep = ref<number>(0);
const formStepsTotal = computed(() => formGroups.value?.length ?? 0);

const hasPrevStep = computed(() => formStep.value > 0);
const hasNextStep = computed(() => formStep.value < formStepsTotal.value - 1);
const goPrevStep = () => (formStep.value > 0 ? formStep.value-- : undefined);
const goNextStep = () => {
  if (formStep.value < formStepsTotal.value - 1) formStep.value++;
  // Validate form when we hit the last page
  if (formStep.value === formStepsTotal.value - 1) vuelidate.value.$validate();
};

const reset = () => {
  formReset();
  formStep.value = 0;
};

const slotProps = {
  vuelidate,
  fields: formFields,
  groups: formGroups,
  state: formState,
  models: formModels,
  hasPrevStep,
  hasNextStep,
  goPrevStep,
  goNextStep,
  reset,
};

defineExpose({ ...slotProps });
</script>

<style lang="scss">
.FormMultistep {
  position: relative;

  .form {
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
