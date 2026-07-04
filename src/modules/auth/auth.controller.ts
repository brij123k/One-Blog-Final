import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { ShopifyAuthDto } from './dto/shopify-auth.dto';
import { ShopifyLoginDto } from './dto/shopify-login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('shopify')
  @ApiOperation({
  summary: 'Store Login',
})
shopifyLogin(
  @Body()
  dto: ShopifyLoginDto,
) {
  return this.authService.shopifyLogin(dto);
}

@Post('admin')
@ApiOperation({
  summary: 'Admin Login',
})
adminLogin(
  @Body() dto: AdminLoginDto,
) {
  return this.authService.adminLogin(dto);
}

  
}