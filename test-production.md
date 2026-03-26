# 🧪 Тестирование перед деплоем

## Backend

```bash
cd backend

# Установи зависимости
npm install

# Создай .env файл
cp .env.example .env

# Отредактируй .env:
# DATABASE_URL=postgresql://user:password@localhost:5432/meshnetwork
# PORT=3000
# NODE_ENV=production

# Собери
npm run build

# Запусти production
npm run start:prod
```

Проверь: http://localhost:3000

---

## Frontend PWA

```bash
cd frontend

# Установи зависимости
npm install

# Создай .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3000" >> .env.local

# Собери PWA
npm run build:pwa

# Запусти production
npm start
```

Проверь: http://localhost:3001

---

## Desktop App

```bash
cd frontend

# Собери для твоей платформы
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux

# Установщик будет в frontend/dist/
```

---

## Docker (опционально)

```bash
# Backend
cd backend
docker build -t meshnetwork-backend .
docker run -p 3000:3000 -e DATABASE_URL=... meshnetwork-backend

# Frontend
cd frontend
docker build -t meshnetwork-frontend .
docker run -p 3001:3001 meshnetwork-frontend
```

---

## Проверка P2P

1. Открой 2 браузера (или 2 вкладки в режиме инкогнито)
2. Залогинься разными пользователями
3. Загрузи файл в первом браузере
4. На странице `/peers` во втором браузере подключись к первому пиру
5. Скачай файл - должен скачаться через P2P (смотри консоль)

---

## Чеклист перед деплоем

- [ ] Backend собирается без ошибок
- [ ] Frontend собирается без ошибок
- [ ] Desktop app собирается
- [ ] P2P работает локально между двумя клиентами
- [ ] База данных подключается
- [ ] WebSocket соединение работает
- [ ] Файлы загружаются и скачиваются
- [ ] CORS настроен правильно
