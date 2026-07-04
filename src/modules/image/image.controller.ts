import {
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ImageService } from './image.service';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Image')
@Controller({
  path: 'image',
  version: '1',
})
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
  ) {}

  @Post('generate/:blogId')
  @UseGuards(
    JwtAuthGuard,
    RoleGuard,
  )
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Generate Hero Image for Blog',
  })
  async generateHeroImage(
    @Param('blogId')
    blogId: string,
  ) {
    const blog =
      await this.imageService.generateHeroImage(
        blogId,
      );

    return {
      success: true,

      message:
        'Hero image generated successfully.',

      blog,
    };
  }
}