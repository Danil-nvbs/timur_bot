// back/src/modules/api/api.module.ts
import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [UsersModule, ProductsModule, OrdersModule, AuthModule, CategoriesModule],
  controllers: [ApiController],
})
export class ApiModule {}