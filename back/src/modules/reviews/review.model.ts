import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Product } from '../products/product.model';
import { Order } from '../orders/orders.model';

@Table({
  tableName: 'reviews',
  timestamps: true,
})
export class Review extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ForeignKey(() => Product)
  @Column({ type: DataType.INTEGER, allowNull: true })
  productId: number | null;

  @ForeignKey(() => Order)
  @Column({ type: DataType.INTEGER, allowNull: true })
  orderId: number | null;

  @Column({ type: DataType.INTEGER, allowNull: false })
  rating: number; // 1..5

  @Column({ type: DataType.TEXT, allowNull: true })
  text: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  photos: string[] | null; // массив data URL или ссылок

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  hidden: boolean;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => Order)
  order: Order;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}


