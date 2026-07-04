import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { PlansModule } from './modules/plans/plans.module';
import { ShopifyModule } from './modules/shopify/shopify.module';
import { AuthModule } from './modules/auth/auth.module';
import { AIModule } from './modules/ai/ai.module';
import { StoreIntelligenceModule } from './modules/store-intelligence/store-intelligence.module';
import { BlogModule } from './modules/blog/blog.module';
import { ImageModule } from './modules/image/image.module';
import { CountryEventModule } from './modules/country-events/country-event.module';
import { PublishModule } from './modules/publish/publish.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),

    MongooseModule.forRoot(
      process.env.MONGO_URI!,
    ),
    IntegrationsModule,
    AuthModule,
    PlansModule,
    ShopifyModule,
    AIModule,
    StoreIntelligenceModule,
    BlogModule,
    ImageModule,
    CountryEventModule,
    PublishModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
