'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  formFieldContainerClassName,
  formFieldControlClassName,
  formFieldControlInnerClassName,
  formFieldLabelClassName,
} from '@/lib/form-field-styles';
import { cn } from '@/lib/utils';

interface IPasswordFieldProps {
  readonly name: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly title: string;
  readonly placeholder?: string;
  readonly autoComplete?: string;
  readonly error?: string;
  readonly onBlur?: () => void;
  readonly onChange: (value: string) => void;
  readonly value: string;
}

function PasswordField(props: IPasswordFieldProps) {
  const [isHidden, setIsHidden] = useState(true);
  const errorId = `${props.name}-error`;
  const hasError = Boolean(props.error);

  return (
    <div className={cn(formFieldContainerClassName, props.containerClassName)}>
      <Label htmlFor={props.name} className={formFieldLabelClassName}>
        {props.title}
      </Label>
      <div className="relative">
        <Input
          id={props.name}
          className={cn(formFieldControlClassName, 'pe-10', props.className)}
          value={props.value ?? ''}
          onChange={(event) => props.onChange(event.target.value)}
          onBlur={props.onBlur}
          name={props.name}
          type={isHidden ? 'password' : 'text'}
          placeholder={props.placeholder}
          autoComplete={props.autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute end-2 top-1/2 -translate-y-1/2"
          onClick={() => setIsHidden((prev) => !prev)}
        >
          {isHidden ? <i className="ki-outline ki-eye-slash" /> : <i className="ki-outline ki-eye" />}
        </Button>
      </div>
      {hasError ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}

export default PasswordField;
