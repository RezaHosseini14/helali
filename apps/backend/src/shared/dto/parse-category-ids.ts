/**
 * Normalizes multipart/form-data category fields into number[].
 * FormData may send "1", "1,2", ["1","2"], or a single number after implicit conversion.
 */
export function parseCategoryIdsTransform({ value }: { value: unknown }): number[] {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return [Math.trunc(value)];
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number.parseInt(item, 10))
      .filter((item) => Number.isFinite(item));
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === 'number' && Number.isFinite(item)) {
          return [Math.trunc(item)];
        }

        if (typeof item === 'string') {
          return item
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => Number.parseInt(part, 10));
        }

        return [];
      })
      .filter((item) => Number.isFinite(item));
  }

  return [];
}
