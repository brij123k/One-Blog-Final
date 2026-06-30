import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  /**
   * Swagger
   */
  const config = new DocumentBuilder()
    .setTitle('Blog1 API')
    .setDescription('Blog1 AI Platform API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter Blog1 JWT Token',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    'docs',
    app,
    document,
    {
      swaggerOptions: {
        persistAuthorization: true,
      },
    },
  );

  const port = Number(process.env.PORT) || 5000;

  await app.listen(port);

  console.log(
    `🚀 Server Running : http://localhost:${port}`,
  );

  console.log(
    `📚 Swagger : http://localhost:${port}/docs`,
  );
}

bootstrap();