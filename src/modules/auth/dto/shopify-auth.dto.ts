import { IsString } from 'class-validator';

export class ShopifyAuthDto {
  @IsString()
  token: string;
}