import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  name?: string;

  @Prop({ required: true })
  ForDays?: number;

  @Prop({ required: true })
  articalsNumber?: number;

  @Prop({ default: 1 })
  maxStores?: number;

  @Prop({ default: false })
  analyticsEnabled?: boolean;

  @Prop({ default: false })
  scheduleEnabled?: boolean;

  @Prop({ default: true })
  isActive?: boolean;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);