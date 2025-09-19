import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { Order } from './orders.model';
import { OrderItem } from './orders-item.model';

@Module({
  imports: [SequelizeModule.forFeature([Order, OrderItem])],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}