// back/src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return this.categoriesService.findById(+id);
  }

  @Post()
  async createCategory(@Body() categoryData: any) {
    return this.categoriesService.create(categoryData);
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() categoryData: any) {
    return this.categoriesService.update(+id, categoryData);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.delete(+id);
    return { message: 'Категория удалена' };
  }

  // Подкатегории
  @Get(':id/subcategories')
  async getSubcategories(@Param('id') id: string) {
    return this.categoriesService.findSubcategoriesByCategory(+id);
  }

  @Post('subcategories')
  async createSubcategory(@Body() subcategoryData: any) {
    return this.categoriesService.createSubcategory(subcategoryData);
  }

  @Put('subcategories/:id')
  async updateSubcategory(@Param('id') id: string, @Body() subcategoryData: any) {
    return this.categoriesService.updateSubcategory(+id, subcategoryData);
  }

  @Delete('subcategories/:id')
  async deleteSubcategory(@Param('id') id: string) {
    await this.categoriesService.deleteSubcategory(+id);
    return { message: 'Подкатегория удалена' };
  }
}