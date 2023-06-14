export type MaybeGroupedArr<T> = (T | T[])[];

/**
 * Normalize fields into groups
 * ```js
 * // from
 * [a, [b, c, d], e, f, [g, h]]
 * // to
 * [[a], [b, c, d], [e, f], [g, h]]
 * ```
 */
export const normalizeToChunks = <T>(arr: MaybeGroupedArr<T>): T[][] => {
  const chunks: T[][] = [];
  let currChunk: T[] | null = null;

  for (const item of arr) {
    if (Array.isArray(item)) {
      // Flush the currChunk
      if (currChunk?.length) {
        chunks.push(currChunk);
        currChunk = null;
      }
      // Push nested array
      chunks.push(item);
      continue;
    }
    if (!currChunk?.length) {
      currChunk = [];
    }
    currChunk.push(item);
  }
  // Flush remaining chunk
  if (currChunk?.length) {
    chunks.push(currChunk);
  }
  return chunks;
};
