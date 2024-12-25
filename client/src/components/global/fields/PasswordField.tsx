'use client';
import { useState } from 'react';
import { Button, Form } from 'rsuite';

type PasswordFieldType = {
  name: string;
  className?: string;
  containerClassName?: string;
  title: string;
  type?: string;
  placeholder?: string;
  onChange: (value: any) => void;
  value: any;
};

function PasswordField(props: PasswordFieldType) {
  const [show, setShow] = useState<boolean>(true);

  const handleToggleShow = () => {
    setShow((prev) => !prev);
  };
  return (
    <Form.Group className={props.containerClassName}>
      <Form.ControlLabel className="font-semibold text-base text-spGreen">{props.title}</Form.ControlLabel>
      <div className="relative">
        <Form.Control
          className={`h-10 text-lg border !border-mainColor w-full ${props.className && props.className}`}
          classPrefix="w-full"
          value={props.value}
          onChange={(v) => props.onChange(v)}
          name={props.name}
          type={show ? 'password' : 'text'}
          placeholder={props.placeholder}
        />
        <Button
          className="size-8 absolute left-2 top-1/2 -translate-y-1/2"
          appearance="default"
          onClick={handleToggleShow}
        >
          {show ? <i className="ki-outline ki-eye-slash"></i> : <i className="ki-outline ki-eye"></i>}
        </Button>
      </div>
    </Form.Group>
  );
}

export default PasswordField;
