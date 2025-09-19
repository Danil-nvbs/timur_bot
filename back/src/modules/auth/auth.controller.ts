import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { phone: string }) {
    console.log('📥 Получен запрос на отправку OTP:', body.phone);
    const result = await this.authService.sendOtp(body.phone);
    console.log('�� Отправляем ответ:', result);
    return result;
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phone: string; code: string }) {
    console.log('📥 Получен запрос на проверку OTP:', body.phone, body.code);
    const result = await this.authService.verifyOtp(body.phone, body.code);
    console.log('📤 Отправляем ответ:', result);
    return result;
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Body() body: any) {
    return { message: 'Защищенный роут' };
  }
}