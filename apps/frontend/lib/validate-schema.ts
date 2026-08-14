import type { ZodType } from 'zod';

export type TSchemaFieldErrors<TField extends string = string> = Partial<Record<TField, string>>;

export function validateWithSchema<T>(schema: ZodType<T>, value: unknown): value is T {
  const result = schema.safeParse(value);
  return result.success;
}

export function getSchemaErrorMessage(schema: ZodType, value: unknown): string | null {
  const result = schema.safeParse(value);
  if (result.success) {
    return null;
  }
  return result.error.issues[0]?.message ?? 'مقدار وارد شده معتبر نیست';
}

export function getSchemaFieldErrors<TField extends string>(
  schema: ZodType,
  value: unknown,
): TSchemaFieldErrors<TField> {
  const result = schema.safeParse(value);
  if (result.success) {
    return {};
  }

  const fieldErrors: TSchemaFieldErrors<TField> = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string' || fieldErrors[field as TField]) {
      continue;
    }

    fieldErrors[field as TField] = issue.message;
  }

  return fieldErrors;
}
