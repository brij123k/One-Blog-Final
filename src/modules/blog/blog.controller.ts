import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { BlogService } from './blog.service';

import { GenerateBlogDto } from './dto/generate-blog.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GenerateCampaignBlogDto } from './dto/generate-campaign-blog.dto';

@ApiTags('Blogs')
@Controller({
  path: 'blog',
  version: '1',
})
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
  ) {}

  @Post('generate')
  @UseGuards(
    JwtAuthGuard,
    RoleGuard,
  )
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary:
      'Generate AI Blog',
  })
  async generate(
    @Req() req: any,
    @Body()
    dto: GenerateBlogDto,
  ) {
    return this.blogService.generate(
      req.user.integrationId,
      dto,
    );
  }

  @Post('generate-campaign')
@UseGuards(
  JwtAuthGuard,
  RoleGuard,
)
@Roles('owner')
@ApiBearerAuth('JWT')
@ApiOperation({
  summary:
    'Generate AI Campaign Blog',
})
async generateCampaign(
  @Req() req: any,

  @Body()
  dto: GenerateCampaignBlogDto,
) {
  return this.blogService.generateCampaign(
    req.user.integrationId,
    dto,
  );
}
}