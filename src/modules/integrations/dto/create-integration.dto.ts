import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  platform?: string;

  @IsString()
  storeName?: string;

  @IsString()
  storeUrl?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}