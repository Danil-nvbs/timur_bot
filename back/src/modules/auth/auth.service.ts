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
    
    const user = await this.userModel.findOne({ where: { phone } });
    if (!user) throw new BadRequestException('Пользователь с таким номером телефона не найден');
    if (!user.isActive) throw new UnauthorizedException('Ваш аккаунт заблокирован. Обратитесь к администратору.');
    if (!['admin', 'owner'].includes(user.role)) throw new UnauthorizedException('У вас нет доступа к админке');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.otpModel.create({
      userId: user.id,
      code,
      expiresAt,
    });

    await this.telegramService.sendOtpCode(user.telegramId, code);
    return { message: 'Код отправлен в Telegram' };
  }

  async verifyOtp(phone: string, code: string) {
    
    const user = await this.userModel.findOne({ where: { phone } });
    if (!user) throw new BadRequestException('Пользователь не найден');

    const otpCode = await this.otpModel.findOne({
      where: {
        userId: user.id,
        code,
        isUsed: false,
      },
    });


    if (!otpCode) throw new BadRequestException('Неверный код');

    if (new Date() > otpCode.expiresAt) {
      await otpCode.update({ isUsed: true });
      throw new BadRequestException('Код истек');
    }

    await otpCode.update({ isUsed: true });

    const payload = { 
      sub: user.id, 
      phone: user.phone, 
      role: user.role,
      telegramId: user.telegramId 
    };
    
    const accessToken = this.jwtService.sign(payload);

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
    if (!user) throw new UnauthorizedException();
    if (!user.isActive) throw new UnauthorizedException('Аккаунт заблокирован');
    if (!['admin', 'owner'].includes(user.role)) throw new UnauthorizedException();
    return user;
  }
}