'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formFieldContainerClassName,
  formFieldControlClassName,
  formFieldLabelClassName,
} from '@/lib/form-field-styles';
import { cn } from '@/lib/utils';

interface ITextFieldProps {
  readonly name: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly title: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly autoComplete?: string;
  readonly error?: string;
  readonly onBlur?: () => void;
  readonly onChange: (value: string) => void;
  readonly value: string | number | null | undefined;
}

function TextField(props: ITextFieldProps) {
  const errorId = `${props.name}-error`;
  const hasError = Boolean(props.error);

  return (
    <div className={cn(formFieldContainerClassName, props.containerClassName)}>
      <Label htmlFor={props.name} className={formFieldLabelClassName}>
        {props.title}
      </Label>
      <Input
        id={props.name}
        className={cn(formFieldControlClassName, props.className)}
        value={props.value ?? ''}
        onChange={(event) => props.onChange(event.target.value)}
        onBlur={props.onBlur}
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
      />
      {hasError ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

export default TextField;
