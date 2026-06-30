import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { User, UserSchema } from './schema/user.schema';
import {
  Integration,
  IntegrationSchema,
} from 'src/modules/integrations/schema/integrations.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminSeedService } from './admin-seed.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '30d',
      },
    }),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Integration.name,
        schema: IntegrationSchema,
      },
    ]),
  ],

  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,AdminSeedService],

  exports: [JwtModule],
})
export class AuthModule {}