import { Schema } from 'rsuite';

export const createAudioModel = Schema.Model({
  title: Schema.Types.StringType().isRequired('عنوان فایل صوتی الزامی است'),
  text: Schema.Types.StringType(),
});
