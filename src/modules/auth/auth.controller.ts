import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ShopifyAuthDto } from './dto/shopify-auth.dto';
import { ShopifyLoginDto } from './dto/shopify-login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('shopify')
shopifyLogin(
  @Body()
  dto: ShopifyLoginDto,
) {
  return this.authService.shopifyLogin(dto);
}

  
}