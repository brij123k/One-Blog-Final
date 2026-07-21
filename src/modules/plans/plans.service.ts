
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Plan, PlanDocument } from './schema/plan.schema';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name)
    private readonly planModel: Model<PlanDocument>,
  ) {}

  create(dto: any) {
    return this.planModel.create(dto);
  }

  findAll() {
    return this.planModel.find();
  }

  async findOne(id: string) {
    const plan = await this.planModel.findById(id);

    if (!plan) {
      throw new NotFoundException(
        'Plan not found',
      );
    }

    return plan;
  }

  async update(id: string, dto: any) {
    const plan = await this.planModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    if (!plan) {
      throw new NotFoundException(
        'Plan not found',
      );
    }

    return plan;
  }

  async remove(id: string) {
    await this.planModel.findByIdAndDelete(id);

    return {
      message: 'Plan deleted',
    };
  }

  findFreePlan() {
    return this.planModel.findOne({
      name: 'Basic 30',
    });
  }
}
