// back/src/modules/categories/categories.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './category.model';
import { Subcategory } from './subcategory.model';

@Module({
  imports: [SequelizeModule.forFeature([Category, Subcategory])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}