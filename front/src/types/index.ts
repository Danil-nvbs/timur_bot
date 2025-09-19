// front/src/types/index.ts
export interface User {
  id: number;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'owner';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: number;
  subcategoryId?: number;
  isAvailable: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  subcategory?: Subcategory;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  product?: Product;
}