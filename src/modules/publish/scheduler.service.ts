import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { Cron } from '@nestjs/schedule';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import {
  Blog,
  BlogStatus,
} from '../blog/schemas/blog.schema';

import { PublishService } from './publish.service';

@Injectable()
export class PublishScheduler {
  private readonly logger =
    new Logger(
      PublishScheduler.name,
    );

  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<Blog>,

    private readonly publishService: PublishService,
  ) {}

  /**
   * Every minute
   */
  @Cron('* * * * *')
  async handleScheduledBlogs() {
    console.log('Scheduler running...', new Date());
    const now = new Date();

    const blogs =
      await this.blogModel.find({
        isScheduled: true,

        publishStatus:
          'SCHEDULED',

        status:
          BlogStatus.COMPLETED,

        scheduledFor: {
          $lte: now,
        },
      });

    if (!blogs.length) {
      return;
    }

    this.logger.log(
      `Found ${blogs.length} scheduled blogs.`,
    );

    for (const blog of blogs) {
      try {
        await this.publishService.publish(
          blog.integrationId,
          blog._id.toString(),
        );

        blog.isScheduled = false;

        blog.scheduledFor =
          undefined;

        await blog.save();

        this.logger.log(
          `Published ${blog.title}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed: ${blog.title}`,
          error.message,
        );
      }
    }
  }
}