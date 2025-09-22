import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { CategoriesService } from '../categories/categories.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly MIN_ORDER_AMOUNT = 3000; // Минимальная сумма заказа в рублях
  private bot: Bot;
  
  // Состояние для отслеживания процесса оформления заказа
  private orderStates = new Map<number, { step: 'address' | 'confirm', tempOrder: any }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly categoriesService: CategoriesService,
    private readonly cartService: CartService,
  ) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      this.logger.error('❌ TELEGRAM_BOT_TOKEN не найден!');
      return;
    }
    
    this.bot = new Bot(token);
    this.logger.log('🤖 Telegram Bot инициализирован');
  }

  async onModuleInit() {
    try {
      const me = await this.bot.api.getMe();
      this.logger.log(`🤖 Telegram Bot запущен: @${me.username}`);
      
      this.bot.command('start', async (ctx) => {
        const telegramId = ctx.from?.id;
        const firstName = ctx.from?.first_name || '';
        const lastName = ctx.from?.last_name || '';
        const username = ctx.from?.username || '';
      
        if (!telegramId) {
          this.logger.error('Telegram ID не найден');
      return;
    }

        this.logger.log(`👤 Пользователь ${telegramId} написал /start`);
      
        // Проверяем, есть ли пользователь в базе
        let user = await this.usersService.findByTelegramId(telegramId);
        
        if (!user) {
          // Создаем нового пользователя БЕЗ телефона
          user = await this.usersService.findOrCreate(telegramId, {
            firstName,
            lastName,
            username,
            phone: null,
            role: 'user',
          });
          
          this.logger.log(`✅ Новый пользователь создан: ${user.id}`);
          
          // Отправляем сообщение с запросом телефона
          await ctx.reply(
            `👋 Привет, ${firstName}!\n\n` +
            `Для продолжения работы мне нужен ваш номер телефона.\n` +
            `Пожалуйста, нажмите кнопку ниже и поделитесь номером телефона.`,
            {
              reply_markup: {
                keyboard: [
                  [{
                    text: '📱 Поделиться номером телефона',
                    request_contact: true
                  }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
              }
            }
          );
          
        } else if (!user.isActive) {
          // Пользователь заблокирован
          await ctx.reply(
            `❌ Ваш аккаунт заблокирован.\n\n` +
            `Обратитесь к администратору для разблокировки.`
          );
          return;
          
        } else if (!user.phone) {
          // Пользователь есть, но без телефона
      await ctx.reply(
            `👋 Снова привет, ${user.firstName}!\n\n` +
            `Для продолжения работы мне нужен ваш номер телефона.\n` +
            `Пожалуйста, нажмите кнопку ниже и поделитесь номером телефона.`,
        {
          reply_markup: {
                keyboard: [
                  [{
                    text: '📱 Поделиться номером телефона',
                    request_contact: true
                  }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
              }
            }
          );
          
        } else {
          // Пользователь есть с телефоном - показываем главное меню
          await this.showMainMenu(ctx, user);
        }
      });
  
      // Обработка контакта (номера телефона)
      this.bot.on('message:contact', async (ctx) => {
        const telegramId = ctx.from?.id;
        const contact = ctx.message?.contact;
      
        if (!telegramId || !contact?.phone_number) {
          await ctx.reply('❌ Не удалось получить номер телефона. Попробуйте еще раз.');
          return;
        }
      
        // Находим пользователя и проверяем его статус
        const user = await this.usersService.findByTelegramId(telegramId);
        
        if (!user) {
          await ctx.reply('❌ Пользователь не найден. Попробуйте написать /start еще раз.');
          return;
        }
      
        if (!user.isActive) {
          await ctx.reply('❌ Ваш аккаунт заблокирован. Обратитесь к администратору.');
          return;
        }
  
        // Очищаем номер телефона (убираем + и пробелы)
        let cleanPhone = contact.phone_number.replace(/[\s\+]/g, '');
        
        // Если номер начинается с 8, заменяем на 7
        if (cleanPhone.startsWith('8') && cleanPhone.length === 11) {
          cleanPhone = '7' + cleanPhone.slice(1);
        }
  
        this.logger.log(`📞 Пользователь ${telegramId} поделился номером: ${cleanPhone}`);
  
        try {
          // Находим пользователя и обновляем его телефон
          const user = await this.usersService.findByTelegramId(telegramId);
          
          if (!user) {
            await ctx.reply('❌ Пользователь не найден. Попробуйте написать /start еще раз.');
            return;
          }
  
          // Проверяем, что у пользователя есть ID
          if (!user.id) {
            this.logger.error('❌ У пользователя отсутствует ID');
            await ctx.reply('❌ Произошла ошибка. Попробуйте написать /start еще раз.');
            return;
          }

          // Обновляем телефон пользователя
          await this.usersService.updateUser(user.id, { phone: cleanPhone });
          
          this.logger.log(`✅ Телефон пользователя ${user.id} обновлен: ${cleanPhone}`);
  
          // Показываем главное меню
          await this.showMainMenu(ctx, { ...user.toJSON(), phone: cleanPhone });
          
        } catch (error) {
          this.logger.error(`Ошибка обновления телефона: ${error.message}`);
          await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
        }
      });
  
      // Обработка текстовых сообщений (если пользователь еще не поделился телефоном)
      this.bot.on('message:text', async (ctx) => {
        const telegramId = ctx.from?.id;
        const text = ctx.message?.text;
      
        if (!telegramId || !text) return;
      
        // Проверяем статус пользователя
        const user = await this.usersService.findByTelegramId(telegramId);
        
        if (!user || !user.isActive) {
          await ctx.reply('❌ Ваш аккаунт заблокирован. Обратитесь к администратору.');
          return;
        }
        
        if (!user.phone) {
          // Пользователь есть, но без телефона - просим поделиться номером
          await ctx.reply(
            `Пожалуйста, нажмите кнопку "Поделиться номером телефона".`,
            {
              reply_markup: {
                keyboard: [
                  [{
                    text: '📱 Поделиться номером телефона',
                    request_contact: true
                  }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
              }
            }
          );
          return;
        }

        // Проверяем, находится ли пользователь в процессе оформления заказа
        const orderState = this.orderStates.get(user.id);
        if (orderState && orderState.step === 'address') {
          // Пользователь вводит адрес
          await this.handleAddressInput(ctx, user, text);
          return;
        }

        // Если пользователь не в процессе оформления заказа, показываем главное меню
        await this.showMainMenu(ctx, user.toJSON());
      });

      // Обработка callback кнопок
    this.bot.on('callback_query:data', async (ctx) => {
      const data = ctx.callbackQuery.data;
        
        console.log(`🔘 Нажата кнопка: ${data}`);
      
      switch (data) {
        case 'catalog':
          await this.showCatalog(ctx);
          break;
        case 'my_orders':
          await this.showMyOrders(ctx);
          break;
          case 'about':
            await this.showAbout(ctx);
            break;
          case 'support':
            await this.showSupport(ctx);
            break;
          case 'back_to_menu':
            const user = await this.usersService.findByTelegramId(ctx.from.id);
            if (!user) {
              this.logger.error('❌ back_to_menu: пользователь не найден');
              await ctx.editMessageText('❌ Произошла ошибка. Попробуйте написать /start еще раз.');
              return;
            }
            await this.showMainMenu(ctx, user);
            break;
          case 'cart':
            await this.showCart(ctx);
            break;
          case 'cart_clear':
            await this.clearCart(ctx);
            break;
          case 'checkout':
            await this.showCheckout(ctx);
            break;
          case 'confirm_order':
            await this.confirmOrder(ctx);
          break;
        default:
            if (data.startsWith('category_')) {
              const categoryId = parseInt(data.replace('category_', ''));
              await this.showCategory(ctx, categoryId);
            } else if (data.startsWith('subcategory_')) {
              const subcategoryId = parseInt(data.replace('subcategory_', ''));
              await this.showSubcategory(ctx, subcategoryId);
            } else if (data.startsWith('product_')) {
              const productId = parseInt(data.replace('product_', ''));
              await this.showProduct(ctx, productId);
            } else if (data.startsWith('add_to_cart_')) {
              const productId = parseInt(data.replace('add_to_cart_', ''));
              await this.addToCart(ctx, productId);
            } else if (data.startsWith('cart_inc_')) {
              const cartItemId = parseInt(data.replace('cart_inc_', ''));
              await this.updateCartQuantity(ctx, cartItemId, 1);
            } else if (data.startsWith('cart_dec_')) {
              const cartItemId = parseInt(data.replace('cart_dec_', ''));
              await this.updateCartQuantity(ctx, cartItemId, -1);
            } else if (data.startsWith('cart_remove_')) {
              const cartItemId = parseInt(data.replace('cart_remove_', ''));
              await this.removeFromCart(ctx, cartItemId);
            } else {
              // await ctx.answerCallbackQuery();
          }
          break;
      }
      
        // await ctx.answerCallbackQuery();
      });
  
      this.bot.catch((err) => {
        this.logger.error('❌ Ошибка в Telegram Bot:', err);
      });
      
      this.bot.start({ drop_pending_updates: true });
      this.logger.log('✅ Telegram Bot успешно запущен и начал polling');
      
    } catch (error) {
      this.logger.error(`❌ Ошибка запуска Telegram Bot: ${error.message}`);
    }
  }
  
  private async showMainMenu(ctx: any, user: any) {
    if (!user || !user.id) {
      this.logger.error('❌ showMainMenu: пользователь или его ID отсутствует');
      await ctx.reply('❌ Произошла ошибка. Попробуйте написать /start еще раз.');
      return;
    }

    const cartItems = await this.cartService.getCartItems(user.id);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
    let message = `🎉 Отлично, ${user.firstName}!\n\n` +
      `Добро пожаловать в наш магазин продуктов! 🛒\n\n` +
      `Выберите действие:`
    let options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Каталог товаров', callback_data: 'catalog' }],
          [{ text: `🛍 Корзина ${cartCount > 0 ? `(${cartCount})` : ''}`, callback_data: 'cart' }],
          [{ text: '📋 Мои заказы', callback_data: 'my_orders' }],
          [{ text: 'ℹ️ О нас', callback_data: 'about' }],
          [{ text: '📞 Поддержка', callback_data: 'support' }]
        ]
      }
    }
    if (ctx.callbackQuery) {
      await ctx.editMessageText(
        message,
        options
      );
    } else {
      await ctx.reply(
        message,
        options
      );
    }
  }
  
  async sendOtpCode(telegramId: number, code: string) {
    try {
      await this.bot.api.sendMessage(
        telegramId,
        `🔐 Код для входа в админку: ${code}\n\n⏰ Код действителен 10 минут`
      );
      this.logger.log(`OTP код отправлен пользователю ${telegramId}`);
    } catch (error) {
      this.logger.error(`Ошибка отправки OTP кода: ${error.message}`);
      throw error;
    }
  }

  private async showCatalog(ctx: any) {
    try {
      const categories = await this.categoriesService.findAll();
    
    if (categories.length === 0) {
      await ctx.editMessageText('📦 Каталог пуст. Товары скоро появятся!');
      return;
    }

    // Сортируем категории по ID
    const sortedCategories = categories.sort((a, b) => a.id - b.id);

    const keyboard = sortedCategories.map(category => [
        { 
          text: `${category.icon} ${category.name}`, 
          callback_data: `category_${category.id}` 
        }
    ]);
    
      keyboard.push([{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]);

    await ctx.editMessageText(
      '🛍 Каталог товаров\n\nВыберите категорию:',
      {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }
    );
    } catch (error) {
      this.logger.error('Ошибка загрузки каталога:', error);
      await ctx.editMessageText('❌ Ошибка загрузки каталога');
    }
  }

  private async showMyOrders(ctx: any) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.editMessageText('❌ Пользователь не найден');
        return;
      }

      const orders = await this.ordersService.getUserOrders(user.id);

      if (orders.length === 0) {
        await ctx.editMessageText(
          '📋 Ваши заказы\n\nУ вас пока нет заказов.\nНачните покупки прямо сейчас!',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🛒 Перейти в каталог', callback_data: 'catalog' }],
                [{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]
              ]
            }
          }
        );
        return;
      }

      let message = '📋 Ваши заказы\n\n';
      
      orders.forEach((order, index) => {
        message += `📦 Заказ #${order.id}\n`;
        message += `💰 Сумма: ${order.totalPrice} ₽\n`;
        message += `📍 Адрес: ${order.address || 'Не указан'}\n`;
        message += `📊 Статус: ${this.getOrderStatusText(order.status)}\n`;
        message += `📅 Дата: ${new Date(order.createdAt).toLocaleDateString('ru-RU')}\n`;
        
        if (order.orderItems && order.orderItems.length > 0) {
          message += '🛍 Товары:\n';
          order.orderItems.forEach((item, itemIndex) => {
            message += `  ${itemIndex + 1}. ${item.product?.name || 'Неизвестный товар'} × ${item.quantity}\n`;
          });
        }
        
        message += '\n';
      });

      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛒 Перейти в каталог', callback_data: 'catalog' }],
            [{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]
          ]
        }
      });
    } catch (error) {
      this.logger.error('Ошибка загрузки заказов:', error);
      await ctx.editMessageText('❌ Ошибка загрузки заказов');
    }
  }

  private getOrderStatusText(status: string): string {
    switch (status) {
      case 'pending': return '⏳ Ожидает подтверждения';
      case 'confirmed': return '✅ Подтвержден';
      case 'preparing': return '👨‍🍳 Готовится';
      case 'ready': return '📦 Готов к выдаче';
      case 'delivered': return '🚚 Доставлен';
      case 'cancelled': return '❌ Отменен';
      default: return status;
    }
  }

  private async showAbout(ctx: any) {
    await ctx.editMessageText(
      'ℹ️ О нас\n\n' +
      'Добро пожаловать в наш магазин продуктов!\n\n' +
      'Мы предлагаем свежие и качественные продукты по доступным ценам.',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }

  private async showSupport(ctx: any) {
    await ctx.editMessageText(
      '🆘 Поддержка\n\n' +
      'Если у вас есть вопросы или проблемы:\n\n' +
      '📱 Телефон: +7 (XXX) XXX-XX-XX\n' +
      '📧 Email: support@timur-bot.com\n' +
      '⏰ Время работы: Пн-Вс 9:00-21:00',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]
          ]
        }
      }
    );
  }

  private async showCategory(ctx: any, categoryId: number) {
    try {
      const category = await this.categoriesService.findById(categoryId);
      if (!category) {
        await ctx.editMessageText('❌ Категория не найдена');
        return;
      }
  
      // Получаем подкатегории
      const subcategories = await this.categoriesService.findSubcategoriesByCategory(categoryId);
      
      // Получаем товары напрямую из категории (без подкатегорий)
      const products = await this.productsService.findByCategory(categoryId);
  
      let message = `${category.icon} ${category.name}\n\n`;
      
      // Создаем клавиатуру с подкатегориями и товарами
      const keyboard = [];
      
      // Добавляем подкатегории (сортируем по ID)
      if (subcategories.length > 0) {
        message += 'Подкатегории:\n';
        const sortedSubcategories = subcategories.sort((a, b) => a.id - b.id);
        sortedSubcategories.forEach(sub => {
          keyboard.push([{ text: `📁 ${sub.name}`, callback_data: `subcategory_${sub.id}` }]);
        });
      }
      
      // Добавляем товары из самой категории (без подкатегории, сортируем по имени)
      if (products.length > 0) {
        if (subcategories.length > 0) {
          message += '\nТовары в категории:\n';
        }
        // Сортируем товары по имени и группируем по 2 в ряд
        const sortedProducts = products.sort((a, b) => a.name.localeCompare(b.name));
        for (let i = 0; i < sortedProducts.length; i += 2) {
          const row = [];
          row.push({ text: `🛒 ${sortedProducts[i].name}`, callback_data: `product_${sortedProducts[i].id}` });
          if (sortedProducts[i + 1]) {
            row.push({ text: `🛒 ${sortedProducts[i + 1].name}`, callback_data: `product_${sortedProducts[i + 1].id}` });
          }
          keyboard.push(row);
        }
      }
      
      // Если нет ни подкатегорий, ни товаров
      if (subcategories.length === 0 && products.length === 0) {
        message += 'В этой категории пока нет товаров.';
      }
      
      // Добавляем кнопку "Назад"
      keyboard.push([{ text: '🔙 Назад в каталог', callback_data: 'catalog' }]);
      
      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка загрузки категории:', error);
      await ctx.editMessageText('❌ Ошибка загрузки категории');
    }
  }

  private async showSubcategory(ctx: any, subcategoryId: number) {
    try {
      const subcategory = await this.categoriesService.findSubcategoryById(subcategoryId);
      if (!subcategory) {
        await ctx.editMessageText('❌ Подкатегория не найдена');
      return;
    }

      const products = await this.productsService.findBySubcategory(subcategoryId);
    
      if (products.length === 0) {
      await ctx.editMessageText(
          `📁 ${subcategory.name}\n\nВ этой подкатегории пока нет товаров.`,
        {
          reply_markup: {
            inline_keyboard: [
                [{ text: '🔙 Назад к категории', callback_data: `category_${subcategory.categoryId}` }],
                [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
            ],
          },
        }
      );
      return;
    }

      await this.showProducts(ctx, products, subcategory.name);
    } catch (error) {
      this.logger.error('Ошибка загрузки подкатегории:', error);
      await ctx.editMessageText('❌ Ошибка загрузки подкатегории');
    }
  }
  
  private async showProducts(ctx: any, products: any[], categoryName: string) {
    // Сортируем товары по имени
    const sortedProducts = products.sort((a, b) => a.name.localeCompare(b.name));
    
    const productsPerPage = 5;
    const currentPage = 0; // Пока без пагинации
    
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);
  
    let message = `🛒 ${categoryName}\n\n`;
    
    currentProducts.forEach((product, index) => {
      message += `${index + 1}. ${product.name}\n`;
      message += `   💰 ${product.price} ₽\n`;
      if (product.description) {
        message += `   📝 ${product.description}\n`;
      }
      message += `   [Заказать](callback_data:product_${product.id})\n\n`;
    });
  
    const keyboard = currentProducts.map((product, index) => [
      { 
        text: `🛒 ${product.name} - ${product.price} ₽`, 
        callback_data: `product_${product.id}` 
      }
    ]);
  
    keyboard.push([{ text: '🔙 Назад в каталог', callback_data: 'catalog' }]);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: keyboard,
      },
    });
  }

  private async showProduct(ctx: any, productId: number) {
    try {
      const product = await this.productsService.findById(productId);
      if (!product) {
        await ctx.editMessageText('❌ Товар не найден');
        return;
      }
  
      let message = `🛍 ${product.name}\n\n`;
      message += `💰 Цена: ${product.price} ₽\n\n`;
      if (product.description) {
        message += `📝 Описание:\n${product.description}\n\n`;
      }
      message += `📦 Доступен: ${product.isAvailable ? '✅ Да' : '❌ Нет'}`;
  
      const keyboard = [
        [{ text: '🛒 Добавить в корзину', callback_data: `add_to_cart_${product.id}` }],
        [{ text: '🔙 Назад к товарам', callback_data: `category_${product.categoryId}` }],
        [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
      ];
  
      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка загрузки товара:', error);
      await ctx.editMessageText('❌ Ошибка загрузки товара');
    }
  }

  private async addToCart(ctx: any, productId: number) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.answerCallbackQuery({ text:'❌ Пользователь не найден', show_alert: false });
        return;
      }
  
      const product = await this.productsService.findById(productId);
      if (!product) {
        await ctx.answerCallbackQuery({ text:'❌ Товар не найден', show_alert: false });
        return;
      }
  
      if (!product.isAvailable) {
        await ctx.answerCallbackQuery({ text:'❌ Товар недоступен', show_alert: false });
        return;
      }
  
      await this.cartService.addToCart(user.id, productId, 1);
      await ctx.answerCallbackQuery({ 
        text: `✅ ${product.name} добавлен в корзину!`, 
        show_alert: false 
      });
      
    } catch (error) {
      this.logger.error('Ошибка добавления в корзину:', error);
      // await ctx.answerCallbackQuery('❌ Ошибка добавления в корзину', { show_alert: false });
    }
  }

  private async showCart(ctx: any) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.editMessageText('❌ Пользователь не найден');
        return;
      }
  
      const cartItems = await this.cartService.getCartItems(user.id);
      
      if (cartItems.length === 0) {
    await ctx.editMessageText(
          '🛒 Ваша корзина пуста\n\nДобавьте товары из каталога!',
      {
        reply_markup: {
          inline_keyboard: [
                [{ text: '🛒 Перейти в каталог', callback_data: 'catalog' }],
                [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
          ],
        },
      }
    );
        return;
      }
  
      let message = '🛍 Ваша корзина:\n\n';
      let total = 0;
  
      cartItems.forEach((item, index) => {
        const itemTotal = item.product.price * item.quantity;
        total += itemTotal;
        
        message += `${index + 1}. ${item.product.name}\n`;
        message += `   💰 ${item.product.price} ₽ × ${item.quantity} = ${itemTotal} ₽\n`;
      });
  
      message += `💳 Итого: ${total} ₽`;
      
      // Проверяем минимальную сумму заказа
      if (total < this.MIN_ORDER_AMOUNT) {
        message += `\n\n⚠️ Заказ доступен от ${this.MIN_ORDER_AMOUNT} ₽`;
      }

      const keyboard = []
      for (let item of cartItems) {
        keyboard.push([
          { text: `−`, callback_data: `cart_dec_${item.id}` },
          { text: `${item.quantity}`, callback_data: `cart_info_${item.id}` },
          { text: `+`, callback_data: `cart_inc_${item.id}` },
        ])
        keyboard.push([{ text: `🗑 ${item.product.name}`, callback_data: `cart_remove_${item.id}` }])
      }

      // Показываем кнопку "Оформить заказ" только если сумма >= MIN_ORDER_AMOUNT
      if (total >= this.MIN_ORDER_AMOUNT) {
        keyboard.push([
          { text: '✅ Оформить заказ', callback_data: 'checkout' },
          { text: '🗑 Очистить корзину', callback_data: 'cart_clear' }
        ]);
      } else {
        keyboard.push([
          { text: '🗑 Очистить корзину', callback_data: 'cart_clear' }
        ]);
      }
      
      keyboard.push([
        { text: '🛒 Продолжить покупки', callback_data: 'catalog' },
        { text: '🏠 Главное меню', callback_data: 'back_to_menu' }
      ]);
  
      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } catch (error) {
      this.logger.error('Ошибка загрузки корзины:', error);
      await ctx.editMessageText('❌ Ошибка загрузки корзины');
    }
  }

  private async handleAddressInput(ctx: any, user: any, address: string) {
    try {
      const orderState = this.orderStates.get(user.id);
      if (!orderState || orderState.step !== 'address') {
        await ctx.reply('❌ Произошла ошибка. Попробуйте оформить заказ заново.');
        return;
      }

      // Обновляем состояние на подтверждение
      orderState.tempOrder.address = address;
      orderState.step = 'confirm';
      this.orderStates.set(user.id, orderState);

      // Показываем подтверждение заказа
      await this.showOrderConfirmation(ctx, user, orderState.tempOrder);
    } catch (error) {
      this.logger.error('Ошибка обработки адреса:', error);
      await ctx.reply('❌ Произошла ошибка. Попробуйте еще раз.');
    }
  }

  private async showOrderConfirmation(ctx: any, user: any, tempOrder: any) {
    try {
      let message = '✅ Подтверждение заказа\n\n';
      message += `📞 Телефон: ${this.formatPhone(user.phone)}\n`;
      message += `📍 Адрес: ${tempOrder.address}\n\n`;
      message += '🛍 Ваш заказ:\n\n';

      tempOrder.cartItems.forEach((item, index) => {
        const itemTotal = item.product.price * item.quantity;
        message += `${index + 1}. ${item.product.name}\n`;
        message += `   💰 ${item.product.price} ₽ × ${item.quantity} = ${itemTotal} ₽\n\n`;
      });

      message += `💳 Итого: ${tempOrder.total} ₽\n\n`;
      message += 'Подтвердите заказ или вернитесь для изменений.';

      await ctx.reply(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Подтвердить заказ', callback_data: 'confirm_order' }],
            [{ text: '🔙 Изменить адрес', callback_data: 'checkout' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
          ],
        },
      });
    } catch (error) {
      this.logger.error('Ошибка показа подтверждения заказа:', error);
      await ctx.reply('❌ Ошибка показа подтверждения заказа');
    }
  }

  private async updateCartQuantity(ctx: any, cartItemId: number, change: number) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.answerCallbackQuery({ text: '❌ Пользователь не найден', show_alert: false });
        return;
      }
  
      const cartItem = await this.cartService.getCartItems(user.id);
      const item = cartItem.find(ci => ci.id === cartItemId);
      
      if (!item) {
        await ctx.answerCallbackQuery({ text: '❌ Товар в корзине не найден', show_alert: false });
        return;
      }
  
      const newQuantity = item.quantity + change;
      
      if (newQuantity <= 0) {
        await this.cartService.removeFromCart(cartItemId, user.id);
        await ctx.answerCallbackQuery({ text: '✅ Товар удален из корзины', show_alert: false });
      } else {
        await this.cartService.updateCartItemQuantity(cartItemId, user.id, newQuantity);
        await ctx.answerCallbackQuery({ text: '✅ Количество обновлено', show_alert: false });
      }
  
      // Показываем обновленную корзину
      await this.showCart(ctx);
    } catch (error) {
      this.logger.error('Ошибка обновления корзины:', error);
      await ctx.answerCallbackQuery({ text: '❌ Ошибка обновления корзины', show_alert: false });
    }
  }
  
  private async removeFromCart(ctx: any, cartItemId: number) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.answerCallbackQuery({ text: '❌ Пользователь не найден', show_alert: false });
        return;
      }
  
      await this.cartService.removeFromCart(cartItemId, user.id);
      await ctx.answerCallbackQuery({ text: '✅ Товар удален из корзины', show_alert: false });
      
      // Показываем обновленную корзину
      await this.showCart(ctx);
    } catch (error) {
      this.logger.error('Ошибка удаления из корзины:', error);
      await ctx.answerCallbackQuery({ text: '❌ Ошибка удаления из корзины', show_alert: false });
    }
  }
  
  private async clearCart(ctx: any) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.answerCallbackQuery({ text: '❌ Пользователь не найден', show_alert: false });
        return;
      }
  
      await this.cartService.clearCart(user.id);
      await ctx.answerCallbackQuery({ text: '✅ Корзина очищена', show_alert: false });
      
      // Показываем пустую корзину
      await this.showCart(ctx);
    } catch (error) {
      this.logger.error('Ошибка очистки корзины:', error);
      await ctx.answerCallbackQuery({ text: '❌ Ошибка очистки корзины', show_alert: false });
    }
  }
  
  private async showCheckout(ctx: any) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.editMessageText('❌ Пользователь не найден');
        return;
      }
  
      const cartItems = await this.cartService.getCartItems(user.id);
      const total = await this.cartService.getCartTotal(user.id);
  
      if (cartItems.length === 0) {
        await ctx.editMessageText('❌ Корзина пуста');
        return;
      }

      // Проверяем минимальную сумму заказа
      if (total < this.MIN_ORDER_AMOUNT) {
        await ctx.editMessageText(
          `❌ Заказ доступен от ${this.MIN_ORDER_AMOUNT} ₽\n\nВаша сумма: ${total} ₽`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🛒 Перейти в каталог', callback_data: 'catalog' }],
                [{ text: '🛍 Моя корзина', callback_data: 'cart' }]
              ]
            }
          }
        );
        return;
      }
  
      // Сохраняем данные заказа во временное состояние
      const tempOrder = {
        cartItems,
        total,
        user
      };
      this.orderStates.set(user.id, { step: 'address', tempOrder });

      let message = '🏠 Введите адрес доставки\n\n';
      message += `📞 Телефон: ${this.formatPhone(user.phone)}\n\n`;
      message += '🛍 Ваш заказ:\n\n';

      cartItems.forEach((item, index) => {
        const itemTotal = item.product.price * item.quantity;
        message += `${index + 1}. ${item.product.name}\n`;
        message += `   💰 ${item.product.price} ₽ × ${item.quantity} = ${itemTotal} ₽\n\n`;
      });

      message += `💳 Итого: ${total} ₽\n\n`;
      message += '📍 Пожалуйста, введите адрес доставки в следующем сообщении:';

      await ctx.editMessageText(message, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔙 Вернуться в корзину', callback_data: 'cart' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
          ],
        },
      });
    } catch (error) {
      this.logger.error('Ошибка оформления заказа:', error);
      await ctx.editMessageText('❌ Ошибка оформления заказа');
    }
  }
  
  private async confirmOrder(ctx: any) {
    try {
      const user = await this.usersService.findByTelegramId(ctx.from.id);
      if (!user) {
        await ctx.editMessageText('❌ Пользователь не найден');
        return;
      }

      // Получаем данные заказа из временного состояния
      const orderState = this.orderStates.get(user.id);
      if (!orderState || orderState.step !== 'confirm') {
        await ctx.editMessageText('❌ Произошла ошибка. Попробуйте оформить заказ заново.');
        return;
      }

      const { cartItems, total, address } = orderState.tempOrder;

      if (cartItems.length === 0) {
        await ctx.editMessageText('❌ Корзина пуста');
        return;
      }

      // Создаем заказ с адресом
      const order = await this.ordersService.createOrder(user.id, {
        status: 'pending',
        address: address,
        notes: `Заказ через Telegram бота`,
      });

      // Создаем позиции заказа и рассчитываем общую сумму
      let orderTotal = 0;
      for (const cartItem of cartItems) {
        const itemTotal = cartItem.product.price * cartItem.quantity;
        orderTotal += itemTotal;
        
        await this.ordersService.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
      }

      // Обновляем общую сумму заказа
      await this.ordersService.updateOrderTotal(order.id, orderTotal);
  
      // Очищаем корзину и временное состояние
      await this.cartService.clearCart(user.id);
      this.orderStates.delete(user.id);
  
      let message = '🎉 Заказ успешно оформлен!\n\n';
      message += `📋 Номер заказа: #${order.id}\n`;
      message += `💰 Сумма: ${orderTotal} ₽\n`;
      message += `📞 Телефон: ${this.formatPhone(user.phone)}\n`;
      message += `📍 Адрес: ${address}\n\n`;
      message += '⏳ Статус: Ожидает подтверждения\n\n';
      message += 'Мы свяжемся с вами для подтверждения заказа.';

    await ctx.editMessageText(message, {
      reply_markup: {
        inline_keyboard: [
            [{ text: '📋 Мои заказы', callback_data: 'my_orders' }],
            [{ text: '🛒 Продолжить покупки', callback_data: 'catalog' }],
            [{ text: '🏠 Главное меню', callback_data: 'back_to_menu' }]
        ],
      },
    });
  
      // Уведомляем администраторов о новом заказе
      await this.notifyAdminsAboutNewOrder(order, user, orderTotal);
  
    } catch (error) {
      this.logger.error('Ошибка подтверждения заказа:', error);
      await ctx.editMessageText('❌ Ошибка при создании заказа. Попробуйте еще раз.');
    }
  }
  
  private async notifyAdminsAboutNewOrder(order: any, user: any, total: number) {
    try {
      const admins = await this.usersService.findAll();
      const adminUsers = admins.filter(u => ['admin', 'owner'].includes(u.role));
  
      for (const admin of adminUsers) {
        if (admin.telegramId) {
          const message = `🆕 Новый заказ!\n\n` +
            `📋 Заказ #${order.id}\n` +
            `👤 Пользователь: ${user.firstName} ${user.lastName || ''}\n` +
            `📱 Телефон: ${this.formatPhone(user.phone)}\n` +
            `💰 Сумма: ${total} ₽\n\n` +
            `Проверьте админку для подробностей.`;
  
          await this.bot.api.sendMessage(admin.telegramId, message);
        }
      }
    } catch (error) {
      this.logger.error('Ошибка уведомления админов:', error);
    }
  }

  private formatPhone(phone: string): string {
    if (!phone) return 'Не указан';
    
    if (phone.length === 11 && phone.startsWith('7')) {
      return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
    }
    
    return phone;
  }
}