import {
  Controller,
  Post,
  Get,
  Delete,
  Query,
  Req,
  UseGuards,
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