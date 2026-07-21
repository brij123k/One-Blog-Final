import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Plan, PlanDocument } from './schema/plan.schema';

@Injectable()
export class BasicPlanSeedService implements OnModuleInit {
  constructor(
    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,
  ) {}

  async onModuleInit() {
    await this.planModel.updateOne(
      { name: 'Basic 30' },
      {
        $setOnInsert: {
          name: 'Basic 30',
          ForDays: 30,
          articalsNumber: 30,
          maxTopics: 30,
          maxStores: 1,
          analyticsEnabled: false,
          scheduleEnabled: false,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }
}
