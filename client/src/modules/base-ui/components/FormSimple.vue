<template>
  <div class="FormSimple">
    <v-form
      v-show="!completed"
      v-bind="$attrs"
      @submit.prevent="onSubmit"
      class="pa-4 d-flex flex-column"
      style="gap: 20px"
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
          <VBtnPrimary :disabled="vuelidate.$invalid" type="submit"> Submit </VBtnPrimary>
          <div
            v-if="vuelidate.$errors.length"
            class="text-caption global-form-caption global-form-error"
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

<script setup lang="ts">
import type { Validation } from '@vuelidate/core';

import type { FormField } from '../composables/useForm';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  fields: (FormField<any> | FormField<any>[])[];
  loading?: boolean;
  completed?: boolean;
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
