import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AIProvider,
  AIProviderDocument,
} from './schemas/ai-provider.schema';

import { GeminiProvider } from './providers/gemini.provider';

import { GenerateTextDto } from './dto/generate-text.dto';

@Injectable()
export class AIService {
  constructor(
    @InjectModel(AIProvider.name)
    private readonly aiProviderModel: Model<AIProviderDocument>,

    private readonly geminiProvider: GeminiProvider,
  ) { }



  private parseAIJson(
    text: string,
  ) {
    try {
      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error(text);

      throw new Error(
        'AI returned invalid JSON.',
      );
    }
  }

  private async analyzeBusiness(
    provider: AIProvider,
    context: any,
  ) {
    const prompt = `
You are a world-class Ecommerce Business Consultant.

Analyze this Shopify store.

Store Context

${JSON.stringify(context, null, 2)}

Return ONLY valid JSON.

{
  "niche":"",
  "businessSummary":"",
  "targetAudience":"",
  "brandVoice":"",
  "language":"",
  "primaryMarket":"",
  "customerPainPoints":[
    "",
    "",
    "",
    "",
    ""
  ],
  "customerGoals":[
    "",
    "",
    "",
    "",
    ""
  ],
  "shortTailKeywords":[
    "",
    "",
    "",
    "",
    ""
  ],
  "longTailKeywords":[
    "",
    "",
    "",
    "",
    ""
  ]
}
`;

    const response =
      await this.generateText({
        prompt,
        providerId: provider.provider,
        temperature: 0.3,
      });

    return this.parseAIJson(
      response.text,
    );
  }

  private async analyzeContentStrategy(
    provider: AIProvider,
    context: any,
  ) {
    const prompt = `
You are an Ecommerce SEO Expert.

Analyze this Shopify store.

Store Context

${JSON.stringify(context, null, 2)}

Return ONLY JSON.

{
   "contentPillars":[
      "",
      "",
      "",
      "",
      ""
   ],

   "faqIdeas":[
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
   ],

   "seoSuggestions":[
      "",
      "",
      "",
      "",
      ""
   ],

   "blogTopics":[
      {
         "title":"",
         "keyword":"",
         "intent":"",
         "difficulty":"",
         "priority":1
      }
   ],

   "aiRecommendations":[
      "",
      "",
      "",
      "",
      ""
   ]
}
`;

    const response =
      await this.generateText({
        prompt,
        providerId: provider.provider,
        temperature: 0.6,
      });

    return this.parseAIJson(
      response.text,
    );
  }

  private async analyzeCompetitors(
    provider: AIProvider,
    context: any,
  ) {
    const prompt = `
You are a professional Ecommerce Market Research Expert.

Using this Shopify Store Context,

${JSON.stringify(context, null, 2)}

Find the TOP 5 competitors.

Return ONLY JSON.

[
  {
    "name":"",
    "website":"",
    "description":"",
    "strengths":[
      "",
      "",
      ""
    ],
    "weaknesses":[
      "",
      "",
      ""
    ]
  }
]
`;

    const response =
      await this.generateText({
        prompt,
        providerId: provider.provider,
        temperature: 0.4,
      });

    return this.parseAIJson(
      response.text,
    );
  }

  private async generateText(data: {
    prompt: string;
    providerId: string;
    temperature?: number;
  }) {
    const provider =
      await this.aiProviderModel.findOne(
        { provider: data.providerId }
      );
    console.log(provider)

    if (!provider) {
      throw new NotFoundException(
        'AI Provider not found',
      );
    }

    this.geminiProvider.initialize(
      provider.apiKey,
    );

    return this.geminiProvider.generateText(
      data.prompt,
      {
        modelName: provider.modelName,

        temperature:
          data.temperature ??
          provider.temperature,

        maxTokens:
          provider.maxTokens,
      },
    );
  }

  /**
   * Get Default AI Provider
   */
  async getDefaultProvider() {
    const provider =
      await this.aiProviderModel.findOne({
        isDefault: true,
        isActive: true,
      });

    if (!provider) {
      throw new NotFoundException(
        'No active AI Provider found.',
      );
    }

    return provider;
  }

  /**
   * Get Provider By Name
   */
  async getProvider(name: string) {
    const provider =
      await this.aiProviderModel.findOne({
        provider: name,
        isActive: true,
      });

    if (!provider) {
      throw new NotFoundException(
        'AI Provider not found.',
      );
    }

    return provider;
  }

  /**
   * Generate Text
   */
  async generate(dto: GenerateTextDto) {
    let provider: AIProviderDocument;

    if (dto.provider) {
      provider =
        await this.getProvider(dto.provider);
    } else {
      provider =
        await this.getDefaultProvider();
    }

    switch (provider.provider) {
      case 'gemini':
        this.geminiProvider.initialize(
          provider.apiKey,
        );

        return this.geminiProvider.generateText(
          dto.prompt,
          {
            modelName:
              dto.modelName ?? provider.modelName,

            temperature:
              dto.options?.temperature ??
              provider.temperature,

            maxTokens:
              dto.options?.maxTokens ??
              provider.maxTokens,

            systemPrompts:
              dto.systemPrompts,
          },
        );

      default:
        throw new Error(
          `Provider ${provider.provider} not implemented.`,
        );
    }
  }

  /**
   * List Providers
   */
  async findAllProviders() {
    return this.aiProviderModel.find();
  }

  /**
   * Create Provider
   */
  async create(data: Partial<AIProvider>) {
    if (data.isDefault) {
      await this.aiProviderModel.updateMany(
        {},
        {
          isDefault: false,
        },
      );
    }

    return this.aiProviderModel.create(data);
  }

  /**
   * Update Provider
   */
  async update(
    id: string,
    data: Partial<AIProvider>,
  ) {
    if (data.isDefault) {
      await this.aiProviderModel.updateMany(
        {},
        {
          isDefault: false,
        },
      );
    }

    return this.aiProviderModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      },
    );
  }

  /**
   * Delete Provider
   */
  async delete(id: string) {
    return this.aiProviderModel.findByIdAndDelete(
      id,
    );
  }

  async analyzeStore(
    context: any,
  ) {
    const provider =
      await this.getDefaultProvider();

    const business =
      await this.analyzeBusiness(
        provider,
        context,
      );
    const strategy =
      await this.analyzeContentStrategy(
        provider,
        context,
      );
    const competitors =
      await this.analyzeCompetitors(
        provider,
        context,
      );
    return {
      ...business,

      ...strategy,

      competitors,

      lastAnalyzedAt:
        new Date(),
    };
  }

async generateImage(prompt: string) {
  const provider =
    await this.getDefaultProvider();

  this.geminiProvider.initialize(
    provider.apiKey,
  );

  return this.geminiProvider.generateImage(
    prompt,
  );
}
}