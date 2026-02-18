import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // Security
    app.use(helmet());

    // CORS - supports comma-separated origins for multiple environments
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 JusticeTrack API running on port ${port}`);
}
bootstrap();
