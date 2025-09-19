import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    console.log('🛡️ JWT Guard: Начинаем проверку авторизации');
    
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    console.log('🔑 JWT Guard: Полный заголовок Authorization:', authHeader);
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      console.log('🔍 JWT Guard: Части заголовка:', parts);
      console.log('🔍 JWT Guard: Bearer часть:', parts[0]);
      console.log('🔍 JWT Guard: Токен часть:', parts[1] ? parts[1].substring(0, 20) + '...' : 'нет');
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('�� JWT Guard: handleRequest - err:', err ? err.message : 'нет', 'user:', user ? 'есть' : 'нет', 'info:', info ? info.message : 'нет');
    
    if (err || !user) {
      console.log('❌ JWT Guard: Авторизация не прошла');
      throw err || new UnauthorizedException();
    }
    
    console.log('✅ JWT Guard: Авторизация прошла успешно');
    return user;
  }
}