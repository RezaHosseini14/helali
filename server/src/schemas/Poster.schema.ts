import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Poster extends Document {
  @Prop()
  image: string;

  @Prop()
  title: string;

  @Prop()
  create: string;

  @Prop()
  desc: string;
}

export const posterSchema = SchemaFactory.createForClass(Poster);
