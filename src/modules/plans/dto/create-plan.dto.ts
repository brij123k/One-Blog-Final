import {
  IsBoolean,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name?: string;

  @IsNumber()
  ForDays?: number;

  @IsNumber()
  articalsNumber?: number;

  @IsNumber()
  maxTopics?: number;

  @IsNumber()
  maxStores?: number;

  @IsBoolean()
  analyticsEnabled?: boolean;

  @IsBoolean()
  scheduleEnabled?: boolean;
}
