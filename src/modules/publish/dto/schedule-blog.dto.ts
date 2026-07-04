import {
  IsDateString,
} from 'class-validator';

import {
  ApiProperty,
} from '@nestjs/swagger';

export class ScheduleBlogDto {
  @ApiProperty({
    example: '2026-07-05T18:30:00.000Z',
  })
  @IsDateString()
  scheduledFor: string;
}