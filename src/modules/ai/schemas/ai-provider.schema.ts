import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AIProviderDocument = HydratedDocument<AIProvider>;

@Schema({
  timestamps: true,
  collection: 'ai_providers',
})
export class AIProvider {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  provider: string;

  @Prop({
    required: true,
  })
  displayName: string;

  @Prop({
    required: true,
  })
  modelName: string;

  @Prop({
    required: true,
  })
  apiKey: string;

  @Prop({
    default: null,
  })
  baseUrl?: string;

  @Prop({
    default: 0.7,
  })
  temperature: number;

  @Prop({
    default: 4096,
  })
  maxTokens: number;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: false,
  })
  isDefault: boolean;

  @Prop({
    default: 1,
  })
  priority: number;

  @Prop({
    default: {},
    type: Object,
  })
  settings: Record<string, any>;
}

export const AIProviderSchema =
  SchemaFactory.createForClass(AIProvider);