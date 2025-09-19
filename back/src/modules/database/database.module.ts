// src/modules/database/database.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../../config/database.config';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { Order } from '../orders/orders.model';
import { OrderItem } from '../orders/orders-item.model';
import { OtpCode } from '../auth/otp.model';
import { Category } from '../categories/category.model';
import { Subcategory } from '../categories/subcategory.model';
import { CartItem } from '../cart/cart-item.model';

@Module({
  imports: [
    ConfigModule.forFeature(databaseConfig),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        models: [User, Product, Order, OrderItem, OtpCode, Category, Subcategory, CartItem],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}