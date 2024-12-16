import { Schema } from 'rsuite';

export const loginModel = Schema.Model({
  username: Schema.Types.StringType().isRequired('نام کاربری الزامی است'),
  password: Schema.Types.StringType().isRequired('رمزعبور الزامی است'),
});
