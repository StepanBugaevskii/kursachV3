import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS для всех клиентов (web, mobile, desktop)
  app.enableCors({
    origin: true, // Разрешить все origins для мобильных клиентов
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Mesh Network Backend running on http://localhost:${port}`);
}

bootstrap();
