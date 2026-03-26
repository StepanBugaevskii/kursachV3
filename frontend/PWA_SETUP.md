# 📱 PWA Setup Guide

## Что такое PWA?

Progressive Web App - это веб-приложение, которое работает как нативное:
- ✅ Устанавливается на устройство
- ✅ Работает офлайн
- ✅ Иконка на рабочем столе
- ✅ Полноэкранный режим
- ✅ Push уведомления

## Уже настроено

- ✅ Service Worker (`@ducanh2912/next-pwa`)
- ✅ Manifest (`public/manifest.json`)
- ✅ Offline страница (`app/offline/page.tsx`)
- ✅ Иконки (нужно добавить `icon-192.png` и `icon-512.png`)

## Создание иконок

### Быстрый способ
1. Создай иконку 512x512px (PNG)
2. Используй https://realfavicongenerator.net
3. Скачай и положи в `public/`:
   - `icon-192.png`
   - `icon-512.png`
   - `favicon.ico`

### Или вручную
```bash
# Установи ImageMagick
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Создай иконки из одного файла
convert icon.png -resize 192x192 public/icon-192.png
convert icon.png -resize 512x512 public/icon-512.png
```

## Тестирование PWA локально

```bash
cd frontend
npm run build:pwa
npm start
```

Открой http://localhost:3001 в Chrome:
1. DevTools → Application → Manifest (проверь)
2. DevTools → Application → Service Workers (должен быть активен)
3. Lighthouse → Progressive Web App (проверь score)

## Установка PWA

### Desktop (Chrome/Edge)
1. Открой сайт
2. Адресная строка → иконка установки (⊕)
3. Install

### Mobile (Android)
1. Открой сайт в Chrome
2. Меню → Add to Home screen

### Mobile (iOS)
1. Открой сайт в Safari
2. Share → Add to Home Screen

## Проверка PWA готовности

### Chrome DevTools
1. F12 → Lighthouse
2. Categories: Progressive Web App
3. Generate report
4. Должно быть 90+ score

### Требования для PWA
- ✅ HTTPS (Vercel даёт автоматически)
- ✅ Service Worker
- ✅ Manifest.json
- ✅ Иконки 192x192 и 512x512
- ✅ Offline fallback

## Offline режим

PWA автоматически кэширует:
- Статические файлы (JS, CSS)
- Страницы
- API запросы (с fallback)

При отсутствии интернета:
- Показывается `/offline` страница
- Локальные файлы доступны (IndexedDB)
- P2P работает в локальной сети

## Обновления PWA

PWA автоматически обновляется при новом деплое:
1. Service Worker скачивает новую версию
2. Ждёт закрытия всех вкладок
3. Активирует новую версию

Или можно добавить кнопку "Update available":
```typescript
// В layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        message.info('New version available! Refresh to update.');
      });
    });
  }
}, []);
```

## Production checklist

- [ ] Иконки созданы (192x192, 512x512)
- [ ] Manifest.json заполнен
- [ ] Service Worker работает
- [ ] Offline страница работает
- [ ] HTTPS включен (Vercel автоматически)
- [ ] Lighthouse score 90+
- [ ] Протестировал установку на desktop
- [ ] Протестировал установку на mobile
- [ ] Протестировал offline режим

## Полезные ссылки

- PWA Checklist: https://web.dev/pwa-checklist/
- Manifest Generator: https://www.simicart.com/manifest-generator.html/
- Icon Generator: https://realfavicongenerator.net
- PWA Builder: https://www.pwabuilder.com
