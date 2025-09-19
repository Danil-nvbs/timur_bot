import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from './product.model';
import { Category } from '../categories/category.model';
import { Subcategory } from '../categories/subcategory.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async findAll(): Promise<Product[]> {
    console.log('🔍 ProductsService.findAll() вызван');
    const products = await this.productModel.findAll({
      where: { isAvailable: true, deleted: false },
      include: [
        { model: Category, attributes: ['id', 'name'], required: false },
        { model: Subcategory, attributes: ['id', 'name'], required: false }
      ],
      order: [['name', 'ASC']],
    });
    console.log(`📦 Найдено продуктов: ${products.length}`);
    return products;
  }

  async findByCategory(categoryId: number): Promise<Product[]> {
    return this.productModel.findAll({
      where: { 
        categoryId, 
        subcategoryId: null, // Только товары без подкатегории
        isAvailable: true, 
        deleted: false 
      },
      include: [
        { model: Category, attributes: ['id', 'name'], required: false },
        { model: Subcategory, attributes: ['id', 'name'], required: false }
      ],
      order: [['name', 'ASC']],
    });
  }

  async findById(id: number): Promise<Product> {
    return this.productModel.findByPk(id);
  }

  async create(productData: Partial<Product>): Promise<Product> {
    return this.productModel.create(productData);
  }

  async update(id: number, productData: Partial<Product>): Promise<Product> {
    await this.productModel.update(productData, { where: { id } });
    return this.productModel.findByPk(id);
  }

  async delete(id: number): Promise<void> {
    // Мягкое удаление - помечаем как удаленный
    await this.productModel.update({ deleted: true }, { where: { id } });
  }

  async getCategories(): Promise<Category[]> {
    const products = await this.productModel.findAll({
      attributes: ['category'],
      where: { isAvailable: true },
      group: ['category'],
    });
    return products.map(p => p.category).filter(Boolean);
  }


  
  async findBySubcategory(subcategoryId: number): Promise<Product[]> {
    return this.productModel.findAll({
      where: { subcategoryId, isAvailable: true, deleted: false },
      include: [
        { model: Category, attributes: ['id', 'name'], required: false },
        { model: Subcategory, attributes: ['id', 'name'], required: false }
      ],
      order: [['name', 'ASC']],
    });
  }

  async searchProducts(filters: {
    search?: string;
    categoryId?: number;
    subcategoryId?: number;
    isAvailable?: boolean;
  }): Promise<Product[]> {
    const where: any = { deleted: false };

    if (filters.search) {
      where.name = {
        [require('sequelize').Op.iLike]: `%${filters.search}%`
      };
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.subcategoryId) {
      where.subcategoryId = filters.subcategoryId;
    }

    if (filters.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    return this.productModel.findAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'], required: false },
        { model: Subcategory, attributes: ['id', 'name'], required: false }
      ],
      order: [['name', 'ASC']],
    });
  }
}