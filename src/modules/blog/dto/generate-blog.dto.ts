import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GenerateBlogDto {
  @ApiProperty({
    example:
      'Best Running Shoes for Marathon Training',
    description:
      'Blog topic to generate content for.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  topic: string;

  @ApiPropertyOptional({
    description:
      'Optional Shopify Product IDs to include naturally in the blog.',
    type: [String],
    example: [
      'gid://shopify/Product/123456789',
      'gid://shopify/Product/987654321',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(10)
  @IsString({
    each: true,
  })
  products?: string[];
}