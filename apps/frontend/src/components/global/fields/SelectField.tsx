'use client';

import { useMemo } from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formFieldContainerClassName,
  formFieldControlClassName,
  formFieldLabelClassName,
} from '@/lib/form-field-styles';
import { cn } from '@/lib/utils';

interface ISelectOption {
  readonly label: string;
  readonly value: string | number;
}

const CLEAR_SELECT_VALUE = '__clear__';

interface ISelectFieldProps {
  readonly name: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly title: string;
  readonly data: ISelectOption[];
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly nullable?: boolean;
  readonly emptyLabel?: string;
  readonly placeholder?: string;
  readonly alignItemWithTrigger?: boolean;
  readonly value?: string | number | null;
  readonly onChange?: (value: string | null) => void;
}

function SelectField(props: ISelectFieldProps) {
  const hasValue = props.value != null && props.value !== '';

  const selectItems = useMemo(
    () =>
      props.data.map((item) => ({
        label: item.label,
        value: String(item.value),
      })),
    [props.data],
  );

  return (
    <div className={cn(formFieldContainerClassName, props.containerClassName)}>
      <Label className={formFieldLabelClassName}>{props.title}</Label>
      <Select
        items={selectItems}
        value={hasValue ? String(props.value) : null}
        onValueChange={(value) => {
          if (!value || value === CLEAR_SELECT_VALUE) {
            props.onChange?.(null);
            return;
          }

          props.onChange?.(value);
        }}
        disabled={props.disabled || props.loading}
        name={props.name}
      >
        <SelectTrigger className={cn(formFieldControlClassName, props.className)}>
          <SelectValue placeholder={props.placeholder ?? 'انتخاب کنید'} />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={props.alignItemWithTrigger ?? false}>
          <SelectGroup>
            {props.nullable && hasValue ? (
              <SelectItem value={CLEAR_SELECT_VALUE}>{props.emptyLabel ?? 'بدون انتخاب'}</SelectItem>
            ) : null}
            {props.data.map((item) => (
              <SelectItem
                key={String(item.value)}
                value={String(item.value)}
                label={item.label}
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectField;
