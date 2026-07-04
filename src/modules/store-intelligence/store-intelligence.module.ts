import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  StoreIntelligence,
  StoreIntelligenceSchema,
} from './schemas/store-intelligence.schema';

import { StoreIntelligenceService } from './services/store-intelligence.service';
import { StoreIntelligenceController } from './controllers/store-intelligence.controller';

import { ShopifyModule } from '../shopify/shopify.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoreIntelligence.name,
        schema: StoreIntelligenceSchema,
      },
    ]),

    ShopifyModule,

    AIModule,
  ],

  controllers: [
    StoreIntelligenceController,
  ],

  providers: [
    StoreIntelligenceService,
  ],

  exports: [
    StoreIntelligenceService,
  ],
})
export class StoreIntelligenceModule {}