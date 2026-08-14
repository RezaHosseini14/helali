'use client';

import { useCallback, useState, type FormEvent } from 'react';

import { getSchemaFieldErrors, type TSchemaFieldErrors } from '@/lib/validate-schema';

import type { ZodType } from 'zod';

interface IUseZodFormOptions<TValues extends Record<string, string>> {
  readonly schema: ZodType<TValues>;
  readonly defaultValues: TValues;
}

interface IUseZodFormResult<TValues extends Record<string, string>> {
  readonly values: TValues;
  readonly setFieldValue: (name: keyof TValues & string, value: string) => void;
  readonly handleBlur: (name: keyof TValues & string) => void;
  readonly submit: (
    onValid: (values: TValues) => void | Promise<void>,
  ) => (event: FormEvent<HTMLFormElement>) => void;
  readonly getFieldError: (name: keyof TValues & string) => string | undefined;
}

export function useZodForm<TValues extends Record<string, string>>(
  options: IUseZodFormOptions<TValues>,
): IUseZodFormResult<TValues> {
  const { schema, defaultValues } = options;
  const [values, setValues] = useState<TValues>(defaultValues);
  const [errors, setErrors] = useState<TSchemaFieldErrors<keyof TValues & string>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TValues & string, boolean>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setFieldError = useCallback(
    (name: keyof TValues & string, nextValues: TValues) => {
      const fieldError = getSchemaFieldErrors<keyof TValues & string>(schema, nextValues)[name];
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    },
    [schema],
  );

  const setFieldValue = useCallback(
    (name: keyof TValues & string, value: string) => {
      const nextValues = { ...values, [name]: value };
      setValues(nextValues);

      if (isSubmitted || touched[name]) {
        setFieldError(name, nextValues);
      }
    },
    [isSubmitted, setFieldError, touched, values],
  );

  const handleBlur = useCallback(
    (name: keyof TValues & string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      setFieldError(name, values);
    },
    [setFieldError, values],
  );

  const submit = useCallback(
    (onValid: (values: TValues) => void | Promise<void>) => {
      return (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitted(true);

        const parsed = schema.safeParse(values);
        if (!parsed.success) {
          const fieldErrors = getSchemaFieldErrors<keyof TValues & string>(schema, values);
          setErrors(fieldErrors);

          const firstInvalidField = (Object.keys(fieldErrors) as Array<keyof TValues & string>).find(
            (field) => fieldErrors[field],
          );
          if (firstInvalidField) {
            document.getElementById(firstInvalidField)?.focus();
          }
          return;
        }

        setErrors({});
        void onValid(parsed.data);
      };
    },
    [schema, values],
  );

  const getFieldError = useCallback(
    (name: keyof TValues & string): string | undefined => {
      if (!isSubmitted && !touched[name]) {
        return undefined;
      }

      return errors[name];
    },
    [errors, isSubmitted, touched],
  );

  return {
    values,
    setFieldValue,
    handleBlur,
    submit,
    getFieldError,
  };
}
