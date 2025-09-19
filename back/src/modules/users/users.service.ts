// back/src/modules/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findOrCreate(telegramId: number, userData: Partial<User>): Promise<User> {
    const [user, created] = await this.userModel.findOrCreate({
      where: { telegramId },
      defaults: {
        telegramId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        phone: userData.phone,
        role: userData.role || 'user',
        isActive: true,
      },
    });

    if (!created && userData.phone) {
      await user.update({
        phone: userData.phone,
        role: userData.role || user.role,
      });
      return user.reload();
    }

    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    if (!id) {
      throw new Error('ID пользователя не может быть пустым');
    }
    
    await this.userModel.update(userData, { where: { id } });
    return this.userModel.findByPk(id);
  }

  async findById(id: number): Promise<User> {
    return this.userModel.findByPk(id);
  }

  async findByTelegramId(telegramId: number): Promise<User> {
    return this.userModel.findOne({ where: { telegramId } });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }
  
  // Новые методы для управления пользователями
  async updateUserRole(userId: number, role: 'user' | 'admin' | 'owner'): Promise<User> {
    await this.userModel.update({ role }, { where: { id: userId } });
    return this.userModel.findByPk(userId);
  }
  
  async toggleUserStatus(userId: number): Promise<User> {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    
    await this.userModel.update({ isActive: !user.isActive }, { where: { id: userId } });
    return this.userModel.findByPk(userId);
  }
  
  async blockUser(userId: number): Promise<User> {
    await this.userModel.update({ isActive: false }, { where: { id: userId } });
    return this.userModel.findByPk(userId);
  }
  
  async unblockUser(userId: number): Promise<User> {
    await this.userModel.update({ isActive: true }, { where: { id: userId } });
    return this.userModel.findByPk(userId);
  }
}