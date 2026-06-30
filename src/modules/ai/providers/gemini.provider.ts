import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

import {
  AIProviderInterface,
  GenerateTextOptions,
  GenerateTextResponse,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProviderInterface {
  readonly provider = 'gemini';

  private client: GoogleGenAI | null = null;

  /**
   * Initialize Gemini Client
   */
  initialize(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  /**
   * Generate Text
   */
  async generateText(
    prompt: string,
    options?: GenerateTextOptions,
  ): Promise<GenerateTextResponse> {
    if (!this.client) {
      throw new Error(
        'Gemini Provider not initialized.',
      );
    }

    const modelName =
      options?.modelName ??
      'gemini-2.5-pro';

    const response =
      await this.client.models.generateContent({
        model:modelName,

        contents: prompt,

        config: {
          temperature:
            options?.temperature ?? 0.7,

          maxOutputTokens:
            options?.maxTokens ?? 4096,

          systemInstruction:
            options?.systemPrompts?.join('\n'),
        },
      });

    return {
      success: true,

      provider: this.provider,

      modelName,

      text: response.text ?? '',

      usage: {
        promptTokens:
          response.usageMetadata
            ?.promptTokenCount,

        completionTokens:
          response.usageMetadata
            ?.candidatesTokenCount,

        totalTokens:
          response.usageMetadata
            ?.totalTokenCount,
      },

      finishReason:
        response.candidates?.[0]
          ?.finishReason,

      raw: response,
    };
  }

  /**
   * Validate API Key
   */
  async validateConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }

      await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hello',
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Available Models
   */
  async getAvailableModels(): Promise<string[]> {
    return [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ];
  }
}