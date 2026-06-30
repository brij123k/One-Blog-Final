import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateAIProviderDto {
  @ApiProperty({
    example: 'gemini',
  })
  @IsString()
  provider: string;

  @ApiProperty({
    example: 'Google Gemini',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    example: 'gemini-2.5-pro',
  })
  @IsString()
  modelName: string;

  @ApiProperty({
    example: 'AIzaSy**************',
  })
  @IsString()
  apiKey: string;

  @ApiProperty({
    required: false,
    example: 'https://api.openai.com/v1',
  })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiProperty({
    example: 0.7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiProperty({
    example: 8192,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTokens?: number;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  priority?: number;
}