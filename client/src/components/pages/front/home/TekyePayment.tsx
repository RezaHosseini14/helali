import React, { useState } from "react";
import { Form, InputNumber } from "rsuite";

function TekyePayment() {
  type TekyePaymentFormType = {
    total: number;
  };
  const [formValue, setFormValue] = useState<TekyePaymentFormType>({
    total: 0,
  });
  return (
    <Form formValue={formValue}>
    </Form>
  );
}

export default TekyePayment;
