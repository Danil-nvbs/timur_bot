// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/user.model';
import { OtpCode } from './otp.model';
import { TelegramModule } from '../telegram/telegram.module';
console.log('🔑 AuthModule: Секрет из env:', process.env.JWT_SECRET);
console.log('🔑 AuthModule: Секрет для подписи:', process.env.JWT_SECRET || 'your-secret-key');

@Module({
  imports: [
    SequelizeModule.forFeature([User, OtpCode]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-12345',
      signOptions: { expiresIn: '24h' },
    }),
    TelegramModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}