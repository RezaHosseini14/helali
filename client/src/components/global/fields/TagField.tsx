//@ts-nocheck
'use client';
import { Form, TagPicker } from 'rsuite';

type SelectFieldType = {
  name: string;
  className?: string;
  containerClassName?: string;
  title: string;
  data: { label: string; value: any }[];
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: any) => void; // تغییر نوع onChange
  value: any;
};

function TagField(props: SelectFieldType) {
  return (
    <Form.Group className={`${props.containerClassName} relative`}>
      <Form.ControlLabel className="font-semibold text-base text-spGreen">{props.title}</Form.ControlLabel>
      <TagPicker
        className={`h-10 text-lg border border-mainColor w-full ${props.className ? props.className : ''}`}
        name={props.name}
        data={props.data}
        disabled={props.disabled}
        creatable
        menuStyle={{ width: '300px' }}
        loading={props.loading}
        value={props.value}
        onChange={(v) => props.onChange(v)}
      />
    </Form.Group>
  );
}

export default TagField;
