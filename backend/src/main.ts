import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS для production - убираем слеш в конце
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || '*';
  
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3001'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`Mesh Network Backend running on http://localhost:${port}`);
}

bootstrap();
