export function appendFormValue(
  formData: FormData,
  key: string,
  value: string | number | ReadonlyArray<number> | File | Blob | null | undefined,
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    formData.append(key, value.join(','));
    return;
  }

  formData.append(key, String(value));
}

export function buildUploadFormData(
  fields: Readonly<Record<string, string | number | ReadonlyArray<number> | File | Blob | null | undefined>>,
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    appendFormValue(formData, key, value);
  }

  return formData;
}
