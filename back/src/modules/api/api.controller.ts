import { Controller, Get, Post, Put, Delete, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from '../categories/categories.service';

@Controller()
export class ApiController {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly categoriesService: CategoriesService,
  ) {}

  // Статистика для дашборда
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    const [users, products, orders] = await Promise.all([
      this.usersService.findAll(),
      this.productsService.findAll(),
      this.ordersService.getAllOrders(),
    ]);

    // Выручка: разделяем по статусам
    const revenueCompleted = orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    const revenueInProgress = orders
      .filter((o) => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status as any))
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    // Общая выручка без отменённых
    const totalRevenue = revenueCompleted + revenueInProgress;

    // Сводка заказов по статусам
    const ordersByStatus = orders.reduce(
      (acc: Record<string, number>, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      { pending: 0, confirmed: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 } as Record<string, number>
    );

    // Разбивка выручки (только выполненные) по периодам
    const now = Date.now();
    const ms = {
      h24: 24 * 60 * 60 * 1000,
      d3: 3 * 24 * 60 * 60 * 1000,
      d7: 7 * 24 * 60 * 60 * 1000,
      d30: 30 * 24 * 60 * 60 * 1000,
    };

    const deliveredOrders = orders.filter((o) => o.status === 'delivered');

    const sumPeriod = (fromMs: number) =>
      deliveredOrders
        .filter((o) => new Date(o.createdAt as any).getTime() >= now - fromMs)
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

    const revenueCompletedBreakdown = {
      last24h: sumPeriod(ms.h24),
      last3d: sumPeriod(ms.d3),
      last7d: sumPeriod(ms.d7),
      last30d: sumPeriod(ms.d30),
      all: deliveredOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
    };

    return {
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      revenueCompleted,
      revenueInProgress,
      ordersByStatus,
      revenueCompletedBreakdown,
    };
  }

  // Заказы
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id') id: string) {
    return this.ordersService.getOrderById(+id);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    return this.ordersService.updateOrderStatus(+id, body.status);
  }

  // Продукты
  @Get('products')
  @UseGuards(JwtAuthGuard)
  async getProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    console.log('API: Получение продуктов с фильтрами:', { search, categoryId, subcategoryId, isAvailable });
    
    const filters: any = {};
    if (search) filters.search = search;
    if (categoryId) filters.categoryId = parseInt(categoryId);
    if (subcategoryId) filters.subcategoryId = parseInt(subcategoryId);
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
    
    // Используем метод для админки с изображениями
    const products = await this.productsService.searchProductsForAdmin(filters);
    console.log('API: Найдено продуктов:', products.length);
    return products;
  }

  @Get('products/:id')
  @UseGuards(JwtAuthGuard)
  async getProduct(@Param('id') id: string) {
    return this.productsService.findById(+id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  async createProduct(@Body() productData: any) {
    return this.productsService.create(productData);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(@Param('id') id: string, @Body() productData: any) {
    return this.productsService.update(+id, productData);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') id: string) {
    await this.productsService.delete(+id);
    return { message: 'Продукт удален' };
  }

  // Пользователи
  @Get('users')
  @UseGuards(JwtAuthGuard)
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  // Управление пользователями - только для owner и admin
  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'user' | 'admin' | 'owner' }
  ) {
    console.log(`API: Обновление роли пользователя ${id} на ${body.role}`);
    return this.usersService.updateUserRole(+id, body.role);
  }

  @Patch('users/:id/block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async blockUser(@Param('id') id: string) {
    console.log(`API: Блокировка пользователя ${id}`);
    return this.usersService.blockUser(+id);
  }

  @Patch('users/:id/unblock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async unblockUser(@Param('id') id: string) {
    console.log(`API: Разблокировка пользователя ${id}`);
    return this.usersService.unblockUser(+id);
  }

  @Patch('users/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async toggleUserStatus(@Param('id') id: string) {
    console.log(`API: Переключение статуса пользователя ${id}`);
    return this.usersService.toggleUserStatus(+id);
  }

  // Добавьте новые эндпоинты:
  // Категории
  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategories() {
    console.log('API: Получение категорий');
    const categories = await this.categoriesService.findAll();
    console.log('API: Найдено категорий:', categories.length);
    return categories;
  }

  @Get('categories/:id')
  @UseGuards(JwtAuthGuard)
  async getCategory(@Param('id') id: string) {
    return this.categoriesService.findById(+id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async createCategory(@Body() categoryData: any) {
    return this.categoriesService.create(categoryData);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async updateCategory(@Param('id') id: string, @Body() categoryData: any) {
    return this.categoriesService.update(+id, categoryData);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async deleteCategory(@Param('id') id: string) {
    await this.categoriesService.delete(+id);
    return { message: 'Категория удалена' };
  }

  // Подкатегории
  @Get('subcategories')
  @UseGuards(JwtAuthGuard)
  async getAllSubcategories() {
    return this.categoriesService.findAllSubcategories();
  }

  @Get('subcategories/:id')
  @UseGuards(JwtAuthGuard)
  async getSubcategory(@Param('id') id: string) {
    return this.categoriesService.findSubcategoryById(+id);
  }

  @Get('categories/:id/subcategories')
  @UseGuards(JwtAuthGuard)
  async getSubcategories(@Param('id') id: string) {
    return this.categoriesService.findSubcategoriesByCategory(+id);
  }

  @Post('subcategories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async createSubcategory(@Body() subcategoryData: any) {
    return this.categoriesService.createSubcategory(subcategoryData);
  }

  @Put('subcategories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async updateSubcategory(@Param('id') id: string, @Body() subcategoryData: any) {
    return this.categoriesService.updateSubcategory(+id, subcategoryData);
  }

  @Delete('subcategories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  async deleteSubcategory(@Param('id') id: string) {
    await this.categoriesService.deleteSubcategory(+id);
    return { message: 'Подкатегория удалена' };
  }

  // Обновленные методы для продуктов
  @Get('products/category/:categoryId')
  @UseGuards(JwtAuthGuard)
  async getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findByCategory(+categoryId);
  }

  @Get('products/subcategory/:subcategoryId')
  @UseGuards(JwtAuthGuard)
  async getProductsBySubcategory(@Param('subcategoryId') subcategoryId: string) {
    return this.productsService.findBySubcategory(+subcategoryId);
  }
}