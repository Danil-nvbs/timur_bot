// back/src/modules/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
    console.log('�� JWT Strategy: Секрет для валидации:', process.env.JWT_SECRET || 'your-super-secret-jwt-key-12345');
    console.log('🔑 JWT Strategy: Длина секрета:', (process.env.JWT_SECRET || 'your-super-secret-jwt-key-12345').length);
  }

  async validate(payload: any) {
    console.log('�� JWT Strategy: Получен payload:', payload);
    console.log('🔍 JWT Strategy: Валидация токена для пользователя:', payload.sub);
    
    const user = await this.authService.validateUser(payload);
    if (!user) {
      console.log('❌ JWT Strategy: Пользователь не найден или нет прав');
      throw new UnauthorizedException();
    }
    console.log('✅ JWT Strategy: Пользователь авторизован:', user.id, user.role);
    return user;
  }
}