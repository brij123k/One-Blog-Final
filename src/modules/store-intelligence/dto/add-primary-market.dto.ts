import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class AddPrimaryMarketDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  markets: string[];
}