import { ValidationRule, useVuelidate } from '@vuelidate/core';
import type { MaybeRef } from 'vue';

import type { Flattened } from '@/../utils/types';
import { MaybeGroupedArr, normalizeToChunks } from './utils';

////////////////////
// TYPES
////////////////////

type OneOrMaybeGroupedArr<T> = T | MaybeGroupedArr<T>;

/**
 * Definition of a single _type_ of a field.
 *
 * NOTE: This is different from {@link FormField}. Think of it like this,
 * {@link FormFieldDef} is like a class, whereas {@link FormField} is like
 * a class instance.
 */
export interface FormFieldDef<T = any, TAttrs extends object = object> {
  type: T;
  attrs: TAttrs;
}

/**
 * Map that describes what _kind_ of fields are available to the form,
 * along with metadata like the field value type and possible input attributes.
 */
export type FormFieldDefMap<T extends Record<string, FormFieldDef> = Record<string, FormFieldDef>> =
  T;

/**
 * Given a single definition of a _type_ of a form field, {@link FormFieldDef},
 * this type provides typing for the implementation defaults.
 */
export interface FormFieldDefDefaults<
  T extends FormFieldDef,
  Key extends string | number | symbol
> {
  default: () => T['type'];
  postProcess: (v: T['type'], f: FormField<Record<Key, T>, Key, any>) => T['type'];
}

/**
 * Given a map of definitions of _types_ of form fields, {@link FormFieldDefMap},
 * this type provides typing for the mapping of implementation defaults.
 */
export type FormFieldDefMapDefaults<TFieldMap extends FormFieldDefMap> = {
  [Key in keyof TFieldMap]: FormFieldDefDefaults<TFieldMap[Key], Key>;
};

/**
 * Description of a single instance of a form field.
 *
 * NOTE: The type of the field's value, as well as input options, are determined
 * by the field's `type` property. The options for `type` property are determined
 * by the {@link FormFieldDefMap}.
 */
export interface FormField<
  TFieldMap extends FormFieldDefMap = FormFieldDefMap,
  TType extends keyof TFieldMap = keyof TFieldMap,
  TName extends string = string
> {
  name: TName;
  type: TType;
  required?: boolean;
  default?: () => TFieldMap[TType]['type'];
  attrs?: TFieldMap[TType]['attrs'] & { onBlur?: () => any };
  hint?: string;
  postProcess?: (
    v: TFieldMap[TType]['type'],
    field: FormField<TFieldMap, TType, any>
  ) => TFieldMap[TType]['type'];
  rules: Record<string, ValidationRule<TFieldMap[TType]['type']>>;
}

type ExtractFormFieldMap<T extends Pick<FormField<any, any, any>, 'type'>> = T extends FormField<
  infer U,
  any
>
  ? U
  : never;

/** Given a form field, return the type of its value */
export type ExtractFormFieldValue<T extends Pick<FormField<any, any, any>, 'type'>> =
  ExtractFormFieldMap<T>[T['type']]['type'];

/**
 * Given a (possibly grouped) list of form fields ({@link MaybeGroupedArr}),
 * return a mapping from field name to type of field value.
 *
 * Also see {@link FormFieldToRefType}.
 *
 * Example:
 * ```ts
 * const fields = [
 *   { type: 'number', name: 'myField', ... },
 *   { type: 'checkbox', name: 'myBox', ... },
 *   ...
 * ];
 *
 * const formState: FormFieldToType<typeof fields>;
 * // formState will have type:
 * // {
 * //    myField: number;
 * //    myBox: boolean;
 * // }
 * ```
 */
export type FormFieldToType<
  T extends OneOrMaybeGroupedArr<Pick<FormField<any, any, any>, 'name' | 'type'>>
> = {
  [Key in Flattened<T>['name']]:
    | ExtractFormFieldValue<Extract<Flattened<T>, FormField<any, any, Key>>>
    | undefined;
};

/**
 * Given a (possibly grouped) list of form fields ({@link MaybeGroupedArr}),
 * return a mapping from field name to type of field value wrapped in Vue's {@link ref}.
 *
 * Also see {@link FormFieldToType}.
 *
 * Example:
 * ```ts
 * const fields = [
 *   { type: 'number', name: 'myField', ... },
 *   { type: 'checkbox', name: 'myBox', ... },
 *   ...
 * ];
 *
 * const formState: FormFieldToType<typeof fields>;
 * // formState will have type:
 * // {
 * //    myField: Ref<number>;
 * //    myBox: Ref<boolean>;
 * // }
 * ```
 */
export type FormFieldToRefType<
  T extends OneOrMaybeGroupedArr<Pick<FormField<any, any, any>, 'name' | 'type'>>
> = {
  [Key in Flattened<T>['name']]: Ref<
    ExtractFormFieldValue<Extract<Flattened<T>, FormField<any, any, Key>>> | undefined
  >;
};

/**
 * Type helper for constructing mapping that describes default behaviour for individual
 * field _types_ {@link FormFieldDef}.
 */
export const createFormFieldDefaults = <TFieldMap extends FormFieldDefMap>(
  d: FormFieldDefMapDefaults<TFieldMap>
) => d;

/** Type helper for constructing a single instance of a form field {@link FormField}. */
export const createFormField = <
  TName extends string = string,
  TFieldMap extends FormFieldDefMap = FormFieldDefMap,
  TType extends keyof TFieldMap = keyof TFieldMap
>(
  type: TType,
  field: Omit<FormField<TFieldMap, keyof TFieldMap, TName>, 'type'>
) => ({ type, ...field });

/** Creates a {@link createFormField} function that has pre-defined `TFieldMap` */
export const createScopedFormFieldHelper = <
  TFieldMap extends FormFieldDefMap = FormFieldDefMap
>() => {
  const createFormField = <
    TName extends string = string,
    TType extends keyof TFieldMap = keyof TFieldMap
  >(
    type: TType,
    field: Omit<FormField<TFieldMap, keyof TFieldMap, TName>, 'type'>
  ) => ({ type, ...field });

  return createFormField;
};

////////////////////
// COMPOSABLE
////////////////////

/**
 * Internal helper - Given field definition mapping and a field, construct
 * the field's default value.
 */
const createFieldDefault = <
  TFieldMap extends FormFieldDefMap,
  T extends FormField<TFieldMap, keyof TFieldMap, any>
>(
  field: T,
  formFieldDefaults: FormFieldDefMapDefaults<TFieldMap>
): ExtractFormFieldMap<T>[T['type']]['type'] => {
  const factory = field.default ?? formFieldDefaults[field.type].default;
  return factory();
};

/**
 * Given a list of form fields and defaults implementation, this composable manages
 * validation, final state of the form, and also interpolates the type of of the form data.
 */
export const useTypedForm = <
  TFieldMap extends FormFieldDefMap,
  T extends FormField<TFieldMap, any, TName>,
  TName extends string
>(
  formFields: MaybeRef<(T | T[])[]>,
  formFieldDefaults: MaybeRef<FormFieldDefMapDefaults<TFieldMap>>
) => {
  // This one is grouped and used for rendering
  const formGroups = computed(() => normalizeToChunks(unref(formFields)));
  // This one is flat and used for preparing validation
  const flatFormFields = computed(() => formGroups.value.flat(1));

  // Form fields by key for easier access
  const formfieldsByName = computed(() =>
    flatFormFields.value.reduce<Record<TName, FormField<any, any, TName>>>((agg, formField) => {
      agg[formField.name] = formField;
      return agg;
    }, {} as any)
  );

  // Define reactive form fields that capture the raw input values
  const formModels = ref({} as FormFieldToRefType<T>);
  // NOTE: We need to cast, otherwise the value is wrapped in `UnwrapRef`
  const getFormModels = () => formModels.value as FormFieldToRefType<T>;

  const onFormFieldsChange = (newFlatFormFields: T[]) => {
    const oldFormModels = getFormModels();
    const newFormModels = newFlatFormFields.reduce<FormFieldToRefType<T>>((agg, formField) => {
      agg[formField.name] =
        // Reuse the same refs for fields that didn't change
        oldFormModels[formField.name] ??
        // or create them anew
        ref(createFieldDefault(formField, unref(formFieldDefaults)));
      return agg;
    }, {} as any);

    formModels.value = newFormModels as any;
    // The downstream computed values are triggered by changes to the refs on formModels.
    // Since some of the refs may be removed, we want to trigger them, so the computed
    // values will be updated to start using the newly-assigned refs.
    Object.values(oldFormModels).forEach((r) => triggerRef(r as Ref));
  };

  // NOTE: We need the old state of formModels to be able to update the fields
  // Hence it needs to be updated via `watch` instead of `computed`.
  watch(flatFormFields, (newFields) => onFormFieldsChange(newFields), { immediate: true });

  // Post-processed form state that will be validated
  const formState = computed(() => {
    const processedData = Object.entries(getFormModels()).reduce<FormFieldToType<T>>(
      (agg, [key, refVal]) => {
        const formField = formfieldsByName.value[key as TName];
        const mapper: (v: any, f: any) => any = formField.postProcess ?? unref(formFieldDefaults)[formField.type]?.postProcess; // prettier-ignore
        const preValue = unref(refVal);
        agg[key as TName] = mapper ? mapper(preValue, formField) : preValue;
        return agg;
      },
      {} as any
    );
    return processedData;
  });

  // Rules for form validation
  const formRules = computed(() =>
    flatFormFields.value.reduce<Record<TName, Record<string, ValidationRule>>>((agg, formField) => {
      agg[formField.name] = formField.rules;
      return agg;
    }, {} as any)
  );

  const vuelidate = useVuelidate(formRules, formState);

  const formReset = () => {
    Object.entries(getFormModels()).forEach(([key, model]) => {
      const formField = formfieldsByName.value[key as TName];
      (model as Ref).value = createFieldDefault(formField, unref(formFieldDefaults));
    });
    vuelidate.value.$reset();
  };

  const buildFieldAttrs = (field: T): any => ({
    type: field.type,
    name: field.name,
    hint: field.hint,
    ...field.attrs,
    error: unref(vuelidate.value[field.name].$errors[0]?.$message),
    onBlur: () => vuelidate.value[field.name].$validate(),
    modelValue: getFormModels()[field.name].value,
    'onUpdate:modelValue': (val: any) => (getFormModels()[field.name].value = val),
  });

  return {
    formFields: flatFormFields,
    formGroups,
    formModels,
    formState,
    formRules,
    formReset,
    vuelidate,
    buildFieldAttrs,
  };
};
