# Mesh Network Backend

NestJS backend для P2P файлообменной mesh-сети.

## Установка

```bash
npm install
```

## Настройка БД

1. Создайте PostgreSQL базу данных
2. Скопируйте `.env.example` в `.env`
3. Настройте параметры подключения к БД

```bash
cp .env.example .env
```

## Запуск

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Users
- `POST /users` - Создать пользователя
- `GET /users` - Получить всех пользователей
- `GET /users/:id` - Получить пользователя
- `PUT /users/:id` - Обновить пользователя
- `DELETE /users/:id` - Удалить пользователя

### Peers
- `POST /peers/register` - Зарегистрировать пир
- `GET /peers` - Получить всех пиров
- `GET /peers/online` - Получить онлайн пиров
- `POST /peers/:peerId/online` - Отметить пир онлайн
- `POST /peers/:peerId/offline` - Отметить пир оффлайн

### Files
- `POST /files` - Создать файл
- `GET /files` - Получить все файлы
- `GET /files?ownerId=xxx` - Получить файлы пользователя
- `GET /files/:id` - Получить файл
- `PUT /files/:id` - Обновить файл
- `DELETE /files/:id` - Удалить файл

### Chunks
- `POST /chunks` - Создать чанк
- `GET /chunks?fileId=xxx` - Получить чанки файла
- `GET /chunks/:chunkId/providers` - Найти провайдеров чанка
- `POST /chunks/replicas` - Добавить реплику чанка

## WebSocket Events

### Peer Management
- `peer:register` - Регистрация пира
- `peer:heartbeat` - Heartbeat пира
- `peer:online` - Пир онлайн (broadcast)
- `peer:offline` - Пир оффлайн (broadcast)

### Chunk Transfer
- `chunk:request` - Запрос чанка
- `chunk:response` - Ответ с чанком

### WebRTC Signaling
- `signaling:offer` - WebRTC offer
- `signaling:answer` - WebRTC answer
- `signaling:ice-candidate` - ICE candidate

## Архитектура

```
backend/
├── src/
│   ├── users/          # Управление пользователями
│   ├── peers/          # Управление пирами + WebSocket
│   ├── files/          # Управление файлами
│   ├── chunks/         # Управление чанками
│   ├── transfers/      # История передач
│   ├── routing/        # Mesh-маршрутизация (Dijkstra)
│   └── app.module.ts
```

## База данных

- PostgreSQL
- TypeORM для ORM
- Автоматическая синхронизация схемы в dev режиме

### Основные таблицы:
- `users` - Пользователи
- `peers` - Пиры в сети
- `files` - Метаданные файлов
- `chunks` - Чанки файлов
- `chunk_replicas` - Реплики чанков у пиров
- `transfers` - История передач
- `routing_table` - Кэш маршрутов
- `connection_metrics` - Метрики соединений
