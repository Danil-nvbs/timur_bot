// back/src/modules/cart/cart.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CartService } from './cart.service';
import { CartItem } from './cart-item.model';
import { Product } from '../products/product.model';

@Module({
  imports: [SequelizeModule.forFeature([CartItem, Product])],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}