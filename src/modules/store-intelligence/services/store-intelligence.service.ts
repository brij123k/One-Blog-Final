import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { StoreIntelligence } from '../schemas/store-intelligence.schema';

import { ShopifyService } from '../../shopify/shopify.service';

import { AIService } from '../../ai/ai.service';

@Injectable()
export class StoreIntelligenceService {
  constructor(
    @InjectModel(StoreIntelligence.name)
    private readonly intelligenceModel: Model<StoreIntelligence>,

    private readonly shopifyService: ShopifyService,

    private readonly aiService: AIService,
  ) {}

  async getByIntegration(
    integrationId: string,
  ) {
    return this.intelligenceModel.findOne({
      integrationId,
    });
  }

  async analyzeStore(
    integrationId: string,
    shopDomain: string,
    forceRefresh = false,
  ) {
    /**
     * Check cache
     */
    const cached =
      await this.intelligenceModel.findOne({
        integrationId,
      });
      console.log(cached,"1")
    if (cached && !forceRefresh) {
      return cached;
    }

    /**
     * Shopify
     */
const shop =
  await this.shopifyService.getShopInfo(
    integrationId,
  );
console.log(shop,"1")
const collections =
  await this.shopifyService.getStoreCollections(
    integrationId,
  );
const products =
  await this.shopifyService.getStoreProducts(
    integrationId,
  );
const context =
  this.shopifyService.buildStoreContext(
    shop,
    collections,
    products,
  );
    /**
     * AI Analysis
     */

    const intelligence =
  await this.aiService.analyzeStore(
    context,
  );
    /**
     * Update
     */

    if (cached) {
      Object.assign(
        cached,
        intelligence,
      );

      cached.lastAnalyzedAt =
        new Date();

      await cached.save();

      return cached;
    }

    /**
     * Create
     */

    return this.intelligenceModel.create({
        shopDomain,
      integrationId,

      ...intelligence,

      lastAnalyzedAt:
        new Date(),
    });
  }

  async deleteAnalysis(
    integrationId: string,
  ) {
    return this.intelligenceModel.deleteOne({
      integrationId,
    });
  }


private async updateProgress(
    integrationId: string,

    data: Partial<StoreIntelligence>,
){
    await this.intelligenceModel.updateOne(
        {
            integrationId
        },
        {
            $set:data
        },
        {
            upsert:true
        }
    );
}
}