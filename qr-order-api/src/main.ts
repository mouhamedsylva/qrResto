import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  const config = app.get(ConfigService);

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  app.setGlobalPrefix('api/v1');
  const corsOrigin = config.get<string>('corsOrigin');
  const corsOriginsRaw = process.env.APP_CORS_ORIGINS;

  const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, '');
  const configuredOrigins = (corsOriginsRaw ? corsOriginsRaw.split(',') : [])
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);
  const fallbackOrigins = [
    corsOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]
    .filter(Boolean)
    .map((origin) => normalizeOrigin(origin as string));

  const allowedOrigins = new Set([...configuredOrigins, ...fallbackOrigins]);
  // Allow localhost and local network IP addresses
  const localNetworkPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : '';

      // Allow requests with no origin (like mobile apps or curl)
      if (
        !origin ||
        allowedOrigins.has(normalizedOrigin) ||
        localNetworkPattern.test(normalizedOrigin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swagger = new DocumentBuilder()
    .setTitle('QR-Order API')
    .setDescription(
      'Documentation complète de l\'API pour le système de commande par QR Code (SaaS Multi-tenant).',
    )
    .setVersion('1.0')
    .setTermsOfService('https://example.com/terms')
    .setContact('Antoine Sylva', 'https://example.com', 'thicosylva@gmail.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Authentification', 'Gestion des tokens et inscription')
    .addTag('Utilisateurs', 'Profil et gestion d\'équipe')
    .addTag('Restaurants', 'Paramètres et configuration des établissements')
    .addTag('Menus & Catégories', 'Gestion de la carte')
    .addTag('Tables', 'Gestion de l\'espace physique et QR Codes')
    .addTag('Commandes', 'Cycle de vie des commandes clients')
    .addTag('Abonnements', 'Gestion des forfaits SaaS')
    .addTag('Paiements', 'Transactions Stripe et Webhooks')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'QR-Order API Docs',
  });

  await app.listen(config.get('PORT') ?? 3000);
}
bootstrap();
