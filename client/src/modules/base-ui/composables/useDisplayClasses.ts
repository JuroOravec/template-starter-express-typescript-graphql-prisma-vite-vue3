import mapValues from 'lodash/mapValues';
import type { MaybeRef } from 'vue';
import { useDisplay } from 'vuetify';

export const useDisplayClasses = <T extends Record<string, number>>(
  displayClasses: MaybeRef<T>,
  options?: MaybeRef<{
    dim?: 'height' | 'width';
    predicate?: (input: { size: number; value: number }) => boolean;
  }>
) => {
  const display = useDisplay();

  const getPixelRatio = () => globalThis.devicePixelRatio;

  // NOTE: Normalized values intentionally defined as separate variables
  // for debuggability.
  const normalizedWidth = computed(() => {
    return display.width.value / getPixelRatio();
  });
  const normalizedHeight = computed(() => {
    return display.height.value / getPixelRatio();
  });
  const normalizedSize = computed(() => {
    // Touch all refs to ensure computed value is properly updated
    const width = normalizedWidth.value;
    const height = normalizedHeight.value;
    const dim = unref(options)?.dim ?? 'width';
    return dim === 'width' ? width : height;
  });

  const classes = computed(() => {
    const currOptions = unref(options) ?? {};
    const predicate = currOptions.predicate ?? (({ size, value }) => size >= value);

    const displayedClasses = mapValues(unref(displayClasses), (pixels, key) => {
      return predicate({ size: normalizedSize.value, value: pixels });
    });

    return displayedClasses;
  });

  return { classes, normalized: { width: normalizedWidth, height: normalizedHeight } };
};
