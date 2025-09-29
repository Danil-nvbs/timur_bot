// back/src/modules/products/product.model.ts
import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Subcategory } from '../categories/subcategory.model';
import { Category } from '../categories/category.model';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class Product extends Model {
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

  @ForeignKey(() => Subcategory)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  subcategoryId: number;

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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.TEXT, // base64 может быть длинным
    allowNull: true,
  })
  image: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isAvailable: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  deleted: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'кг',
  })
  unit: string; // единица измерения (например, "шт.", "грамм", "лоток")

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  step: number; // шаг заказа (например, 1 для шт., 100 для грамм)

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 1,
  })
  minQuantity: number;

  @BelongsTo(() => Category)
  category: Category;

  @BelongsTo(() => Subcategory)
  subcategory: Subcategory;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}