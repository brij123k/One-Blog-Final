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
import { Integration, IntegrationSchema } from '../integrations/schema/integrations.schema';
import { Plan, PlanSchema } from '../plans/schema/plan.schema';
import { CountryEvent, CountryEventSchema } from '../country-events/schemas/country-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: StoreIntelligence.name,
        schema: StoreIntelligenceSchema,
      },
      { name: Integration.name, schema: IntegrationSchema },
      { name: Plan.name, schema: PlanSchema },
      { name: CountryEvent.name, schema: CountryEventSchema },
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
