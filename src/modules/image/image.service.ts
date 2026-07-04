import { Injectable, NotFoundException } from "@nestjs/common";
import { Blog, BlogStatus } from "../blog/schemas/blog.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { StorageService } from "../storage/storage.service";
import { AIService } from '../ai/ai.service';
@Injectable()
export class ImageService {

    constructor(

        @InjectModel(Blog.name)

        private blogModel: Model<Blog>,

        private storageService: StorageService,

        private aiService: AIService,

    ) { }

    async generateHeroImage(blogId: string) {

        const blog =await this.blogModel.findById(blogId);

        if (!blog) {
            throw new NotFoundException();
        }

        const image =
    await this.aiService.generateImage(
        blog.heroImagePrompt,
    );
    console.timeEnd("image");
    console.log('image generated', image);
        const stored =

            await this.storageService.saveImage(

                image,

                'png',

            );

        blog.heroImage = stored;

        blog.status = BlogStatus.COMPLETED;

        await blog.save();

        return blog;

    }

}