# KohaLibrary

Aplicación móvil de biblioteca universitaria integrada con Koha ILS y backend Laravel.

## Stack

- **Mobile**: React Native + Expo SDK 57 + TypeScript
- **Backend**: Laravel 12 + Sanctum + PostgreSQL 15 + Redis 7
- **CMS**: Directus 11 (novedades, push notifications)
- **State**: Zustand + React Query
- **UI**: React Native Paper (Material Design 3)

## Setup Rápido

### 1. Infraestructura (Docker)

```bash
# PostgreSQL 15 + Redis 7
docker compose up -d

# (Opcional) Directus CMS para novedades
cd infra/cms && docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # Editar DB_PASSWORD
composer install
php artisan key:generate
php artisan migrate --force
php artisan serve             # → http://localhost:8000
```

### 3. Frontend (Expo)

```bash
cd ..                         # Raíz del proyecto
npm install --legacy-peer-deps
npm start                     # → Expo dev server
```

### Variables de Entorno

Ver `backend/.env.example` para la lista completa. Las mínimas:

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de PostgreSQL (default: `127.0.0.1`) |
| `DB_PORT` | Puerto PostgreSQL (default: `5432`) |
| `DB_DATABASE` | Nombre de la DB (default: `appkoha`) |
| `DB_USERNAME` | Usuario PostgreSQL (default: `brandall`) |
| `DB_PASSWORD` | **Requerido** — contraseña de PostgreSQL |
| `REDIS_HOST` | Host Redis (default: `127.0.0.1`) |
| `REDIS_PORT` | Puerto Redis (default: `6379`) |

## API Endpoints

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/news` | Listar novedades |
| GET | `/api/v1/news/{id}` | Detalle de novedad |
| POST | `/api/v1/auth/register` | Registro |
| POST | `/api/v1/auth/login` | Login → bearer token |

### Protegidos (Bearer token)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Usuario actual |
| GET | `/api/v1/guarani/student` | Datos del estudiante |
| GET | `/api/v1/guarani/subjects` | Materias |
| GET | `/api/v1/guarani/schedule` | Horario semanal |
| GET | `/api/v1/guarani/correlativities` | Correlatividades |

## Funcionalidades

- Búsqueda de libros por título, autor, ISBN
- Búsqueda por voz (reconocimiento en tiempo real)
- Filtros por material (libros, revistas, tesis, digital, audiovisual)
- Ficha de detalle con información bibliográfica completa
- Vista de ejemplares y disponibilidad
- Reserva de libros
- Préstamos activos con renovación
- Favoritos
- Escaneo de ISBN/QR
- Asistente IA para búsquedas
- Novedades del campus (via Laravel/Directus)
- Integración Guaraní (materias, horario, correlatividades)
- Modo oscuro/claro
- Animaciones premium y glassmorphism

## Comandos Útiles

```bash
# Desarrollo
docker compose up -d              # Infra
php artisan serve                 # Backend
npm start                         # Frontend

# Tests
cd backend && php artisan test    # 24/24
cd .. && npm test                 # Frontend

# Build
npx expo export --platform web    # Web
docker build -t appkoha-web .     # Docker web

# Type check
npx tsc --noEmit

# Lint (backend)
cd backend && composer test       # Laravel Pint
```

## Estructura del Proyecto

```
appkoha/
├── app/                    # Expo Router (screens)
│   ├── (tabs)/            # Navegación por tabs
│   ├── book/              # Detalle de libro
│   ├── novedad/           # Novedades
│   ├── login.tsx          # Login
│   ├── scanner.tsx        # Scanner ISBN/QR
│   └── search.tsx         # Búsqueda
├── src/
│   ├── api/               # Cliente API
│   ├── components/        # Componentes compartidos
│   ├── hooks/             # Custom hooks
│   ├── screens/           # Lógica de pantallas
│   ├── stores/            # Zustand stores
│   ├── theme/             # Tema y estilos
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades
├── backend/               # Laravel 12
│   ├── app/Http/Controllers/Api/  # Controllers
│   ├── app/Services/Guarani/      # Integración Guaraní
│   ├── routes/api.php             # Rutas API
│   └── tests/                     # PHPUnit tests
├── infra/cms/             # Directus + push-sender (Docker)
├── docker-compose.yml     # PostgreSQL + Redis
├── PROJECT_ANALYSIS.md    # Análisis completo del proyecto
└── README.md              # Este archivo
```

## Despliegue en Dokploy

Ver la sección de Despliegue en el README original o consultar `PROJECT_ANALYSIS.md`.

## Licencia

MIT
