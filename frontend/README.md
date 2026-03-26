# MeshShare Frontend

Next.js + Ant Design + Tailwind CSS фронтенд для P2P mesh-сети.

## Технологии

- **Next.js 16** - React framework
- **Ant Design** - UI компоненты
- **Tailwind CSS** - Utility-first CSS
- **Socket.io** - WebSocket для real-time
- **Axios** - HTTP клиент
- **Electron** - Desktop приложение
- **PWA** - Progressive Web App

## Установка

```bash
npm install
```

## Запуск

### Web (Development)
```bash
npm run dev
```
Откроется на http://localhost:3001

### Desktop (Electron)
```bash
npm run electron:dev
```

### Production Build
```bash
# Web
npm run build
npm start

# Desktop
npm run electron:build
```

## Структура

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout с Ant Design
│   ├── page.tsx           # Главная страница
│   ├── files/             # Страница файлов
│   ├── peers/             # Страница пиров
│   └── profile/           # Профиль пользователя
├── lib/
│   ├── api.ts             # API клиент (axios)
│   └── socket.ts          # WebSocket клиент
├── electron/
│   ├── main.js            # Electron main process
│   └── preload.js         # Electron preload
├── public/
│   └── manifest.json      # PWA manifest
└── package.json
```

## API Instance

Используй `lib/api.ts` для всех HTTP запросов:

```typescript
import { filesApi, peersApi, usersApi, chunksApi } from '@/lib/api';

// Примеры
const files = await filesApi.getAll();
const peers = await peersApi.getOnline();
```

## WebSocket

Используй `lib/socket.ts` для real-time:

```typescript
import { socketService } from '@/lib/socket';

// Подключение
const socket = socketService.connect();

// Регистрация пира
await socketService.registerPeer({ peerId, userId, clientType });

// Слушаем события
socketService.onPeerOnline((data) => {
  console.log('Peer online:', data.peerId);
});
```

## PWA

Приложение автоматически работает как PWA:
- Offline support
- Install prompt
- Service worker
- Manifest

## Desktop (Electron)

Electron обёртка для desktop версии:
- Windows: `.exe`
- macOS: `.dmg`
- Linux: `.AppImage`

## Environment Variables

Создай `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Скрипты

- `npm run dev` - Development сервер
- `npm run build` - Production build
- `npm run electron:dev` - Electron development
- `npm run electron:build` - Build desktop app
- `npm run lint` - ESLint
