// back/src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './modules/products/products.service';
import { UsersService } from './modules/users/users.service';
import { CategoriesService } from './modules/categories/categories.service';


async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);
  const usersService = app.get(UsersService);
  const categoriesService = app.get(CategoriesService);

  // Сначала проверяем, есть ли уже админ
  let adminUser = await usersService.findByTelegramId(373531147);
  
  if (!adminUser) {
    // Создаем нового админа
    adminUser = await usersService.findOrCreate(373531147, {
      firstName: 'Danil',
      lastName: 'Osipov',
      username: 'DanilOsipov',
      phone: '79636871080',
      role: 'owner',
    });
    console.log('✅ Админ создан:', adminUser);
  } else {
    // Обновляем существующего пользователя до админа
    adminUser = await usersService.updateUser(adminUser.id, {
      phone: '79636871080',
      role: 'owner',
      firstName: 'Danil',
      lastName: 'Osipov',
      username: 'DanilOsipov',
    });
    console.log('✅ Админ обновлен:', adminUser);
  }

  
  const testCategories = [
    {
      name: 'Молочные продукты',
      description: 'Свежие молочные продукты',
      icon: '🥛',
    },
    {
      name: 'Хлебобулочные изделия',
      description: 'Свежий хлеб и выпечка',
      icon: '��',
    },
    {
      name: 'Фрукты и овощи',
      description: 'Свежие фрукты и овощи',
      icon: '🍎',
    },
  ];

  for (const categoryData of testCategories) {
    const existingCategory = await categoriesService.findAll();
    if (!existingCategory.find(c => c.name === categoryData.name)) {
      const category = await categoriesService.create(categoryData);
      console.log('✅ Категория создана:', category.name);
    }
  }


  const testProducts = [
    {
      name: 'Молоко 3.2%',
      description: 'Свежее коровье молоко, 1 литр',
      price: 89.50,
      categoryId: 1, // ID категории "Молочные продукты"
      isAvailable: true,
    },
    {
      name: 'Хлеб белый',
      description: 'Свежий белый хлеб из пекарни',
      price: 45.00,
      categoryId: 2, // ID категории "Хлебобулочные изделия"
      isAvailable: true,
    },
    {
      name: 'Яблоки красные',
      description: 'Свежие красные яблоки, 1 кг',
      price: 120.00,
      categoryId: 3, // ID категории "Фрукты и овощи"
      isAvailable: true,
    },
    {
      name: 'Курица целая',
      description: 'Свежая курица, 1.5 кг',
      price: 350.00,
      categoryId: 3, // ID категории "Фрукты и овощи" (или создайте новую категорию "Мясо")
      isAvailable: true,
    },
  ];

  console.log('🌱 Добавляем тестовые продукты...');
  
  for (const productData of testProducts) {
    const existingProducts = await productsService.findAll();
    if (!existingProducts.find(p => p.name === productData.name)) {
      const product = await productsService.create(productData);
      console.log('✅ Продукт создан:', product.name);
    }
  }


  console.log('🎉 Тестовые данные успешно добавлены!');
  await app.close();
}

seed().catch(console.error);