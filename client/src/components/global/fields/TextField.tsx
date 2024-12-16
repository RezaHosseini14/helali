'use client';
import { Form } from 'rsuite';

type TextFieldType = {
  name: string;
  className?: string;
  containerClassName?: string;
  title: string;
  type?: string;
  placeholder?: string;
  onChange: (value: any) => void; // تغییر نوع onChange
  value: any;
};

function TextField(props: TextFieldType) {
  return (
    <Form.Group className={props.containerClassName}>
      <Form.ControlLabel className="font-semibold text-base text-spGreen">{props.title}</Form.ControlLabel>
      <Form.Control
        className={`h-10 text-lg border !border-mainColor w-full ${props.className && props.className}`}
        classPrefix="w-full"
        value={props.value}
        onChange={(v) => props.onChange(v)}
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
      />
    </Form.Group>
  );
}

export default TextField;
