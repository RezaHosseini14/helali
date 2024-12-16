import { Schema } from 'rsuite';

export const createGalleryModel = Schema.Model({
  desc: Schema.Types.StringType().isRequired('توضیحات فایل صوتی الزامی است'),
});
