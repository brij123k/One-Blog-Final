import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  CountryEvent,
  CountryEventSchema,
} from './schemas/country-event.schema';

import { CountryEventController } from './country-event.controller';
import { CountryEventService } from './country-event.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CountryEvent.name,
        schema: CountryEventSchema,
      },
    ]),
  ],
  controllers: [CountryEventController],
  providers: [CountryEventService],
  exports: [CountryEventService],
})
export class CountryEventModule {}