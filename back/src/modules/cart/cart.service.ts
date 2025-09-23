// back/src/modules/cart/cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CartItem } from './cart-item.model';
import { Product } from '../products/product.model';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem)
    private cartItemModel: typeof CartItem,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async addToCart(userId: number, productId: number, quantity: number = 1): Promise<CartItem> {
    const existingItem = await this.cartItemModel.findOne({
      where: { userId, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return existingItem.save();
    }

    return this.cartItemModel.create({
      userId,
      productId,
      quantity,
    });
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return this.cartItemModel.findAll({
      where: { userId },
      include: [
        { 
          model: Product,
          attributes: ['id', 'name', 'price', 'description', 'isAvailable', 'minQuantity']
        }
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async updateCartItemQuantity(cartItemId: number, userId: number, quantity: number): Promise<CartItem> {
    const cartItem = await this.cartItemModel.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new Error('Товар в корзине не найден');
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return cartItem;
    }

    cartItem.quantity = quantity;
    return cartItem.save();
  }

  async removeFromCart(cartItemId: number, userId: number): Promise<void> {
    await this.cartItemModel.destroy({
      where: { id: cartItemId, userId },
    });
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartItemModel.destroy({
      where: { userId },
    });
  }

  async getCartTotal(userId: number): Promise<number> {
    const cartItems = await this.getCartItems(userId);
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }
}