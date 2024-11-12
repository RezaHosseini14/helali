import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  parent_id: string;

  @Prop({ default: null })
  sort: number;
}

export const eventSchema = SchemaFactory.createForClass(Event);
