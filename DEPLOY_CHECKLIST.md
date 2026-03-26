# ✅ Чеклист деплоя MeshShare

## 📦 Подготовка

- [ ] Код закоммичен в GitHub
- [ ] Все зависимости установлены (`npm install` в backend и frontend)
- [ ] Локально всё работает (backend + frontend + P2P)

---

## 🗄️ 1. Backend на Render.com

### Создание базы данных
- [ ] Зарегистрировался на https://render.com
- [ ] New → PostgreSQL
- [ ] Name: `meshnetwork-db`
- [ ] Plan: **Free**
- [ ] Create Database
- [ ] Скопировал **Internal Database URL**

### Создание Web Service
- [ ] New → Web Service
- [ ] Подключил GitHub репозиторий
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Plan: **Free**

### Environment Variables
```
NODE_ENV=production
PORT=3000
DATABASE_URL=[Internal Database URL из предыдущего шага]
FRONTEND_URL=https://meshshare.vercel.app
```

- [ ] Добавил все переменные
- [ ] Deploy
- [ ] Скопировал URL (например: `https://meshnetwork-backend.onrender.com`)
- [ ] Проверил `/health` endpoint работает

---

## 🌐 2. Frontend PWA на Vercel

### Создание проекта
- [ ] Зарегистрировался на https://vercel.com
- [ ] New Project → Import GitHub repo
- [ ] Root Directory: `frontend`
- [ ] Framework: Next.js
- [ ] Build Command: `npm run build:pwa`

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://meshnetwork-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://meshnetwork-backend.onrender.com
```

- [ ] Добавил переменные
- [ ] Deploy
- [ ] Скопировал URL (например: `https://meshshare.vercel.app`)
- [ ] Открыл в браузере - работает!

### Обновление Backend CORS
- [ ] Вернулся в Render → Backend → Environment
- [ ] Обновил `FRONTEND_URL` на реальный Vercel URL
- [ ] Manual Deploy → Deploy latest commit

---

## 🖥️ 3. Desktop приложения

### GitHub Secrets
- [ ] GitHub repo → Settings → Secrets and variables → Actions
- [ ] New repository secret:
  - Name: `BACKEND_URL`
  - Value: `https://meshnetwork-backend.onrender.com`

### Создание релиза
```bash
git tag v1.0.0
git push origin v1.0.0
```

- [ ] Создал и запушил тег
- [ ] GitHub Actions → Build Desktop Apps запустился
- [ ] Дождался окончания (15-20 минут)
- [ ] Releases → Latest → Скачал .exe/.dmg/.AppImage
- [ ] Установил и протестировал

---

## 🤖 4. Автоматизация (опционально)

### Keep-Alive для Render
- [ ] GitHub Secrets → New secret:
  - Name: `BACKEND_URL`
  - Value: `https://meshnetwork-backend.onrender.com`
- [ ] Workflow `.github/workflows/keep-alive.yml` уже создан
- [ ] Actions → Enable workflow

### Vercel CLI (для ручного деплоя)
```bash
npm i -g vercel
cd frontend
vercel login
vercel --prod
```

---

## 🧪 5. Тестирование

### Backend
- [ ] Открыл `https://meshnetwork-backend.onrender.com/health`
- [ ] Получил `{"status":"ok",...}`

### Frontend PWA
- [ ] Открыл `https://meshshare.vercel.app`
- [ ] Зарегистрировал пользователя
- [ ] Загрузил файл
- [ ] Файл появился в списке

### P2P
- [ ] Открыл 2 браузера (или инкогнито)
- [ ] Залогинился разными пользователями
- [ ] Загрузил файл в первом
- [ ] Во втором: `/peers` → подключился к первому пиру
- [ ] Скачал файл → в консоли видно P2P передачу

### Desktop
- [ ] Установил приложение
- [ ] Залогинился
- [ ] Загрузил/скачал файл
- [ ] P2P работает

---

## 📊 6. Мониторинг

### Render Dashboard
- [ ] Проверил логи backend
- [ ] Проверил метрики (CPU, RAM)
- [ ] Настроил email уведомления (Settings → Notifications)

### Vercel Dashboard
- [ ] Проверил Analytics
- [ ] Проверил логи деплоев
- [ ] Настроил уведомления

### GitHub Actions
- [ ] Проверил что workflows работают
- [ ] Настроил уведомления о failed builds

---

## 🎉 Готово!

### URLs для пользователей
- **PWA**: https://meshshare.vercel.app
- **Desktop**: GitHub Releases → Latest

### URLs для разработки
- **Backend API**: https://meshnetwork-backend.onrender.com
- **Backend Health**: https://meshnetwork-backend.onrender.com/health
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

### Стоимость
- **Backend**: 0₽/месяц (Free tier)
- **Database**: 0₽/месяц (Free tier)
- **Frontend**: 0₽/месяц (Free tier)
- **Desktop builds**: 0₽/месяц (GitHub Actions)
- **ИТОГО**: **0₽/месяц** 🎊

---

## 🔄 Обновления

### Обновить backend
```bash
git add backend/
git commit -m "Update backend"
git push
```
Render автоматически задеплоит!

### Обновить frontend
```bash
git add frontend/
git commit -m "Update frontend"
git push
```
Vercel автоматически задеплоит!

### Новая версия desktop
```bash
git tag v1.0.1
git push origin v1.0.1
```
GitHub Actions соберёт новые установщики!

---

## 🐛 Troubleshooting

### Backend не стартует
1. Render Dashboard → Logs
2. Проверь `DATABASE_URL` правильный
3. Проверь что миграции прошли

### Frontend не подключается к backend
1. Vercel → Settings → Environment Variables
2. Проверь `NEXT_PUBLIC_API_URL`
3. Проверь CORS в backend
4. Проверь Network tab в DevTools

### Desktop app не собирается
1. GitHub Actions → Logs
2. Проверь что `BACKEND_URL` secret добавлен
3. Проверь что иконки есть в `frontend/public/`

### P2P не работает
1. Проверь WebSocket соединение (DevTools → Network → WS)
2. Проверь что оба пира онлайн
3. Проверь консоль браузера на ошибки WebRTC

---

## 💡 Советы

- Render free tier засыпает через 15 минут → первый запрос медленный
- Keep-alive workflow будет пинговать каждые 10 минут
- Vercel автоматически создаёт preview deployments для PR
- Desktop builds занимают ~15-20 минут
- Используй Render logs для дебага backend
- Используй Vercel logs для дебага frontend
