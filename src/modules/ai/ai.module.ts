import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AIController } from './ai.controller';
import { AIService } from './ai.service';

import {
  AIProvider,
  AIProviderSchema,
} from './schemas/ai-provider.schema';

import { GeminiProvider } from './providers/gemini.provider';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,

    MongooseModule.forFeature([
      {
        name: AIProvider.name,
        schema: AIProviderSchema,
      },
    ]),
  ],

  controllers: [
    AIController,
  ],

  providers: [
    AIService,

    GeminiProvider,
  ],

  exports: [
    AIService,
  ],
})
export class AIModule {}