//@ts-nocheck
'use client';
import { forwardRef, Ref } from 'react';
import { Form, Input, InputProps } from 'rsuite';

type TextAreaFieldType = {
  title: string;
  name: string;
  className?: string;
  containerClassName?: string;
  rows?: number | undefined;
  placeholder?: string;
  onChange: (value: any) => void;
  value: any;
};

const Textarea = forwardRef((props: InputProps, ref: Ref<HTMLTextAreaElement>) => (
  <Input {...props} as="textarea" ref={ref} />
));

function TexAreaField(props: TextAreaFieldType) {
  return (
    <Form.Group className={props.containerClassName} controlId="textarea-1">
      <Form.ControlLabel className="font-semibold text-base text-spGreen">{props.title}</Form.ControlLabel>

      <Form.Control
        classPrefix="w-full"
        className={`h-10 text-lg border !border-mainColor w-full ${props.className && props.className}`}
        value={props.value}
        onChange={(v) => props.onChange(v)}
        rows={props.rows}
        name={props.name}
        accepter={Textarea}
        placeholder={props.placeholder}
      />
    </Form.Group>
  );
}

export default TexAreaField;
