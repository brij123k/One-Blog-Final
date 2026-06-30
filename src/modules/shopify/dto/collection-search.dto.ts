import {
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class CollectionSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page = '1';

  @IsOptional()
  @IsNumberString()
  limit = '20';
}