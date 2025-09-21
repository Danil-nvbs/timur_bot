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

  
  // Закомментированные тестовые категории
  /*
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
  */

  // Новые товары для магазина
  const newProducts = [
    // ФРУКТЫ (categoryId: 4)
    { name: 'Авокадо 1 кг', description: 'Свежий авокадо', price: 590, categoryId: 4, isAvailable: true },
    { name: 'Киви 1 кг', description: 'Свежий киви', price: 320, categoryId: 4, isAvailable: true },
    { name: 'Апельсины 1 кг', description: 'Свежие апельсины', price: 360, categoryId: 4, isAvailable: true },
    { name: 'Груша форель 1 кг', description: 'Свежие груши форель', price: 410, categoryId: 4, isAvailable: true },
    { name: 'Груша конференц 1 кг', description: 'Свежие груши конференц', price: 450, categoryId: 4, isAvailable: true },
    { name: 'Слива кабардинка 1 кг', description: 'Свежие сливы кабардинка', price: 430, categoryId: 4, isAvailable: true },
    { name: 'Слива чернослив 1 кг', description: 'Свежие сливы чернослив', price: 300, categoryId: 4, isAvailable: true },
    { name: 'Нектарин узбекский 1 кг', description: 'Свежие нектарины узбекские', price: 320, categoryId: 4, isAvailable: true },
    { name: 'Виноград мускат 1 кг', description: 'Свежий виноград мускат', price: 540, categoryId: 4, isAvailable: true },
    { name: 'Виноград розовый 1 кг', description: 'Свежий виноград розовый', price: 680, categoryId: 4, isAvailable: true },
    { name: 'Виноград белый киш-миш 1 кг', description: 'Свежий виноград белый киш-миш', price: 410, categoryId: 4, isAvailable: true },
    { name: 'Персик красный 1 кг', description: 'Свежие персики красные', price: 540, categoryId: 4, isAvailable: true },
    { name: 'Нектарин круглый 1 кг', description: 'Свежие нектарины круглые', price: 590, categoryId: 4, isAvailable: true },
    { name: 'Мандарины бейби 1 кг', description: 'Свежие мандарины бейби', price: 270, categoryId: 4, isAvailable: true },
    { name: 'Мандарины на ветке 1 кг', description: 'Свежие мандарины на ветке', price: 300, categoryId: 4, isAvailable: true },
    { name: 'Мандарины пекан 1 кг', description: 'Свежие мандарины пекан', price: 320, categoryId: 4, isAvailable: true },
    { name: 'Гранат 1 кг', description: 'Свежий гранат', price: 590, categoryId: 4, isAvailable: true },
    { name: 'Грейпфрут 1 кг', description: 'Свежий грейпфрут', price: 260, categoryId: 4, isAvailable: true },
    { name: 'Киви голд 100 грамм', description: 'Свежий киви голд', price: 150, categoryId: 4, isAvailable: true },
    { name: 'Инжир 1 шт', description: 'Свежий инжир', price: 100, categoryId: 4, isAvailable: true },
    { name: 'Бананы 1 кг', description: 'Свежие бананы', price: 110, categoryId: 4, isAvailable: true },
    { name: 'Яблоки голден 1 кг', description: 'Свежие яблоки голден', price: 300, categoryId: 4, isAvailable: true },
    { name: 'Яблоки гала 1 кг', description: 'Свежие яблоки гала', price: 260, categoryId: 4, isAvailable: true },
    { name: 'Яблоки малинка 1 кг', description: 'Свежие яблоки малинка', price: 320, categoryId: 4, isAvailable: true },
    { name: 'Яблоки семеренко 1 кг', description: 'Свежие яблоки семеренко', price: 300, categoryId: 4, isAvailable: true },
    { name: 'Яблоки вишневка 1 кг', description: 'Свежие яблоки вишневка', price: 320, categoryId: 4, isAvailable: true },
    { name: 'Арбуз 1 кг', description: 'Свежий арбуз', price: 70, categoryId: 4, isAvailable: true },
    { name: 'Дыня колхозница 1 кг', description: 'Свежая дыня колхозница', price: 120, categoryId: 4, isAvailable: true },
    { name: 'Дыня торпеда 1 кг', description: 'Свежая дыня торпеда', price: 140, categoryId: 4, isAvailable: true },
    { name: 'Дыня эфиопка 1 кг', description: 'Свежая дыня эфиопка', price: 130, categoryId: 4, isAvailable: true },

    // ЯГОДЫ (categoryId: 6)
    { name: 'Голубика шайба 100 грамм', description: 'Свежая голубика', price: 210, categoryId: 6, isAvailable: true },
    { name: 'Малина 1 упаковка 300 грамм', description: 'Свежая малина', price: 410, categoryId: 6, isAvailable: true },

    // ОВОЩИ (categoryId: 5)
    { name: 'Огурцы ЦСКА 1 кг', description: 'Свежие огурцы ЦСКА', price: 410, categoryId: 5, isAvailable: true },
    { name: 'Огурцы весна 1 кг', description: 'Свежие огурцы весна', price: 320, categoryId: 5, isAvailable: true },
    { name: 'Помидоры мохито ростовские 1 кг', description: 'Свежие помидоры мохито ростовские', price: 320, categoryId: 5, isAvailable: true },
    { name: 'Помидоры узбекские 1 кг', description: 'Свежие помидоры узбекские', price: 590, categoryId: 5, isAvailable: true },
    { name: 'Помидоры краснодарские 4-ка 1 кг', description: 'Свежие помидоры краснодарские 4-ка', price: 410, categoryId: 5, isAvailable: true },
    { name: 'Помидоры краснодарские 6-ка 1 кг', description: 'Свежие помидоры краснодарские 6-ка', price: 350, categoryId: 5, isAvailable: true },
    { name: 'Помидоры краснодарские 7-ка 1 кг', description: 'Свежие помидоры краснодарские 7-ка', price: 280, categoryId: 5, isAvailable: true },
    { name: 'Помидоры желтые 1 кг', description: 'Свежие помидоры желтые', price: 590, categoryId: 5, isAvailable: true },
    { name: 'Кукуруза королевская 1 шт', description: 'Свежая кукуруза королевская', price: 90, categoryId: 5, isAvailable: true },
    { name: 'Картофель горох 1 кг', description: 'Свежий картофель горох', price: 150, categoryId: 5, isAvailable: true },
    { name: 'Кабачки 1 кг', description: 'Свежие кабачки', price: 190, categoryId: 5, isAvailable: true },
    { name: 'Баклажаны 1 кг', description: 'Свежие баклажаны', price: 300, categoryId: 5, isAvailable: true },
    { name: 'Перец красный 1 кг', description: 'Свежий перец красный', price: 250, categoryId: 5, isAvailable: true },
    { name: 'Перец ромиро 1 кг', description: 'Свежий перец ромиро', price: 320, categoryId: 5, isAvailable: true },
    { name: 'Перец чили 1 шт', description: 'Свежий перец чили', price: 15, categoryId: 5, isAvailable: true },
    { name: 'Цветная капуста 1 кг', description: 'Свежая цветная капуста', price: 300, categoryId: 5, isAvailable: true },
    { name: 'Брокколи 1 кг', description: 'Свежая брокколи', price: 410, categoryId: 5, isAvailable: true },
    { name: 'Салат Айсберг 1 шт', description: 'Свежий салат Айсберг', price: 210, categoryId: 5, isAvailable: true },
    { name: 'Редис 1 пучок', description: 'Свежий редис', price: 110, categoryId: 5, isAvailable: true },
    { name: 'Пекинская капуста 1кг', description: 'Свежая пекинская капуста', price: 170, categoryId: 5, isAvailable: true },
    { name: 'Картофель синеглазка 1 кг', description: 'Свежий картофель синеглазка', price: 85, categoryId: 5, isAvailable: true },
    { name: 'Картофель гала 1 кг', description: 'Свежий картофель гала', price: 65, categoryId: 5, isAvailable: true },
    { name: 'Морковь 1 кг', description: 'Свежая морковь', price: 60, categoryId: 5, isAvailable: true },
    { name: 'Свекла 1 кг', description: 'Свежая свекла', price: 55, categoryId: 5, isAvailable: true },
    { name: 'Лук репчатый 1 кг', description: 'Свежий лук репчатый', price: 60, categoryId: 5, isAvailable: true },
    { name: 'Лук Ялта (красный) 1 кг', description: 'Свежий лук Ялта (красный)', price: 320, categoryId: 5, isAvailable: true },
    { name: 'Чеснок 100 грамм', description: 'Свежий чеснок', price: 50, categoryId: 5, isAvailable: true },
    { name: 'Имбирь 100 грамм', description: 'Свежий имбирь', price: 55, categoryId: 5, isAvailable: true },

    // ЗЕЛЕНЬ (categoryId: 7)
    { name: 'Укроп 100 грамм', description: 'Свежий укроп', price: 45, categoryId: 7, isAvailable: true },
    { name: 'Петрушка 100 грамм', description: 'Свежая петрушка', price: 45, categoryId: 7, isAvailable: true },
    { name: 'Кинза 100 грамм', description: 'Свежая кинза', price: 50, categoryId: 7, isAvailable: true },
    { name: 'Лук зеленый 100 грамм', description: 'Свежий лук зеленый', price: 50, categoryId: 7, isAvailable: true },
    { name: 'Базилик 100 грамм', description: 'Свежий базилик', price: 65, categoryId: 7, isAvailable: true },
    { name: 'Шпинат 100 грамм', description: 'Свежий шпинат', price: 45, categoryId: 7, isAvailable: true },
    { name: 'Щавель 100 грамм', description: 'Свежий щавель', price: 45, categoryId: 7, isAvailable: true },
  ];

  console.log('🌱 Добавляем новые товары...');
  
  for (const productData of newProducts) {
    const existingProducts = await productsService.findAll();
    if (!existingProducts.find(p => p.name === productData.name)) {
      const product = await productsService.create(productData);
      console.log('✅ Продукт создан:', product.name);
    }
  }

  console.log('🎉 Новые товары успешно добавлены!');
  await app.close();
}

seed().catch(console.error);