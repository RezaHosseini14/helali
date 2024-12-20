import { Schema } from 'rsuite';
import { categoryType } from 'types/category.type';

export const registerModel = Schema.Model({
  username: Schema.Types.StringType().isRequired('نام کاربری الزامی است'),
  password: Schema.Types.StringType().isRequired('رمز عبور الزامی است'),
  confirmPassword: Schema.Types.StringType().isRequired('تکرار رمز عبور الزامی است'),
  first_name: Schema.Types.StringType().isRequired('نام الزامی است'),
  last_name: Schema.Types.StringType().isRequired('نام خانوادگی الزامی است'),
  phone_number: Schema.Types.StringType().isRequired('تلفن همراه الزامی است'),
  age: Schema.Types.NumberType().min(18, 'سن باید حداقل 18 باشد'),
  email: Schema.Types.StringType().isEmail('ایمیل وارد شده معتبر نیست'),
});
