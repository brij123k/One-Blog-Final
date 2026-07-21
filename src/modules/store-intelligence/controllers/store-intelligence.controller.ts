import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { StoreIntelligenceService } from '../services/store-intelligence.service';
import { JwtAuthGuard } from 'src/modules/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GenerateTopicsDto } from '../dto/generate-topics.dto';
import { AddPrimaryMarketDto } from '../dto/add-primary-market.dto';

@ApiTags('Store Intelligence')
@Controller({
  path: 'store-intelligence',
  version: '1',
})
export class StoreIntelligenceController {
  constructor(
    private readonly intelligenceService: StoreIntelligenceService,
  ) {}

  @Post('analyze')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Analyze Store',
  })
  analyze(
    @Req() req: any,

    @Query('forceRefresh')
    forceRefresh?: boolean,
  ) {
    console.log("hi")
    return this.intelligenceService.analyzeStore(
      req.user.integrationId,
      req.user.shopDomain,
      forceRefresh,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get Store Intelligence',
  })
  getAnalysis(@Req() req: any) {
    return this.intelligenceService.getByIntegration(
      req.user.integrationId,
    );
  }

  @Post('topics/generate')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Generate up to five AI blog topics within the plan limit' })
  generateTopics(@Req() req: any, @Body() dto: GenerateTopicsDto) {
    return this.intelligenceService.generateTopics(req.user.integrationId, dto.count ?? 5);
  }

@Post('primary-market')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles('owner')
@ApiBearerAuth('JWT')
@ApiOperation({
  summary: 'Add multiple primary markets and create country events if needed',
})
addPrimaryMarket(
  @Req() req: any,
  @Body() dto: AddPrimaryMarketDto,
) {
  return this.intelligenceService.addPrimaryMarkets(
    req.user.integrationId,
    dto.markets,
  );
}

  @Delete()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete Store Intelligence',
  })
  delete(@Req() req: any) {
    return this.intelligenceService.deleteAnalysis(
      req.user.integrationId,
    );
  }
}
