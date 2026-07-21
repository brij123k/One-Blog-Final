import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PublishController } from './publish.controller';
import { PublishService } from './publish.service';

import {
  Blog,
  BlogSchema,
} from '../blog/schemas/blog.schema';

import { BlogModule } from '../blog/blog.module';
import { ShopifyModule } from '../shopify/shopify.module';
import { PublishScheduler } from './scheduler.service';
import { StoreIntelligence, StoreIntelligenceSchema } from '../store-intelligence/schemas/store-intelligence.schema';

@Module({
  imports: [
    BlogModule,
    ShopifyModule,

    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      { name: StoreIntelligence.name, schema: StoreIntelligenceSchema },
    ]),
  ],

  controllers: [PublishController],

  providers: [PublishService,PublishScheduler],

  exports: [PublishService],
})
export class PublishModule {}
