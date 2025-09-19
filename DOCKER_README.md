# 🐳 Docker Setup для Timur Bot

## 📋 Предварительные требования

1. **Docker** и **Docker Compose** установлены на вашей системе
2. **PostgreSQL** запущен локально на порту 5432
3. **Telegram Bot Token** (получите у @BotFather)

## 🚀 Быстрый старт

### 1. Настройка переменных окружения

Убедитесь, что у вас есть файлы `.env` в папках `back` и `front` с необходимыми переменными.

**В файле `back/.env`** должны быть переменные для бэкенда:
```env
# Telegram Bot Token (получите у @BotFather)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# JWT Secret для авторизации
JWT_SECRET=your-super-secret-jwt-key-12345

# Database configuration (для подключения к локальной PostgreSQL из Docker)
DATABASE_HOST=host.docker.internal
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=timur_bot

# Frontend URL
FRONTEND_URL=http://localhost:3002
```

**В файле `front/.env`** должны быть переменные для фронтенда:
```env
# API URL для фронтенда
REACT_APP_API_URL=http://localhost:3001/api
PORT=3002
```

### 2. Запуск проекта

```bash
# Сборка и запуск всех сервисов
docker-compose up --build

# Или запуск в фоновом режиме
docker-compose up --build -d
```

### 3. Доступ к приложению

- **Frontend (Admin Panel):** http://localhost:3002
- **Backend API:** http://localhost:3001
- **PostgreSQL:** localhost:5432 (локальная база данных)

## 🛠 Управление сервисами

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (данные БД будут удалены!)
docker-compose down -v

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Перезапуск конкретного сервиса
docker-compose restart backend
```

## 📁 Структура проекта

```
timur_bot/
├── docker-compose.yml          # Docker Compose конфигурация
├── .env                        # Переменные окружения (создать вручную)
├── back/                       # Backend (NestJS + Telegram Bot)
│   ├── Dockerfile
│   ├── src/
│   └── ...
├── front/                      # Frontend (React Admin Panel)
│   ├── Dockerfile
│   ├── src/
│   └── ...
└── DOCKER_README.md           # Этот файл
```

## 🔧 Сервисы

### 1. **backend** - NestJS Backend + Telegram Bot
- **Порт:** 3001
- **Автоматически подключается к PostgreSQL**
- **Запускает Telegram Bot**

### 2. **frontend** - React Admin Panel
- **Порт:** 3002
- **Подключается к Backend API**

## 🐛 Отладка

### Проблемы с подключением к БД
```bash
# Проверьте, что PostgreSQL запущен локально
psql -h localhost -p 5432 -U postgres -d timur_bot

# Проверьте логи backend для ошибок подключения к БД
docker-compose logs backend
```

### Проблемы с Telegram Bot
```bash
# Проверьте, что TELEGRAM_BOT_TOKEN установлен правильно
docker-compose logs backend

# Проверьте переменные окружения
docker-compose exec backend env | grep TELEGRAM
```

### Проблемы с Frontend
```bash
# Проверьте логи фронтенда
docker-compose logs frontend

# Проверьте, что Backend API доступен
curl http://localhost:3001/api/products
```

## 📝 Полезные команды

```bash
# Вход в контейнер для отладки
docker-compose exec backend sh
docker-compose exec frontend sh

# Подключение к локальной PostgreSQL
psql -h localhost -p 5432 -U postgres -d timur_bot

# Обновление зависимостей
docker-compose build --no-cache backend
docker-compose build --no-cache frontend

# Очистка Docker кэша
docker system prune -a
```

## ⚠️ Важные замечания

1. **Не забудьте** заменить `your_telegram_bot_token_here` на реальный токен бота
2. **PostgreSQL** должен быть запущен локально на порту 5432
3. **База данных** `timur_bot` должна существовать в вашей PostgreSQL
4. **При первом запуске** может потребоваться время на сборку образов
5. **Для продакшена** рекомендуется изменить пароли и секреты

## 🎉 Готово!

После запуска `docker-compose up --build` у вас будет полностью рабочее приложение:
- ✅ Telegram Bot для заказов
- ✅ React Admin Panel для управления
- ✅ Подключение к локальной PostgreSQL базе данных
- ✅ Все сервисы связаны между собой
