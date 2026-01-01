// dotenv not needed in Lambda - environment variables are already available
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Handler, Context, Callback } from 'aws-lambda';
import { Express } from 'express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer: Handler;

async function bootstrap(): Promise<Express> {
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  nestApp.enableCors({
    origin: [
      'http://localhost:5173',
      'https://hoppscotch.io',
      process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    credentials: true,
  });

  nestApp.setGlobalPrefix('api');
  nestApp.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('MeetEase API')
    .setDescription('API documentation for the MeetEase backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(nestApp, config);
  SwaggerModule.setup('api/docs', nestApp, document);

  await nestApp.init();
  return expressApp;
}

export const handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  try {
    if (!cachedServer) {
      console.log('Initializing NestJS application...');
      console.log('Environment variables check:', {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      });
      const expressApp = await bootstrap();
      cachedServer = serverlessExpress({ app: expressApp });
      console.log('NestJS application initialized successfully');
    }
    return cachedServer(event, context, callback);
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

