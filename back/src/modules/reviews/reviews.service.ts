import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Review } from './review.model';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private reviewModel: typeof Review,
  ) {}

  async create(data: Partial<Review>) {
    // Валидация на дубликаты: один отзыв на (userId, orderId, productId) или (userId, orderId) или (userId, productId)
    const userId = data.userId as number;
    const orderId = (data.orderId as number) || null;
    const productId = (data.productId as number) || null;

    if (userId && orderId && productId) {
      const exists = await this.existsForOrderProduct(userId, orderId, productId);
      if (exists) {
        throw new Error('Отзыв по этому товару в данном заказе уже оставлен');
      }
    } else if (userId && orderId && !productId) {
      // Проверяем только наличие именно заказного отзыва (productId IS NULL),
      // продуктовые отзывы внутри заказа не блокируют отзыв по заказу целиком
      const exists = await this.existsForOrderByUser(userId, orderId);
      if (exists) {
        throw new Error('Отзыв по этому заказу уже оставлен');
      }
    } else if (userId && productId && !orderId) {
      const exists = await this.existsForProduct(productId, userId);
      if (exists) {
        throw new Error('Отзыв по этому товару уже оставлен');
      }
    }

    return this.reviewModel.create(data as any);
  }

  findByProduct(productId: number, offset = 0, limit = 10) {
    return this.reviewModel.findAll({
      where: { productId, hidden: false },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
  }

  findLatestAll(offset = 0, limit = 10) {
    return this.reviewModel.findAll({
      where: { hidden: false },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
  }

  findLatestOrdersOnly(offset = 0, limit = 10) {
    return this.reviewModel.findAll({
      where: { hidden: false, productId: null },
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });
  }

  hide(id: number) {
    return this.reviewModel.update({ hidden: true }, { where: { id } });
  }

  unhide(id: number) {
    return this.reviewModel.update({ hidden: false }, { where: { id } });
  }

  async getProductStats(productId: number): Promise<{ avg: number; count: number }> {
    const { fn, col } = require('sequelize');
    const result = await this.reviewModel.findAll({
      where: { productId, hidden: false },
      attributes: [[fn('AVG', col('rating')), 'avg'], [fn('COUNT', col('id')), 'count']],
      raw: true,
    });
    const row = result[0] as any;
    const avg = row?.avg ? parseFloat(Number(row.avg).toFixed(2)) : 0;
    const count = row?.count ? parseInt(row.count) : 0;
    return { avg, count };
  }

  async existsForOrder(orderId: number): Promise<boolean> {
    const count = await this.reviewModel.count({ where: { orderId, hidden: false } });
    return count > 0;
  }

  async existsForProduct(productId: number, userId?: number): Promise<boolean> {
    const where: any = { productId, hidden: false };
    if (userId) where.userId = userId;
    const count = await this.reviewModel.count({ where });
    return count > 0;
  }

  async existsForOrderProduct(userId: number, orderId: number, productId: number): Promise<boolean> {
    const count = await this.reviewModel.count({ where: { userId, orderId, productId, hidden: false } });
    return count > 0;
  }

  async existsForOrderByUser(userId: number, orderId: number): Promise<boolean> {
    // Считаем только отзывы уровня заказа (productId IS NULL)
    const count = await this.reviewModel.count({ where: { userId, orderId, productId: null, hidden: false } });
    return count > 0;
  }
}


