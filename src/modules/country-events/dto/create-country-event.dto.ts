import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCountryEventDto {
  @ApiProperty({
    example: 'India',
  })
  @IsString()
  country?: string;

  @ApiProperty({
    type: [String],
    example: ['Summer', 'Winter', 'Monsoon'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasonal?: string[];

  @ApiProperty({
    type: [String],
    example: ['Diwali', 'Holi', 'Navratri'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cultural?: string[];

  @ApiProperty({
    type: [String],
    example: ['Black Friday', 'Christmas Sale'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  retail?: string[];

  @ApiProperty({
    type: [String],
    example: ['Goa Carnival', 'Pushkar Fair'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experiential?: string[];
}