import toNumber from 'lodash/toNumber';
import type { VCheckbox, VSelect, VTextField, VTextarea } from 'vuetify/lib/components/index.mjs';
import type { MaybeRef } from 'vue';

import {
  FormField,
  createFormFieldDefaults,
  useTypedForm,
  createScopedFormFieldHelper,
} from '@/../lib/typedForm';
import type { MaybeGroupedArr } from '~~/src/lib/typedForm/utils';

// Re-export commonly-used types for cleaner interface
export type { FormField, FormFieldToType } from '@/../lib/typedForm';

/** The source of truth of the form types available for use in `useForm` in this project */
export type FormFieldTypeMap = {
  text: { type: string; attrs: VTextField['$props'] & { required?: boolean } };
  textarea: { type: string; attrs: VTextarea['$props'] & { required?: boolean } };
  number: { type: number; attrs: Omit<VTextField['$props'], 'type'> & { required?: boolean } };
  select: { type: any; attrs: VSelect['$props'] & { required?: boolean } };
  checkbox: { type: boolean; attrs: VCheckbox['$props'] & { required?: boolean } };
};

export type FormFieldList<TName extends string = string> = MaybeGroupedArr<
  FormField<FormFieldTypeMap, any, TName>
>;

/**
 * Type helper for constructing a single instance of a form field {@link FormField},
 * scoped to form field types specific this project.
 */
export const createFormField = createScopedFormFieldHelper<FormFieldTypeMap>();

const undefIfFalsy = (v: any) => (v ? v : undefined);

// Definition of defaults for each of the custom field types we've defined
const formFieldDefaults = createFormFieldDefaults<FormFieldTypeMap>({
  text: {
    default: () => '',
    postProcess: (v: string, f) => (f.required ? v?.trim() : undefIfFalsy(v?.trim())),
  },
  textarea: {
    default: () => '',
    postProcess: (v: string, f) => (f.required ? v?.trim() : undefIfFalsy(v?.trim())),
  },
  number: { default: () => 0, postProcess: (v, _f) => toNumber(v.toString(10)) },
  select: { default: () => null, postProcess: (v: any, _f) => v },
  checkbox: { default: () => false, postProcess: (v: boolean, _f) => v },
});

/** Wrapper for {@link useTypedForm} that uses form field types specific to this project */
export const useForm = <T extends FormField<FormFieldTypeMap, any, TName>, TName extends string>(
  formFields: MaybeRef<(T | T[])[]>
) => {
  return useTypedForm<FormFieldTypeMap, T, TName>(formFields, formFieldDefaults);
};
