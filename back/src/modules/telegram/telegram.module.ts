import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { CartModule } from '../cart/cart-module';
import { ReviewsModule } from '../reviews/reviews.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [UsersModule, ProductsModule, forwardRef(() => OrdersModule), CategoriesModule, CartModule, ReviewsModule],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}