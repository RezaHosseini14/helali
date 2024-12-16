import { Schema } from 'rsuite';

export const createVideoModel = Schema.Model({
  title: Schema.Types.StringType().isRequired('عنوان فایل صوتی الزامی است'),
  text: Schema.Types.StringType(),
});
