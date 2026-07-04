import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { PublishService } from './publish.service';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ScheduleBlogDto } from './dto/schedule-blog.dto';

@ApiTags('Publish')
@Controller({
  path: 'publish',
  version: '1',
})
export class PublishController {
  constructor(
    private readonly publishService: PublishService,
  ) {}

  /**
   * Publish Blog Immediately
   */
  @Post(':blogId')
  @UseGuards(
    JwtAuthGuard,
    RoleGuard,
  )
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Publish Blog to Shopify',
  })
  async publish(
    @Req() req: any,

    @Param('blogId')
    blogId: string,
  ) {
    return this.publishService.publish(
      req.user.integrationId,
      blogId,
    );
  }

  @Post(':blogId/schedule')
@UseGuards(
  JwtAuthGuard,
  RoleGuard,
)
@Roles('owner')
@ApiBearerAuth('JWT')
@ApiOperation({
  summary: 'Schedule Blog Publish',
})
schedule(
  @Req() req: any,

  @Param('blogId')
  blogId: string,

  @Body()
  dto: ScheduleBlogDto,
) {
  return this.publishService.schedule(
    req.user.integrationId,
    blogId,
    dto,
  );
}

  /**
   * Cancel Scheduled Publish
   * (Implementation in next phase)
   */
  @Delete('schedule/:blogId')
  @UseGuards(
    JwtAuthGuard,
    RoleGuard,
  )
  @Roles('owner')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Cancel Scheduled Publish',
  })
  async cancelSchedule(
    @Req() req: any,

    @Param('blogId')
    blogId: string,
  ) {
    return this.publishService.cancelSchedule(
      req.user.integrationId,
      blogId,
    );
  }
}