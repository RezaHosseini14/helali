import { Schema } from 'rsuite';

export const donateModel = Schema.Model({
  price: Schema.Types.StringType().isRequired('مبلغ الزامی است'),
});
