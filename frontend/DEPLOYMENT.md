# Deployment Guide

## PWA (Progressive Web App)

### Development
```bash
npm run dev
```
Откроется на http://localhost:3001

### Production Build
```bash
npm run build:pwa
npm start
```

### Deploy на Vercel
```bash
# Установи Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy на Netlify
```bash
# Установи Netlify CLI
npm i -g netlify-cli

# Build
npm run build:pwa

# Deploy
netlify deploy --prod
```

### PWA Features
- ✅ Offline support
- ✅ Install prompt
- ✅ Service Worker
- ✅ App manifest
- ✅ Push notifications (ready)

---

## Desktop App (Electron)

### Development
```bash
npm run electron:dev
```

### Build для Windows
```bash
npm run electron:build:win
```
Результат: `dist/MeshShare Setup.exe`

### Build для macOS
```bash
npm run electron:build:mac
```
Результат: `dist/MeshShare.dmg`

### Build для Linux
```bash
npm run electron:build:linux
```
Результат: `dist/MeshShare.AppImage`

### Build для всех платформ
```bash
npm run build:desktop
```

---

## Docker Deployment

### Dockerfile для Frontend
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3001
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
      - NEXT_PUBLIC_SOCKET_URL=http://backend:3000
    depends_on:
      - backend
```

---

## Environment Variables

### Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## CI/CD

### GitHub Actions (PWA)
```yaml
name: Deploy PWA
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:pwa
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### GitHub Actions (Desktop)
```yaml
name: Build Desktop
on:
  push:
    tags:
      - 'v*'
jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build:desktop
      - uses: actions/upload-artifact@v3
        with:
          name: desktop-${{ matrix.os }}
          path: dist/*
```

---

## Performance Optimization

### PWA
- Service Worker кэширование
- Code splitting
- Image optimization
- Lazy loading

### Desktop
- Preload scripts
- Native modules
- Auto-updates (electron-updater)

---

## Troubleshooting

### PWA не устанавливается
- Проверь HTTPS (PWA требует HTTPS)
- Проверь manifest.json
- Проверь Service Worker регистрацию

### Electron не запускается
- Проверь `electron/main.js`
- Проверь пути к файлам
- Проверь `package.json` main field

### Build ошибки
```bash
# Очисти кэш
rm -rf .next node_modules
npm install
npm run build
```
