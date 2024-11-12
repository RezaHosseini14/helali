import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog extends Document {
  @Prop()
  username: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  userid: string;

  @Prop()
  ip: string;

  @Prop()
  baseUrl: string;

  @Prop()
  pathname: string;

  @Prop()
  statusCode: number;

  @Prop()
  method: string;

  @Prop()
  browser: string;

  @Prop()
  browserType: string;

  @Prop()
  osInfo: string;

  @Prop()
  responseTime: string;
}

export const auditLogSchema = SchemaFactory.createForClass(AuditLog);
