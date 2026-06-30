import {
  Injectable,
  OnModuleInit,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';

import { User } from './schema/user.schema';

@Injectable()
export class AdminSeedService
  implements OnModuleInit
{
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async onModuleInit() {
    const admin = await this.userModel.findOne({
      role: 'admin',
    });

    if (admin) {
      console.log('✅ Admin already exists');
      return;
    }

    const password = await bcrypt.hash(
      'Admin@123',
      10,
    );

    await this.userModel.create({
      email: 'admin@blog1.ai',
      password,
      role: 'admin',
    });

    console.log('✅ Default Admin Created');
  }
}