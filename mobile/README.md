# MeshShare Mobile

React Native приложение для P2P файлообмена с использованием Expo.

## Установка

```bash
cd mobile
npm install
```

## Запуск

```bash
# Запуск в режиме разработки
npm start

# Запуск на Android
npm run android

# Запуск на iOS
npm run ios

# Запуск в веб-браузере
npm run web
```

## Структура проекта

```
mobile/
├── app/              # Экраны (Expo Router)
├── components/       # UI компоненты
├── lib/             # Утилиты и клиенты
│   ├── api.ts       # API client
│   ├── p2p/         # P2P WebRTC logic
│   └── storage/     # Local storage (SQLite)
├── modules/         # Бизнес-логика
│   ├── auth/
│   ├── files/
│   ├── peers/
│   └── chunks/
└── constants/       # Константы

```

## Технологии

- **Expo** - React Native фреймворк
- **React Native Paper** - UI компоненты
- **React Navigation** - Навигация
- **WebRTC** - P2P соединения
- **SQLite** - Локальное хранилище
- **Socket.io** - WebSocket для сигналинга

## Следующие шаги

1. Установить зависимости: `npm install`
2. Создать структуру папок
3. Перенести бизнес-логику из web версии
4. Адаптировать UI компоненты
5. Настроить навигацию
6. Протестировать на устройствах
