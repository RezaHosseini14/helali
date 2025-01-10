import TextField from '@/components/global/fields/TextField';
import Panel from '@/components/global/Panel';
import { donateModel } from 'models/danate.model';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Form } from 'rsuite';
type donateFormValue = {
  name?: string;
  price: number | null;
};

function DonateBox() {
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<donateFormValue>({
    name: '',
    price: null,
  });

  const handleInputChange = (name: keyof donateFormValue, value: any) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formRef.current.check()) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }
    try {
    } catch (error) {
      toast.error('تصویر ذخیره نشد');
    }
  };
  return (
    <Panel title="کمک به تکیه" fill icon="ki-solid ki-dollar">
      <Form model={donateModel} ref={formRef} formValue={formValue}>
        <div className="grid grid-cols-12 gap-4 mb-4">
          <TextField
            name="price"
            title="مبلغ"
            containerClassName="col-span-12"
            value={formValue.price}
            onChange={(value: number | null) => handleInputChange('price', value)}
          />
        </div>
        <Button appearance="primary" className="btn-mainColor font-bold text-lg" onClick={handleSubmit} block>
          پرداخت
        </Button>
      </Form>
    </Panel>
  );
}

export default DonateBox;
