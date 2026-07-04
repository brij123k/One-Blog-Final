import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CountryEventService } from './country-event.service';
import { CreateCountryEventDto } from './dto/create-country-event.dto';
import { UpdateCountryEventDto } from './dto/update-country-event.dto';

@ApiTags('Country Events')
@Controller('country-events')
export class CountryEventController {
  constructor(
    private readonly countryEventService: CountryEventService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create Country Events' })
  create(@Body() dto: CreateCountryEventDto) {
    return this.countryEventService.create(dto);
  }

  @Get()
  getCountries() {
    return this.countryEventService.getCountries();
  }

  @Get(':country')
  findByCountry(@Param('country') country: string) {
    return this.countryEventService.findByCountry(country);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCountryEventDto,
  ) {
    return this.countryEventService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countryEventService.remove(id);
  }
}