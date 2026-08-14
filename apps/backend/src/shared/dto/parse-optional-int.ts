import { BadRequestException } from '@nestjs/common';

export function parseOptionalIntTransform({ value }: { value: unknown }): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '' || value === 'null') {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('شناسه رسانه مرتبط نامعتبر است');
  }

  return parsed;
}
