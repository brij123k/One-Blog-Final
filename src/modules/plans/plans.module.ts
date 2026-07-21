
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Plan,
  PlanSchema,
} from './schema/plan.schema';

import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { BasicPlanSeedService } from './basic-plan-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Plan.name,
        schema: PlanSchema,
      },
    ]),
  ],
  controllers: [PlansController],
  providers: [PlansService, BasicPlanSeedService],
  exports: [PlansService],
})
export class PlansModule {}
