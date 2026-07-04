import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import {
  StoreIntelligence,
  StoreIntelligenceSchema,
} from '../store-intelligence/schemas/store-intelligence.schema';

import { BlogController } from './blog.controller';

import { BlogService } from './blog.service';

import { ShopifyModule } from '../shopify/shopify.module';

import { AIModule } from '../ai/ai.module';
import { Blog, BlogSchema } from './schemas/blog.schema';
import { ImageModule } from '../image/image.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoreIntelligence.name,
        schema:
          StoreIntelligenceSchema,
      },
       {
      name: Blog.name,
      schema: BlogSchema,
    },
    ]),

    ShopifyModule,
    ImageModule,
    AIModule,
  ],

  controllers: [
    BlogController,
  ],

  providers: [
    BlogService,
  ],

  exports: [
    BlogService,
  ],
})
export class BlogModule {}