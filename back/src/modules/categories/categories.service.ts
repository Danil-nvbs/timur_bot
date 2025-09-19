// back/src/modules/categories/categories.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './category.model';
import { Subcategory } from './subcategory.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(Subcategory)
    private subcategoryModel: typeof Subcategory,
  ) {}

  // Категории
  async findAll(): Promise<Category[]> {
    console.log('🔍 CategoriesService.findAll() вызван');
    const categories = await this.categoryModel.findAll({
      where: { isActive: true, deleted: false },
      order: [['name', 'ASC']],
    });
    console.log(`📂 Найдено категорий: ${categories.length}`);
    return categories;
  }

  async findById(id: number): Promise<Category> {
    return this.categoryModel.findByPk(id);
  }

  async create(categoryData: any): Promise<Category> {
    return this.categoryModel.create(categoryData);
  }

  async update(id: number, categoryData: any): Promise<Category> {
    await this.categoryModel.update(categoryData, { where: { id } });
    return this.categoryModel.findByPk(id);
  }

  async delete(id: number): Promise<void> {
    // Мягкое удаление - помечаем как удаленный
    await this.categoryModel.update({ deleted: true }, { where: { id } });
  }

  // Подкатегории
  async findAllSubcategories(): Promise<Subcategory[]> {
    return this.subcategoryModel.findAll({
      where: { isActive: true, deleted: false },
      include: [{ model: Category, required: false }],
      order: [['name', 'ASC']],
    });
  }

  async findSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
    return this.subcategoryModel.findAll({
      where: { categoryId, isActive: true, deleted: false },
      order: [['name', 'ASC']],
    });
  }

  async findSubcategoryById(id: number): Promise<Subcategory> {
    return this.subcategoryModel.findByPk(id);
  }

  async createSubcategory(subcategoryData: any): Promise<Subcategory> {
    return this.subcategoryModel.create(subcategoryData);
  }

  async updateSubcategory(id: number, subcategoryData: any): Promise<Subcategory> {
    await this.subcategoryModel.update(subcategoryData, { where: { id } });
    return this.subcategoryModel.findByPk(id);
  }

  async deleteSubcategory(id: number): Promise<void> {
    // Мягкое удаление - помечаем как удаленный
    await this.subcategoryModel.update({ deleted: true }, { where: { id } });
  }
}