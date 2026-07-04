import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  IsArray,
  IsOptional,
  IsString,
  ArrayUnique,
  ArrayMaxSize,
  ValidateNested,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Type } from 'class-transformer';

class CalendarDto {
  @ApiProperty({
    example: 'festival',
    description:
      'festival | culture | retail | experiential | seasonal | holiday | awareness | sporting',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 'Christmas',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'United States',
  })
  @IsOptional()
  @IsString()
  country?: string;
}

class KeywordsDto {
  @ApiPropertyOptional({
    type: [String],
    example: [
      'running shoes',
      'sports shoes',
      'gym shoes',
      'marathon shoes',
      'nike shoes',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsString({
    each: true,
  })
  shortTail?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: [
      'best running shoes for marathon',
      'best shoes for beginners',
      'comfortable running shoes',
      'best shoes for long distance running',
      'lightweight marathon shoes',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(50)
  @IsString({
    each: true,
  })
  longTail?: string[];
}

export class GenerateCampaignBlogDto {

  @ApiPropertyOptional({
    type: [String],
    description:
      'Optional Shopify Collection IDs',
    example: [
      'gid://shopify/Collection/123456789',
      'gid://shopify/Collection/987654321',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsString({
    each: true,
  })
  collections?: string[];

  @ApiPropertyOptional({
    type: [String],
    description:
      'Optional Shopify Product IDs',
    example: [
      'gid://shopify/Product/123456789',
      'gid://shopify/Product/987654321',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsString({
    each: true,
  })
  products?: string[];

  @ApiProperty({
    example: 'https://www.nike.com',
    description:
      'Competitor website URL',
  })
  @IsUrl()
  competitorUrl: string;

  @ApiProperty({
    type: CalendarDto,
  })
  @ValidateNested()
  @Type(() => CalendarDto)
  calendar: CalendarDto;

  @ApiPropertyOptional({
    type: KeywordsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => KeywordsDto)
  keywords?: KeywordsDto;
}