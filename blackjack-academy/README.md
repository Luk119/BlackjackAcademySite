# Blackjack Academy

Kompletna, produkcyjna aplikacja webowa do nauki gry w blackjack oraz zaawansowanych technik liczenia kart.

## Architektura

```
blackjack-academy/
├── backend/          # NestJS API + WebSocket Gateway
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # JWT auth, OAuth
│   │   │   ├── users/       # Profile, postępy
│   │   │   ├── game/        # Silnik blackjacka, WebSocket
│   │   │   ├── lessons/     # Moduły edukacyjne
│   │   │   ├── stats/       # Statystyki gracza
│   │   │   └── leaderboard/ # Rankingi
│   │   ├── common/          # Guards, decorators, filters
│   │   └── config/
│   ├── prisma/              # Schema bazy danych
│   └── test/                # Testy jednostkowe i integracyjne
│
├── frontend/         # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/             # Routing (App Router)
│   │   ├── components/
│   │   │   ├── game/        # Stół, karty, animacje
│   │   │   ├── lessons/     # Lekcje, quizy
│   │   │   └── dashboard/   # Statystyki, osiągnięcia
│   │   ├── hooks/           # Logika gry, WebSocket
│   │   ├── stores/          # Zustand state management
│   │   └── lib/             # API client, Socket.io
│   └── public/
│
└── docker-compose.yml
```

## Stack technologiczny

| Warstwa       | Technologia                              |
|---------------|------------------------------------------|
| Frontend      | Next.js 14, React 18, TypeScript         |
| Animacje      | Framer Motion                            |
| Stylowanie    | Tailwind CSS, shadcn/ui                  |
| State         | Zustand                                  |
| Backend       | NestJS (Node.js), TypeScript             |
| Baza danych   | PostgreSQL + Prisma ORM                  |
| Cache/Session | Redis                                    |
| WebSocket     | Socket.io                                |
| Auth          | JWT (access + refresh tokens)            |
| Testy         | Jest, Supertest                          |
| Deploy        | Docker + Docker Compose                  |

## Szybki start

### Wymagania
- Docker + Docker Compose
- Node.js 20+ (do lokalnego developmentu)

### Uruchomienie przez Docker

```bash
# Sklonuj repo i przejdź do katalogu
cd blackjack-academy

# Skopiuj zmienne środowiskowe
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Uruchom wszystkie serwisy
docker-compose up -d

# Uruchom migracje bazy danych
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# Aplikacja dostępna pod:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs (Swagger): http://localhost:3001/api/docs
```

### Lokalny development

```bash
# --- Backend ---
cd backend
npm install
cp .env.example .env          # Uzupełnij DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run start:dev             # http://localhost:3001

# --- Frontend ---
cd frontend
npm install
cp .env.example .env.local
npm run dev                   # http://localhost:3000
```

### Testy

```bash
# Backend - unit + integration
cd backend
npm run test
npm run test:e2e
npm run test:cov

# Frontend
cd frontend
npm run test
```

## Kluczowe funkcjonalności

- **Silnik gry**: Pełna implementacja blackjacka (Hit, Stand, Double, Split, Surrender), soft 17, wielotalijny shoe (1-8 talie)
- **Strategia podstawowa**: Dynamiczne podpowiedzi zgodne z matematycznie optymalną strategią
- **Liczenie kart**: Systemy Hi-Lo, Hi-Opt I, KO — wizualizacja running count i true count
- **Moduły lekcyjne**: Teoria + quizy, progresja, odblokowanie kolejnych lekcji
- **Dashboard**: Win rate, poprawność decyzji, historia sesji, osiągnięcia
- **Leaderboard**: Rankingi globalne i tygodniowe
- **WebSocket**: Aktualizacje w czasie rzeczywistym (multiplayer, live stats)
- **AI Coach**: Analiza błędnych decyzji z wyjaśnieniami

## Zmienne środowiskowe

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://blackjack:blackjack_secret@localhost:5432/blackjack_academy
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```
