import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

export enum BlogStatus {
  GENERATING = 'GENERATING',
  IMAGE_PENDING = 'IMAGE_PENDING',
  IMAGE_GENERATING = 'IMAGE_GENERATING',
  COMPLETED = 'COMPLETED',
  PUBLISHED='PUBLISHED',
  SCHEDULED='SCHEDULED',
  FAILED = 'FAILED',
}

@Schema({
  timestamps: true,
})
export class Blog {
  @Prop({ required: true })
  integrationId: string;

  @Prop({ required: true })
  topic: string;

  @Prop()
  title: string;

  @Prop()
  slug: string;

  @Prop()
  metaTitle: string;

  @Prop()
  metaDescription: string;

  @Prop()
  excerpt: string;

  @Prop()
  heroImagePrompt: string;

  @Prop({
  type: {
    url: String,
    localPath: String,
    fileName: String,
    mimeType: String,
    size: Number,
    provider: String,
    shopifyUrl: String,
  },
})
heroImage?: {
  url: string;
  localPath: string;
  fileName: string;
  mimeType: string;
  size: number;
  provider: string;
  shopifyUrl?: string;
};

  @Prop()
  estimatedReadingTime: string;

  @Prop({
    type: [String],
    default: [],
  })
  keywords: string[];

  @Prop()
  content: string;


  @Prop({
    enum: BlogStatus,
    default: BlogStatus.IMAGE_PENDING,
  })
  status: BlogStatus;

  @Prop()
  publishStatus?: string;

  @Prop()
publishedAt?: Date;

@Prop()
scheduledFor?: Date;

@Prop()
shopifyBlogId?: string;

@Prop()
shopifyArticleId?: string;

@Prop()
publishError?: string;

@Prop()
shopifyUrl?: string;

@Prop()
shopifyHandle?: string;

@Prop({
  default: false,
})
isScheduled: boolean;
}

export const BlogSchema =
  SchemaFactory.createForClass(Blog);