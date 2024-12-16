//@ts-nocheck
'use client';
import { Form, InputPicker } from 'rsuite';
type SelectFieldType = {
  name: string;
  className?: string;
  containerClassName?: string;
  title: string;
  data: any[];
  disabled?: boolean;
  loading?: boolean;
};

function SelectField(props: SelectFieldType) {
  return (
    <Form.Group className={props.containerClassName}>
      <Form.ControlLabel className="font-semibold text-base text-spGreen">{props.title}</Form.ControlLabel>
      <Form.Control
        className={`h-10 text-lg border border-spGreen w-full ${props.className && props.className}`}
        classPrefix="w-full"
        name={props.name}
        autoComplete="off"
        accepter={InputPicker}
        data={props.data}
        disabled={props.disabled}
        loading={props.loading}
      />
    </Form.Group>
  );
}

export default SelectField;
