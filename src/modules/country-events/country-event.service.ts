import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  CountryEvent,
  CountryEventDocument,
} from './schemas/country-event.schema';

import { CreateCountryEventDto } from './dto/create-country-event.dto';
import { UpdateCountryEventDto } from './dto/update-country-event.dto';

@Injectable()
export class CountryEventService {
  constructor(
    @InjectModel(CountryEvent.name)
    private readonly countryEventModel: Model<CountryEventDocument>,
  ) {}

  create(dto: CreateCountryEventDto) {
    return this.countryEventModel.create(dto);
  }

async getCountries() {
  const countries = await this.countryEventModel
    .find({}, { country: 1, _id: 0 })
    .sort({ country: 1 })
    .lean();

  return countries.map((item) => item.country);
}

  findOne(id: string) {
    return this.countryEventModel.findById(id);
  }

  findByCountry(country: string) {
    return this.countryEventModel.findOne({
      country: new RegExp(`^${country}$`, 'i'),
    });
  }

  async update(
    id: string,
    dto: UpdateCountryEventDto,
  ) {
    const event = await this.countryEventModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    if (!event) {
      throw new NotFoundException('Country not found');
    }

    return event;
  }

  async remove(id: string) {
    const event =
      await this.countryEventModel.findByIdAndDelete(id);

    if (!event) {
      throw new NotFoundException('Country not found');
    }

    return {
      message: 'Country deleted successfully',
    };
  }
}