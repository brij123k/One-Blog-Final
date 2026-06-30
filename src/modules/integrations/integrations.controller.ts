import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { IntegrationsService } from './integrations.service';

import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
  ) {}

  @Post('shopify/install')
installShopify(
  @Body('shop')
  shop: string,
) {
  return this.integrationsService.installShopify(
    shop,
  );
}

@Get('shopify/callback')
callback(
  @Query('shop') shop: string,
  @Query('code') code: string,
) {
  return this.integrationsService.callback(
    shop,
    code,
  );
}
  @Post()
  create(
    @Body()
    createIntegrationDto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(
      createIntegrationDto,
    );
  }

  @Get()
  findAll() {
    return this.integrationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateIntegrationDto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(
      id,
      updateIntegrationDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integrationsService.remove(id);
  }
}