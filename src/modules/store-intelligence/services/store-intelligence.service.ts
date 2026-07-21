import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { StoreIntelligence } from '../schemas/store-intelligence.schema';
import { Plan } from '../../plans/schema/plan.schema';
import { Integration } from '../../integrations/schema/integrations.schema';
import { CountryEvent } from '../../country-events/schemas/country-event.schema';

import { ShopifyService } from '../../shopify/shopify.service';

import { AIService } from '../../ai/ai.service';

@Injectable()
export class StoreIntelligenceService {
  constructor(
    @InjectModel(StoreIntelligence.name)
    private readonly intelligenceModel: Model<StoreIntelligence>,

    @InjectModel(Integration.name)
    private readonly integrationModel: Model<Integration>,

    @InjectModel(Plan.name)
    private readonly planModel: Model<Plan>,

    @InjectModel(CountryEvent.name)
    private readonly countryEventModel: Model<CountryEvent>,

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

  async generateTopics(integrationId: string, count = 5) {
    const intelligence = await this.getRequiredIntelligence(integrationId);
    const integration = await this.integrationModel.findById(integrationId).lean();
    const plan = integration?.planId
      ? await this.planModel.findById(integration.planId).lean()
      : null;
    const maxTopics = plan?.maxTopics ?? 30;
    const currentTopics = intelligence.blogTopics ?? [];
    const available = maxTopics - currentTopics.length;

    if (available <= 0) {
      throw new BadRequestException(`Topic limit reached (${maxTopics}).`);
    }

    const topicCount = Math.min(count, available);
    const response = await this.aiService.generate({
      prompt: `Generate exactly ${topicCount} new, distinct SEO blog topic suggestions for this ecommerce store. Do not repeat these existing topics: ${JSON.stringify(currentTopics.map((topic) => topic.title))}. Return ONLY valid JSON in this format: {"blogTopics":[{"title":"","keyword":"","intent":"","difficulty":"","priority":1}]}. Store intelligence: ${JSON.stringify({ niche: intelligence.niche, businessSummary: intelligence.businessSummary, contentPillars: intelligence.contentPillars, shortTailKeywords: intelligence.shortTailKeywords, longTailKeywords: intelligence.longTailKeywords })}`,
    });
    const parsed = this.parseJson(response.text);
    const existingTitles = new Set(currentTopics.map((topic) => topic.title.toLowerCase()));
    const topics = (parsed.blogTopics ?? [])
      .filter((topic: any) => topic?.title && !existingTitles.has(topic.title.toLowerCase()))
      .slice(0, topicCount);

    intelligence.blogTopics = [...currentTopics, ...topics];
    await intelligence.save();

    return { success: true, maxTopics, added: topics.length, blogTopics: topics, totalTopics: intelligence.blogTopics.length };
  }

async addPrimaryMarkets(
  integrationId: string,
  markets: string[],
) {
  const intelligence = await this.getRequiredIntelligence(integrationId);

  const existingMarkets = Array.isArray(intelligence.primaryMarket)
    ? [...intelligence.primaryMarket]
    : intelligence.primaryMarket
      ? [intelligence.primaryMarket as any]
      : [];

  const updatedMarkets: string[] = [];
const processedCountries: CountryEvent[] = [];

  for (const market of markets) {
    const normalizedMarket = market.trim();

    if (!normalizedMarket) {
      continue;
    }

    let countryEvent = await this.countryEventModel.findOne({
      country: new RegExp(
        `^${this.escapeRegExp(normalizedMarket)}$`,
        'i',
      ),
    });

    // Create country if it doesn't exist
if (!countryEvent) {
  const response = await this.aiService.generate({
    prompt: `
Create a country events calendar for ${normalizedMarket}.

Return ONLY valid JSON.

The response MUST exactly match this schema:

{
  "seasonal": ["string"],
  "cultural": ["string"],
  "retail": ["string"],
  "experiential": ["string"]
}

Rules:
- Every property must be an array of strings.
- Do NOT return objects.
- Do NOT include fields like name, period, focus, date, month, or description.
- Each array element must be a single string representing one event or season.
- Include 8-15 relevant entries per category.
- Do NOT wrap the response inside markdown or \`\`\`json.
- Return ONLY the JSON object.

Example:

{
  "seasonal": [
    "Spring Season",
    "Summer Season",
    "Autumn Season",
    "Winter Season"
  ],
  "cultural": [
    "Chinese New Year",
    "Lantern Festival",
    "Dragon Boat Festival",
    "Mid-Autumn Festival"
  ],
  "retail": [
    "Singles' Day",
    "618 Shopping Festival",
    "Double 12",
    "Black Friday"
  ],
  "experiential": [
    "Cherry Blossom Season",
    "Back to School",
    "Graduation Season",
    "National Day Travel"
  ]
}
`,
  });

  const generated = this.parseJson(response.text);

  countryEvent = await this.countryEventModel.create({
    country: normalizedMarket,
    seasonal: generated.seasonal ?? [],
    cultural: generated.cultural ?? [],
    retail: generated.retail ?? [],
    experiential: generated.experiential ?? [],
  });
}

    // Add to primary market if not already present
    if (
  !updatedMarkets.some(
    item => item.toLowerCase() === countryEvent.country.toLowerCase(),
  )
) {
  updatedMarkets.push(countryEvent.country);
}

processedCountries.push(countryEvent);
  }

  intelligence.primaryMarket = updatedMarkets;
await intelligence.save();

  return {
    success: true,
    primaryMarket: intelligence.primaryMarket,
    countryEvents: processedCountries,
  };
}

  private async getRequiredIntelligence(integrationId: string) {
    const intelligence = await this.intelligenceModel.findOne({ integrationId });
    if (!intelligence) {
      throw new NotFoundException('Store analysis not found. Please analyze your store first.');
    }
    return intelligence;
  }

  private parseJson(text: string) {
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
