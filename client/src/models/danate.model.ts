import { Schema } from 'rsuite';

export const donateModel = Schema.Model({
  name: Schema.Types.StringType(),
  price: Schema.Types.StringType().isRequired('مبلغ الزامی است'),
});
