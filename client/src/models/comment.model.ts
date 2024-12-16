import { Schema } from 'rsuite';

export const commentModel = Schema.Model({
  author: Schema.Types.StringType().isRequired('نام و نام‌خانوادگی الزامی است'),
  text: Schema.Types.StringType().isRequired('دیدگاه الزامی است'),
});
