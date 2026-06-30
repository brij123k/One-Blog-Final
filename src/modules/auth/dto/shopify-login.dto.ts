import { IsString } from 'class-validator';

export class ShopifyLoginDto {
  @IsString()
  idToken: string;

  @IsString()
  shop: string;

  @IsString()
  host: string;
}