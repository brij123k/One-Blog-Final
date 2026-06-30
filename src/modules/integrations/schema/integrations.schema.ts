import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

@Schema({
  timestamps: true,
})
export class Integration {
  @Prop({
    required: true,
    enum: ['shopify', 'wordpress'],
  })
  platform?: string;

  @Prop({ required: true })
  storeName?: string;

  @Prop({
    required: true,
  })
  storeUrl: string;

  @Prop({
    required: true,
  })
  accessToken: string;

  @Prop()
  shopId?: string;

  @Prop()
  email?: string;

  @Prop()
  country?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Plan',
  })
  planId?: Types.ObjectId;

  @Prop()
  domain?: string;

  @Prop()
  myshopifyDomain?: string;

  @Prop()
  currency?: string;

  @Prop({ default: true })
  isActive?: boolean;
}

export const IntegrationSchema =
  SchemaFactory.createForClass(Integration);