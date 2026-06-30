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
  ) {}

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
}