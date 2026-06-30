import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';
import { ShopifyApiService } from './services/shopify-api.service';

import {
  Integration,
  IntegrationSchema,
} from '../integrations/schema/integrations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Integration.name,
        schema: IntegrationSchema,
      },
    ]),
  ],

  controllers: [ShopifyController],

  providers: [
    ShopifyService,
    ShopifyApiService,
  ],

  exports: [
    ShopifyService,
    ShopifyApiService,
  ],
})
export class ShopifyModule {}