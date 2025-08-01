import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.enableCors(
    {
      origin: configService.getOrThrow<string>('CORS_ORIGIN'),
      methods: configService.getOrThrow<string>('CORS_METHODS'),
      allowedHeaders: configService.getOrThrow<string>('CORS_ALLOWED_HEADERS'),
      credentials: configService.getOrThrow<boolean>('CORS_CREDENTIALS'),
    }
  );
  
  app.setGlobalPrefix(configService.getOrThrow<string>('API_PREFIX'));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.getOrThrow<string>('API_TITLE'))
    .setDescription(configService.getOrThrow<string>('API_DESCRIPTION'))
    .setVersion(configService.getOrThrow<string>('API_VERSION'))
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(configService.getOrThrow<string>('API_DOCS_PATH'), app, document);

  const logger = new Logger('bootstrap');
  logger.log(`Application is listening on port ${configService.getOrThrow<number>('API_PORT')}`);

  await app.listen(configService.getOrThrow<number>('API_PORT'));
}
bootstrap();
