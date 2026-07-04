import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
    Blog,
    BlogStatus,
} from '../blog/schemas/blog.schema';

import { ShopifyService } from '../shopify/shopify.service';
import { ScheduleBlogDto } from './dto/schedule-blog.dto';

@Injectable()
export class PublishService {
    constructor(
        @InjectModel(Blog.name)
        private readonly blogModel: Model<Blog>,

        private readonly shopifyService: ShopifyService,
    ) { }

async publish(
  integrationId: string,
  blogId: string,
) {
  /**
   * Find Blog
   */
  const blog = await this.blogModel.findOne({
    _id: blogId,
    integrationId,
  });

  if (!blog) {
    throw new NotFoundException(
      'Blog not found.',
    );
  }

  /**
   * Validate Blog Status
   */
  if (blog.publishStatus === 'PUBLISHED') {
    throw new BadRequestException(
      'This blog has already been published.',
    );
  }

  if (blog.publishStatus === 'PUBLISHING') {
    throw new BadRequestException(
      'This blog is currently being published.',
    );
  }

//   if (blog.status !== BlogStatus.COMPLETED) {
//     throw new BadRequestException(
//       'Blog generation is not completed yet.',
//     );
//   }

  if (!blog.content || blog.content.trim() === '') {
    throw new BadRequestException(
      'Blog content is empty.',
    );
  }

  if (!blog.title) {
    throw new BadRequestException(
      'Blog title is missing.',
    );
  }

//   if (!blog.heroImage?.localPath) {
//     throw new BadRequestException(
//       'Hero image has not been generated.',
//     );
//   }

  /**
   * Mark Publishing
   */
  blog.publishStatus = 'PUBLISHING';
  blog.publishError = '';

  await blog.save();

  try {
    /**
     * Publish to Shopify
     */
    const result =
      await this.shopifyService.publishBlog({
        integrationId,
        blog,
      });

    /**
     * Save Shopify Information
     */
    blog.publishStatus = 'PUBLISHED';

    blog.publishedAt =
      result.publishedAt
        ? new Date(result.publishedAt)
        : new Date();

    blog.shopifyBlogId =
      result.blogId;

    blog.shopifyArticleId =
      result.articleId;

    blog.shopifyHandle =
      result.handle;

    blog.shopifyUrl =
      result.url;

    blog.publishError = '';
    
      blog.isScheduled = false;

  blog.scheduledFor = undefined;
    /**
     * Save Shopify Hero Image URL
     */
    if (
      blog.heroImage &&
      result.imageUrl
    ) {
      blog.heroImage.shopifyUrl =
        result.imageUrl;
    }

    await blog.save();

    return {
      success: true,

      message:
        'Blog published successfully.',

      data: {
        blogId: blog._id,

        publishStatus:
          blog.publishStatus,

        publishedAt:
          blog.publishedAt,

        shopify: {
          blogId:
            blog.shopifyBlogId,

          articleId:
            blog.shopifyArticleId,

          handle:
            blog.shopifyHandle,

          url:
            blog.shopifyUrl,

          image:
            blog.heroImage?.shopifyUrl,
        },
      },
    };
  } catch (error: any) {
    /**
     * Update Failure Status
     */
    blog.publishStatus = 'FAILED';

    blog.publishError =
      error?.response?.data
        ? JSON.stringify(
            error.response.data,
          )
        : error?.message ??
          'Unknown Shopify publishing error';

    await blog.save();

    throw new BadRequestException({
      success: false,

      message:
        'Failed to publish blog to Shopify.',

      error:
        blog.publishError,
    });
  }
}

async schedule(
  integrationId: string,
  blogId: string,
  dto: ScheduleBlogDto,
) {
  const blog =
    await this.blogModel.findOne({
      _id: blogId,
      integrationId,
    });

  if (!blog) {
    throw new NotFoundException(
      'Blog not found.',
    );
  }

//   if (
//     blog.status !==
//     BlogStatus.COMPLETED
//   ) {
//     throw new BadRequestException(
//       'Blog is not ready for publishing.',
//     );
//   }

//   if (
//     !blog.heroImage?.localPath
//   ) {
//     throw new BadRequestException(
//       'Hero image not found.',
//     );
//   }

  const scheduleDate =
    new Date(
      dto.scheduledFor,
    );

  if (
    scheduleDate <= new Date()
  ) {
    throw new BadRequestException(
      'Scheduled time must be in the future.',
    );
  }

  blog.isScheduled = true;

  blog.publishStatus =
    'SCHEDULED';

  blog.scheduledFor =
    scheduleDate;

  blog.publishError = '';

  await blog.save();

  return {
    success: true,

    message:
      'Blog scheduled successfully.',

    scheduledFor:
      blog.scheduledFor,
  };
}

    /**
     * Cancel Schedule
     */
    async cancelSchedule(
        integrationId: string,
        blogId: string,
    ) {
        const blog =
            await this.blogModel.findOne({
                _id: blogId,
                integrationId,
            });

        if (!blog) {
            throw new NotFoundException(
                'Blog not found.',
            );
        }

        blog.publishStatus =
            'DRAFT';

        // blog.scheduledFor = null;

        await blog.save();

        return {
            success: true,

            message:
                'Scheduled publishing cancelled.',

            blog,
        };
    }
}