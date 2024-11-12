import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Audio {
  //   @Prop({ required: true, unique: true })
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  originalName: string;
  //   @Prop({ required: true, unique: true })
  @Prop({ required: true })
  path: string;
  @Prop()
  mimetype: string;
  @Prop({ required: true })
  size: string;
}

export const audioSchema = SchemaFactory.createForClass(Audio);
