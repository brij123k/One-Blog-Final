import { Module } from "@nestjs/common";
import { BlogModule } from "../blog/blog.module";
import { AIModule } from "../ai/ai.module";
import { ImageService } from "./image.service";
import { StorageModule } from "../storage/storage.module";
import { ImageController } from "./image.controller";
import { Blog,BlogSchema } from "../blog/schemas/blog.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({

 imports:[
 MongooseModule.forFeature([
        {
       name: Blog.name,
       schema: BlogSchema,
     },
     ]),
   AIModule,
   StorageModule,

 ],
controllers: [ImageController],
 providers:[ImageService],

 exports:[ImageService],

})
export class ImageModule{}