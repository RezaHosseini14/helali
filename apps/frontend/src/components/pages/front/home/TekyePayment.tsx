'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';

interface ITekyePaymentForm {
  total: number;
}

function TekyePayment() {
  const [formValue, setFormValue] = useState<ITekyePaymentForm>({
    total: 0,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Input
        type="number"
        name="total"
        value={formValue.total}
        onChange={(event) =>
          setFormValue({
            total: Number(event.target.value) || 0,
          })
        }
      />
    </form>
  );
}

export default TekyePayment;
