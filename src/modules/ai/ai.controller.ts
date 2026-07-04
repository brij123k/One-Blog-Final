import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AIService } from './ai.service';

import { GenerateTextDto } from './dto/generate-text.dto';
import { CreateAIProviderDto } from './dto/create-ai-provider.dto';
import { UpdateAIProviderDto } from './dto/update-ai-provider.dto';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('AI')
@Controller({
  path: 'ai',
  version: '1',
})
export class AIController {
  constructor(
    private readonly aiService: AIService,
  ) { }

  /**
   * ===========================
   * Generate AI Text
   * ===========================
   */

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Generate AI Content',
  })
  async generate(
    @Body() dto: GenerateTextDto,
  ) {
    return this.aiService.generate(dto);
  }

  /**
   * ===========================
   * AI Providers
   * ===========================
   */

  @Get('providers')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get All AI Providers',
  })
  async findAllProviders() {
    return this.aiService.findAllProviders();
  }

  @Post('providers')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @ApiOperation({
    summary: 'Create AI Provider',
  })
  async createProvider(
    @Body() dto: CreateAIProviderDto,
  ) {
    console.log("h1")
    return this.aiService.create(dto);
  }

  @Patch('providers/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @ApiOperation({
    summary: 'Update AI Provider',
  })
  async updateProvider(
    @Param('id') id: string,
    @Body() dto: UpdateAIProviderDto,
  ) {
    return this.aiService.update(id, dto);
  }

  @Delete('providers/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @ApiBearerAuth('JWT')
  @Roles('admin')
  @ApiOperation({
    summary: 'Delete AI Provider',
  })
  async deleteProvider(
    @Param('id') id: string,
  ) {
    return this.aiService.delete(id);
  }
}