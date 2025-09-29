import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { Order } from './orders.model';
import { OrderItem } from './orders-item.model';
import { Product } from '../products/product.model';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem, Product]), forwardRef(() => TelegramModule)],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}