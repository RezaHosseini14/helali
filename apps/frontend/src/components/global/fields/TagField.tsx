'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formFieldContainerClassName,
  formFieldControlInnerClassName,
  formFieldLabelClassName,
} from '@/lib/form-field-styles';
import { cn } from '@/lib/utils';

interface ITagOption {
  readonly label: string;
  readonly value: string | number;
}

interface ITagFieldProps<T extends string | number = string | number> {
  readonly name: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly title: string;
  readonly data: ITagOption[];
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onChange: (value: T[]) => void;
  readonly value: T[];
}

function TagField<T extends string | number = string | number>(props: ITagFieldProps<T>) {
  const [draft, setDraft] = useState('');
  const selected = props.value ?? [];

  const labelByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of props.data) {
      map.set(String(item.value), item.label);
    }
    return map;
  }, [props.data]);

  const addValue = (raw: string) => {
    const next = raw.trim();
    if (!next) {
      return;
    }
    const matched = props.data.find(
      (item) => String(item.value) === next || item.label === next,
    );
    const valueToAdd = (matched ? matched.value : next) as T;
    if (selected.some((item) => String(item) === String(valueToAdd))) {
      setDraft('');
      return;
    }
    props.onChange([...selected, valueToAdd]);
    setDraft('');
  };

  const removeValue = (target: T) => {
    props.onChange(selected.filter((item) => String(item) !== String(target)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addValue(draft);
    }
  };

  return (
    <div className={cn('relative', formFieldContainerClassName, props.containerClassName)}>
      <Label className={formFieldLabelClassName}>{props.title}</Label>
      <div
        className={cn(
          formFieldControlInnerClassName,
          'flex flex-wrap items-center gap-2',
          props.className,
          (props.disabled || props.loading) && 'pointer-events-none opacity-50',
        )}
      >        {selected.map((item) => (
          <Badge key={String(item)} variant="secondary" className="gap-1">
            {labelByValue.get(String(item)) ?? String(item)}
            <button
              type="button"
              className="ms-1 text-xs"
              onClick={() => removeValue(item)}
              aria-label="حذف"
            >
              ×
            </button>
          </Badge>
        ))}
        <Input
          name={props.name}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addValue(draft)}
          className="h-7 min-w-28 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          placeholder="افزودن..."
          disabled={props.disabled || props.loading}
          list={`${props.name}-suggestions`}
        />
        <datalist id={`${props.name}-suggestions`}>
          {props.data.map((item) => (
            <option key={String(item.value)} value={item.label} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

export default TagField;
