# 🚀 Бесплатный деплой MeshShare (0₽)

## 📋 Что получим

- ✅ Backend API на Render.com (бесплатно)
- ✅ PostgreSQL база на Render (бесплатно)
- ✅ PWA на Vercel (бесплатно)
- ✅ Desktop приложения на GitHub Releases (бесплатно)
- ✅ Автоматический CI/CD

---

## 1️⃣ Backend на Render.com

### Шаг 1: Создай аккаунт
1. Иди на https://render.com
2. Sign up через GitHub (бесплатно)

### Шаг 2: Создай PostgreSQL базу
1. Dashboard → New → PostgreSQL
2. Name: `meshnetwork-db`
3. Plan: **Free** (бесплатно навсегда)
4. Create Database
5. Скопируй **Internal Database URL** (понадобится)

### Шаг 3: Создай Web Service
1. Dashboard → New → Web Service
2. Connect твой GitHub репозиторий
3. Настройки:
   - Name: `meshnetwork-backend`
   - Region: `Frankfurt` (ближе к РФ)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: **Free** (бесплатно)

4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[вставь Internal Database URL из шага 2]
   ```

5. Create Web Service

### Шаг 4: Получи URL
После деплоя получишь URL типа: `https://meshnetwork-backend.onrender.com`

**⚠️ Важно:** Free tier засыпает после 15 минут неактивности. Первый запрос может занять ~30 сек.

---

## 2️⃣ PWA на Vercel

### Шаг 1: Создай аккаунт
1. Иди на https://vercel.com
2. Sign up через GitHub (бесплатно)

### Шаг 2: Import проект
1. Dashboard → Add New → Project
2. Import твой GitHub репозиторий
3. Настройки:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build:pwa`
   - Output Directory: `.next`

4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://meshnetwork-backend.onrender.com
   NEXT_PUBLIC_SOCKET_URL=https://meshnetwork-backend.onrender.com
   ```

5. Deploy

### Шаг 3: Получи URL
Получишь URL типа: `https://meshshare.vercel.app`

**Бонус:** Автоматический деплой при каждом push в main!

---

## 3️⃣ Desktop приложения на GitHub

### Шаг 1: Настрой GitHub Secrets
1. Твой репозиторий → Settings → Secrets and variables → Actions
2. Добавь секреты:
   - `BACKEND_URL`: `https://meshnetwork-backend.onrender.com`

### Шаг 2: Создай релиз
```bash
# Создай тег
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions автоматически:
- Соберёт .exe для Windows
- Соберёт .dmg для macOS  
- Соберёт .AppImage для Linux
- Создаст GitHub Release с файлами

### Шаг 3: Скачай приложения
Releases → Latest → Download Assets

---

## 4️⃣ Автоматизация (опционально)

### Vercel CLI (для ручного деплоя)
```bash
cd frontend
npm i -g vercel
vercel login
vercel --prod
```

### Render Deploy Hook
1. Render Dashboard → твой сервис → Settings → Deploy Hook
2. Скопируй URL
3. GitHub → Settings → Secrets → Add `RENDER_DEPLOY_HOOK`

Теперь при push в main backend автоматически задеплоится!

---

## 📊 Лимиты бесплатных тарифов

### Render Free Tier
- ✅ 750 часов/месяц (достаточно для 1 сервиса 24/7)
- ✅ 512MB RAM
- ✅ Shared CPU
- ⚠️ Засыпает после 15 мин неактивности
- ✅ PostgreSQL: 1GB storage, 97 часов/месяц uptime

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/месяц
- ✅ Serverless Functions
- ✅ Автоматический HTTPS
- ✅ CDN

### GitHub
- ✅ 2000 минут Actions/месяц (Linux)
- ✅ Unlimited public repos
- ✅ Unlimited releases storage

---

## 🔧 Быстрый старт

### 1. Backend
```bash
# Render автоматически задеплоит из GitHub
# Просто push в main
```

### 2. PWA
```bash
cd frontend
vercel --prod
```

### 3. Desktop
```bash
# Локальная сборка
cd frontend
npm run electron:build:win  # для Windows
npm run electron:build:mac  # для macOS
npm run electron:build:linux # для Linux

# Или через GitHub Actions
git tag v1.0.0
git push origin v1.0.0
```

---

## 🐛 Troubleshooting

### Backend не стартует на Render
- Проверь логи в Render Dashboard
- Убедись что `DATABASE_URL` правильный
- Проверь что `npm run start:prod` работает локально

### PWA не подключается к backend
- Проверь CORS настройки в backend
- Убедись что `NEXT_PUBLIC_API_URL` правильный
- Проверь Network tab в DevTools

### Desktop app не собирается
- Убедись что установлены все зависимости: `npm ci`
- Проверь что есть иконки в `public/`
- Для Windows нужен NSIS installer

### Render засыпает
Это нормально для free tier. Варианты:
- Используй cron job для пинга каждые 10 минут
- Upgrade на платный план ($7/месяц)
- Используй другой сервис (Railway, Fly.io)

---

## 💡 Альтернативы (тоже бесплатно)

### Backend
- **Railway** - $5 кредитов/месяц бесплатно
- **Fly.io** - 3 VM бесплатно
- **Supabase** - PostgreSQL + Auth бесплатно

### Frontend
- **Netlify** - аналог Vercel
- **Cloudflare Pages** - unlimited bandwidth
- **GitHub Pages** - для статики

---

## 📝 Чеклист деплоя

- [ ] Создал аккаунт на Render
- [ ] Создал PostgreSQL базу
- [ ] Задеплоил backend
- [ ] Скопировал backend URL
- [ ] Создал аккаунт на Vercel
- [ ] Задеплоил frontend PWA
- [ ] Проверил что PWA работает
- [ ] Настроил GitHub Secrets для desktop builds
- [ ] Создал тег и собрал desktop приложения
- [ ] Протестировал всё вместе

---

## 🎉 Готово!

Теперь у тебя:
- Backend API работает 24/7
- PWA доступна по красивому URL
- Desktop приложения можно скачать с GitHub
- Всё автоматически обновляется при push

**Стоимость: 0₽/месяц** 🎊
