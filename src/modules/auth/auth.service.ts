import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { Integration } from '../integrations/schema/integrations.schema';
import * as jwt from 'jsonwebtoken';
import { ShopifyLoginDto } from './dto/shopify-login.dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-login.dto';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Integration.name)
    private readonly integrationModel: Model<Integration>,

    private readonly jwtService: JwtService,
  ) { }


  async shopifyLogin(
    dto: ShopifyLoginDto,
  ) {
    const decoded =
      jwt.decode(dto?.idToken) as any;

    if (!decoded) {
      throw new UnauthorizedException(
        'Invalid Shopify token',
      );
    }

    const shopDomain =
      decoded.dest.replace(
        'https://',
        '',
      );

    const shopifyUserId =
      decoded.sub;

    let integration =
      await this.integrationModel.findOne({
        storeUrl: shopDomain,
      });

    if (!integration) {
      integration =
        await this.integrationModel.create({
          platform: 'shopify',
          storeUrl: shopDomain,
          storeName: shopDomain,
          isActive: true,
        });
    }

    let user =
      await this.userModel.findOne({
        shopDomain,
      });

    if (!user) {
      user =
        await this.userModel.create({
          shopDomain,
          shopifyUserId,
          role: 'owner',
          integrationId: (integration._id).toString(),
        });
    }

    const payload = {
      userId: user._id,
      role: 'owner',
      integrationId: (integration._id).toString(),
      shopDomain,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload, {
        secret: process.env.JWT_SECRET,
      }
      );

    return {
      accessToken,
      user,
      integration,
    };
  }

  async adminLogin(dto: AdminLoginDto) {
  const admin = await this.userModel.findOne({
    email: dto.email,
    role: 'admin',
    isActive: true,
  });

  if (!admin || !admin.password) {
  throw new UnauthorizedException(
    'Invalid email or password',
  );
}

  const match = await bcrypt.compare(
    dto.password,
    admin.password,
  );

  if (!match) {
    throw new UnauthorizedException(
      'Invalid email or password',
    );
  }

  const payload = {
    sub: admin._id,

    role: admin.role,
  };

  const accessToken =
    await this.jwtService.signAsync(payload,{
        secret: process.env.JWT_SECRET,
      });

  return {
    accessToken,

    user: {
      id: admin._id,

      email: admin.email,

      role: admin.role,
    },
  };
}
}