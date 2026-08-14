'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import TextField from '@/components/global/fields/TextField';
import Panel from '@/components/global/Panel';
import { Button } from '@/components/ui/button';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { donateModel } from 'models/danate.model';

interface IDonateFormValue {
  name?: string;
  price: number | null;
}

function DonateBox() {
  const [formValue, setFormValue] = useState<IDonateFormValue>({
    name: '',
    price: null,
  });

  const handleInputChange = (name: keyof IDonateFormValue, value: string | number | null) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const error = getSchemaErrorMessage(donateModel, {
      price: formValue.price != null ? String(formValue.price) : '',
    });
    if (error) {
      toast.error(error);
      return;
    }
    try {
    } catch {
      toast.error('تصویر ذخیره نشد');
    }
  };

  return (
    <Panel title="کمک به تکیه" fill icon="ki-solid ki-dollar">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid grid-cols-12 gap-4 mb-4">
          <TextField
            name="price"
            title="مبلغ"
            containerClassName="col-span-12"
            value={formValue.price ?? ''}
            onChange={(value) =>
              handleInputChange('price', value === '' ? null : Number(value))
            }
            type="number"
          />
        </div>
        <Button type="submit" className="btn-mainColor w-full font-bold text-lg">
          پرداخت
        </Button>
      </form>
    </Panel>
  );
}

export default DonateBox;
