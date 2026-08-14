'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  formFieldContainerClassName,
  formFieldLabelClassName,
} from '@/lib/form-field-styles';
import { cn } from '@/lib/utils';

interface ITexAreaFieldProps {
  readonly title: string;
  readonly name: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly rows?: number;
  readonly placeholder?: string;
  readonly onChange: (value: string) => void;
  readonly value: string;
}

function TexAreaField(props: ITexAreaFieldProps) {
  return (
    <div className={cn(formFieldContainerClassName, props.containerClassName)}>
      <Label className={formFieldLabelClassName}>{props.title}</Label>
      <Textarea
        className={cn(
          'min-h-24 w-full rounded-xl border-border/80 bg-background/60 text-lg',
          props.className,
        )}
        value={props.value ?? ''}
        onChange={(event) => props.onChange(event.target.value)}
        rows={props.rows}
        name={props.name}
        placeholder={props.placeholder}
      />
    </div>
  );
}

export default TexAreaField;
