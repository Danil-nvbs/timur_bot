// back/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/user.model';
import { OtpCode } from './otp.model';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(OtpCode)
    private otpModel: typeof OtpCode,
    private jwtService: JwtService,
    private telegramService: TelegramService,
  ) {}

  async sendOtp(phone: string) {
    console.log('🔍 Поиск пользователя по телефону:', phone);
    
    // Находим пользователя по телефону
    const user = await this.userModel.findOne({ where: { phone } });
    
    if (!user) {
      console.log('❌ Пользователь не найден');
      throw new BadRequestException('Пользователь с таким номером телефона не найден');
    }
  
    console.log('✅ Пользователь найден:', user.id, user.role, 'Активен:', user.isActive);
  
    // Проверяем, что пользователь не заблокирован
    if (!user.isActive) {
      console.log('❌ Пользователь заблокирован');
      throw new UnauthorizedException('Ваш аккаунт заблокирован. Обратитесь к администратору.');
    }
  
    // Проверяем роль пользователя
    if (!['admin', 'owner'].includes(user.role)) {
      console.log('❌ Недостаточно прав:', user.role);
      throw new UnauthorizedException('У вас нет доступа к админке');
    }

    // Генерируем OTP код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    console.log('🔐 Генерируем OTP код:', code, 'Действует до:', expiresAt);

    // Сохраняем OTP код
    await this.otpModel.create({
      userId: user.id,
      code,
      expiresAt,
    });

    // Отправляем код через Telegram бота
    await this.telegramService.sendOtpCode(user.telegramId, code);

    console.log('✅ OTP код отправлен');
    return { message: 'Код отправлен в Telegram' };
  }

  async verifyOtp(phone: string, code: string) {
    console.log('🔍 Проверка OTP:', phone, code);
    
    // Находим пользователя
    const user = await this.userModel.findOne({ where: { phone } });
    
    if (!user) {
      console.log('❌ Пользователь не найден при проверке OTP');
      throw new BadRequestException('Пользователь не найден');
    }

    console.log('✅ Пользователь найден при проверке OTP:', user.id);

    // Находим актуальный OTP код
    const otpCode = await this.otpModel.findOne({
      where: {
        userId: user.id,
        code,
        isUsed: false,
      },
    });

    console.log('🔍 Найденный OTP код:', otpCode ? 'да' : 'нет');

    if (!otpCode) {
      console.log('❌ OTP код не найден или уже использован');
      throw new BadRequestException('Неверный код');
    }

    // Проверяем срок действия
    if (new Date() > otpCode.expiresAt) {
      console.log('❌ OTP код истек');
      await otpCode.update({ isUsed: true });
      throw new BadRequestException('Код истек');
    }

    console.log('✅ OTP код валиден');

    // Помечаем код как использованный
    await otpCode.update({ isUsed: true });
    console.log('✅ OTP код помечен как использованный');

    // Генерируем JWT токен
    const payload = { 
      sub: user.id, 
      phone: user.phone, 
      role: user.role,
      telegramId: user.telegramId 
    };
    
    const accessToken = this.jwtService.sign(payload);
    console.log('✅ JWT токен сгенерирован');

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async validateUser(payload: any) {
    const user = await this.userModel.findByPk(payload.sub);
    
    if (!user) {
      console.log('❌ JWT Strategy: Пользователь не найден');
      throw new UnauthorizedException();
    }
    
    // Проверяем, что пользователь не заблокирован
    if (!user.isActive) {
      console.log('❌ JWT Strategy: Пользователь заблокирован');
      throw new UnauthorizedException('Аккаунт заблокирован');
    }
    
    if (!['admin', 'owner'].includes(user.role)) {
      console.log('❌ JWT Strategy: Недостаточно прав');
      throw new UnauthorizedException();
    }
    
    console.log('✅ JWT Strategy: Пользователь авторизован:', user.id, user.role);
    return user;
  }
}