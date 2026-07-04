import { PartialType } from '@nestjs/swagger';
import { CreateCountryEventDto } from './create-country-event.dto';

export class UpdateCountryEventDto extends PartialType(
  CreateCountryEventDto,
) {}