import { IsOptional, IsNumber, Max, Min } from 'class-validator';

export class GenerateTopicsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  count?: number = 5;
}
