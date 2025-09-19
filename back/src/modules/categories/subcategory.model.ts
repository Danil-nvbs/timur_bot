// back/src/modules/categories/subcategory.model.ts
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Category } from './category.model';
import { Product } from '../products/product.model';

@Table({
  tableName: 'subcategories',
  timestamps: true,
})
export class Subcategory extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  deleted: boolean;

  @BelongsTo(() => Category)
  category: Category;

  @HasMany(() => Product)
  products: Product[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}