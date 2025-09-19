import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Настройка CORS для фронта
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3002'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    // Глобальный префикс для API
    app.setGlobalPrefix('api');
    
    const port = process.env.PORT || 3001;
    await app.listen(port);
    
    new Logger('MainTS').log(`🚀 Приложение запущено на порту ${port}`);
    new Logger('MainTS').log(`📡 API доступно по адресу: http://localhost:${port}/api`);
    new Logger('MainTS').log(`🤖 Telegram Bot запускается...`);
  } catch (error) {
    new Logger('MainTS').error('❌ Ошибка при запуске приложения:', error);
    process.exit(1);
  }
}

bootstrap();