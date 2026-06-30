export interface GenerateTextOptions {
  modelName?: string;

  temperature?: number;

  maxTokens?: number;

  systemPrompts?: string[];

  metadata?: Record<string, any>;
}

export interface GenerateTextResponse {
  success: boolean;

  provider: string;

  modelName: string;

  text: string;

  usage?: {
    promptTokens?: number;

    completionTokens?: number;

    totalTokens?: number;
  };

  finishReason?: string;

  raw?: any;
}

export interface AIProviderInterface {
  /**
   * Provider Name
   * Example:
   * gemini
   * openai
   * claude
   */
  readonly provider: string;

  /**
   * Generate AI Text
   */
  generateText(
    prompt: string,
    options?: GenerateTextOptions,
  ): Promise<GenerateTextResponse>;

  /**
   * Check API Key
   */
  validateConnection(): Promise<boolean>;

  /**
   * Available Models
   */
  getAvailableModels(): Promise<string[]>;
}