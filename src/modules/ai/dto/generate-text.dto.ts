import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class GenerateTextDto {
  @ApiProperty({
    example: 'Write a blog about Nike Running Shoes.',
  })
  @IsString()
  prompt: string;

  @ApiProperty({
    required: false,
    example: 'gemini',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({
    required: false,
    example: 'gemini-2.5-pro',
  })
  @IsOptional()
  @IsString()
  modelName?: string;

  @ApiProperty({
    required: false,
    example: {
      temperature: 0.7,
      maxTokens: 4096,
    },
  })
  @IsOptional()
  @IsObject()
  options?: Record<string, any>;

  @ApiProperty({
    required: false,
    example: [
      "You are an SEO Expert.",
      "Write in Markdown.",
    ],
  })
  @IsOptional()
  @IsArray()
  systemPrompts?: string[];
}