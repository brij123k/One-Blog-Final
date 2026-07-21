import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({
  timestamps: true,
})
export class StoreIntelligence {
  @Prop({
    type: Types.ObjectId,
    ref: 'Integration',
    required: true,
    unique: true,
  })
  integrationId: Types.ObjectId;

  @Prop({
    required: true,
  })
  shopDomain: string;

  @Prop()
  niche: string;

  @Prop()
  businessSummary: string;

  @Prop()
  targetAudience: string;

  @Prop()
  brandVoice: string;

  @Prop()
  language: string;

  @Prop({ type: [String], default: [] })
  primaryMarket: string[];

  @Prop({
    type: [String],
    default: [],
  })
  shortTailKeywords: string[];

  @Prop({
    type: [String],
    default: [],
  })
  longTailKeywords: string[];

  @Prop({
    type: [Object],
    default: [],
  })
  competitors: {
    name: string;
    website: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }[];

  @Prop({
    type: [Object],
    default: [],
  })
  blogTopics: {
    title: string;
    keyword: string;
    intent: string;
    difficulty: string;
    priority: number;
  }[];

  @Prop({
    type: [String],
    default: [],
  })
  customerPainPoints: string[];

  @Prop({
    type: [String],
    default: [],
  })
  customerGoals: string[];

  @Prop({
    type: [String],
    default: [],
  })
  faqIdeas: string[];

  @Prop({
    type: [String],
    default: [],
  })
  seoSuggestions: string[];

  @Prop({
    type: [String],
    default: [],
  })
  contentPillars: string[];

  @Prop({
    type: [String],
    default: [],
  })
  aiRecommendations: string[];

  @Prop()
  lastAnalyzedAt: Date;
}

export const StoreIntelligenceSchema =
  SchemaFactory.createForClass(StoreIntelligence);
