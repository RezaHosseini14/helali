import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  first_name: string;
  @Prop()
  last_name: string;
  @Prop({ required: true, unique: true })
  username: string;
  @Prop({ required: true })
  password: string;
  @Prop({ unique: true })
  mobile: string;
  @Prop({ unique: true })
  email: string;
  @Prop()
  status: boolean;
  @Prop({ default: ['USER'] })
  roles: string[];
  @Prop()
  refresh_token: string;
}

export const userSchema = SchemaFactory.createForClass(User);
