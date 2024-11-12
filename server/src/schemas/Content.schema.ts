import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class File {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  audioCreator: string;

  @Prop({ required: true })
  audioType: string;

  @Prop({ required: true })
  audioDesc: string;

  @Prop({ required: true })
  url: string;
}
export const fileSchema = SchemaFactory.createForClass(File);

@Schema()
export class Image {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;
}
export const imageSchema = SchemaFactory.createForClass(Image);

@Schema()
export class Video {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  videoTitle: string;

  @Prop({ required: true })
  videoUrl: string;
}
export const videoSchema = SchemaFactory.createForClass(Video);

@Schema({ timestamps: true })
export class Content extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  desc: string;

  @Prop({ required: true })
  create: Date;

  @Prop({ default: null })
  publishTime: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  type: string;

  @Prop({ default: true })
  show: boolean;

  @Prop()
  status: boolean;

  @Prop([imageSchema])
  images: Image[];

  @Prop([fileSchema])
  files: File[];

  @Prop([videoSchema])
  videos: any[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event' })
  event: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Content' }])
  eventChild: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  creator: string;
}

export const contentSchema = SchemaFactory.createForClass(Content);
