import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './orders.model';
import { OrderItem } from './orders-item.model';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    @InjectModel(OrderItem)
    private orderItemModel: typeof OrderItem,
    @Inject(forwardRef(() => TelegramService)) private readonly telegramService: TelegramService,
  ) {}

  async createOrder(userId: number, orderData: any): Promise<Order> {
    return this.orderModel.create({
      userId,
      totalPrice: 0, // Будет обновлено после создания позиций заказа
      status: 'pending',
      ...orderData,
    });
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return this.orderModel.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderModel.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'username', 'phone'],
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    await this.orderModel.update({ status }, { where: { id: orderId } });
    const order = await this.orderModel.findByPk(orderId);
    // Обновляем сообщение статуса в боте (если отслеживается)
    try { await this.telegramService.updateOrderStatusMessage(orderId, status); } catch {}
    return order;
  }

  async updateOrderTotal(orderId: number, totalPrice: number): Promise<Order> {
    await this.orderModel.update({ totalPrice }, { where: { id: orderId } });
    return this.orderModel.findByPk(orderId);
  }

  async getOrderById(orderId: number): Promise<Order> {
    return this.orderModel.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price'],
            },
          ],
        },
      ],
    });
  }

  async createOrderItem(orderItemData: any): Promise<OrderItem> {
    return this.orderItemModel.create(orderItemData);
  }
}