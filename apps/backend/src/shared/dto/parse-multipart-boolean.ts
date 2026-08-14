import type { TransformFnParams } from 'class-transformer';

/**
 * Parses multipart/form-data booleans safely.
 *
 * With ValidationPipe `enableImplicitConversion`, class-transformer runs
 * `Boolean(value)` before `@Transform`. That turns the string `"false"` into
 * `true`. Always read the raw field from `obj` first.
 */
export function parseMultipartBoolean({
  value,
  obj,
  key,
}: TransformFnParams): boolean | undefined {
  const raw =
    obj && typeof obj === 'object' && key in obj
      ? (obj as Record<string, unknown>)[key]
      : value;

  if (raw === undefined || raw === null || raw === '') {
    return undefined;
  }

  if (typeof raw === 'boolean') {
    return raw;
  }

  if (typeof raw === 'number') {
    return raw === 1;
  }

  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }

  return false;
}

export function parseRequiredMultipartBoolean(params: TransformFnParams): boolean {
  return parseMultipartBoolean(params) === true;
}
