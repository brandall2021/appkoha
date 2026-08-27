# Project Analysis — AppKoha

## Arquitectura

Monorepo con dos workspaces independientes:

```
appkoha/
├── app/                  # Expo Router (React Native, TypeScript)
├── src/                  # Lógica compartida: stores, hooks, utils, theme, types
├── backend/              # Laravel 12 (PHP 8.2, Sanctum, PostgreSQL)
├── infra/cms/            # Directus 11 + push-sender (Docker Compose separado)
├── docker-compose.yml    # PostgreSQL 15 + Redis 7
├── Dockerfile            # Build para web (nginx)
└── openspec/             # Specs de diseño
```

## Stack Tecnológico

### Frontend (Mobile)
| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.86 | Runtime |
| Expo SDK | 57 | Platform tools |
| expo-router | ~57 | Navegación por tabs |
| TypeScript | ~6.0 | Tipado estático |
| React Native Paper | ^5.15 | Material Design 3 |
| Zustand | ^5 | State management |
| React Query | ^5 | Server state / cache |
| AsyncStorage | ^3 | Persistencia local |
| Reanimated | ^4.5 | Animaciones |

### Backend (API)
| Tecnología | Versión | Uso |
|---|---|---|
| Laravel | ^12.0 | Framework PHP |
| Sanctum | ^4.0 | API token auth (bearer) |
| PostgreSQL | 15 | Base de datos principal |
| Redis | 7 | Cache / sesiones (opcional) |
| PHPUnit | ^11.5 | Tests |

### Infraestructura
| Servicio | Puerto | Propósito |
|---|---|---|
| PostgreSQL | 5432 | Base de datos Laravel |
| Redis | 6379 | Caché/sesiones |
| Directus CMS | 8055 | Headless CMS (novedades CMS) |
| Push Sender | 8056 | Web Push notifications |
| Laravel Dev | 8000 | API backend |
| Expo Dev | 8081 | Mobile dev server |

## Endpoints de la API

### Públicos (sin auth)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/news` | Listar novedades |
| GET | `/api/v1/news/{id}` | Detalle de novedad |
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Login, devuelve bearer token |

### Protegidos (Bearer token)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/auth/me` | Datos del usuario autenticado |
| GET | `/api/v1/guarani/student` | Datos del estudiante (Guaraní) |
| GET | `/api/v1/guarani/subjects` | Materias del estudiante |
| GET | `/api/v1/guarani/schedule` | Horario semanal |
| GET | `/api/v1/guarani/correlativities` | Correlatividades |

## Guía de Desarrollo Rápido

### Arrancar infraestructura
```bash
docker compose up -d          # PostgreSQL + Redis
cd infra/cms && docker compose up -d   # Directus CMS (opcional)
```

### Backend
```bash
cd backend
cp .env.example .env          # Editar credenciales de DB
composer install
php artisan key:generate
php artisan migrate --force
php artisan serve             # → http://localhost:8000
```

### Frontend (Expo)
```bash
cd .                          # Raíz del proyecto
npm install --legacy-peer-deps
npm start                     # → Expo dev server
```

### Tests
```bash
cd backend && php artisan test     # 24/24
```

## Modelo de Datos (migraciones)

- `users` — Usuarios de la app (email, password hash)
- `password_reset_tokens` — Tokens de reset
- `personal_access_tokens` — Sanctum tokens
- `sessions` — Sesiones HTTP
- `cache` — Cache table (database driver)
- `jobs` / `job_batches` / `failed_jobs` — Cola

## Convenciones

- Branches: `feat/*`, `fix/*`, `chore/*`
- Commits: formato convencional en español
- PHP: PSR-12 via Laravel Pint
- TS: strict mode
- Tests: PHPUnit (backend), Vitest (frontend)
