// schemas/country-event.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountryEventDocument = CountryEvent & Document;

@Schema({ timestamps: true })
export class CountryEvent {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  country: string;

  @Prop({
    type: [String],
    default: [],
  })
  seasonal: string[];

  @Prop({
    type: [String],
    default: [],
  })
  cultural: string[];

  @Prop({
    type: [String],
    default: [],
  })
  retail: string[];

  @Prop({
    type: [String],
    default: [],
  })
  experiential: string[];
}

export const CountryEventSchema =
  SchemaFactory.createForClass(CountryEvent);