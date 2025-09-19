import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { CategoriesModule } from '../categories/categories.module';
import { CartModule } from '../cart/cart-module';

@Module({
  imports: [UsersModule, ProductsModule, OrdersModule, CategoriesModule, CartModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}