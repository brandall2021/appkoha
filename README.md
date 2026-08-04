# KohaLibrary

Aplicacion movil de biblioteca universitaria integrada con Koha ILS (Integrated Library System).

## Stack

- React Native + Expo SDK 57
- TypeScript
- expo-router (navegacion por tabs)
- React Native Paper (Material Design 3)
- Koha REST API v25.05
- Zustand (state management)
- AsyncStorage (persistencia local)
- react-native-reanimated (animaciones)

## Funcionalidades

- Busqueda de libros por titulo, autor, ISBN
- **Busqueda por voz** (micrófono con reconocimiento en tiempo real, transcripción en vivo)
- Filtros por material (libros, revistas, tesis, digital, audiovisual)
- Ficha de detalle con informacion bibliografica completa
- Vista de ejemplares y disponibilidad
- Reserva de libros
- Prestamos activos con renovacion
- Favoritos
- Escaneo de ISBN/QR
- Asistente IA para busquedas
- Modo oscuro/claro
- Animaciones premium y glassmorphism

---

## Configuracion Local

### Requisitos

- Node.js >= 22
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (para emulador) o dispositivo con Expo Go

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/brandall2021/appkoha.git
cd appkoha

# Instalar dependencias
npm install --legacy-peer-deps

# Iniciar el servidor de desarrollo
npm start
```

### Variables de Entorno

La app se configura desde la pantalla de login. No se requieren archivos `.env` para el desarrollo local.

**Credenciales por defecto (monitoring):**
- URL: `https://tu-servidor-koha.com`
- Usuario: `tu-usuario`
- Contrasena: `tu-contrasena`

---

## Despliegue en Dokploy

### Paso 1: Preparar el Repositorio

Asegurate de que el codigo este subido a GitHub:

```bash
git add .
git commit -m "feat: tu-cambio"
git push origin master
```

### Paso 2: Crear el Servicio en Dokploy

1. Accede al panel de Dokploy (`https://tu-dokploy.com`)
2. Ve a **Projects** > Selecciona tu proyecto
3. Click en **Create Service**
4. Selecciona **Dockerfile** como tipo de servicio
5. Nombre: `appkoha`

### Paso 3: Configurar el Servicio

En la pestana **General**:

| Campo | Valor |
|-------|-------|
| Name | `appkoha` |
| Repository | `https://github.com/brandall2021/appkoha` |
| Branch | `master` |
| Base Directory | `/` |
| Build Type | `Dockerfile` |

### Paso 4: Variables de Entorno (Opcional)

En la pestana **Environment** agrega:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=tu-secreto-jwt
KOHA_API_URL=https://tu-koha.com/api/v1
```

### Paso 5: Configurar Puertos

En la pestana **Network**:

| Campo | Valor |
|-------|-------|
| Ports | `80:80` |

### Paso 6: Build y Despliegue

1. Click en **Deploy** en la pestana General
2. Espera a que el build termine (ver logs en tiempo real)
3. Una vez completado, Dokploy asignara una URL automatica

### Paso 7: Configurar Dominio (Opcional)

En la pestana **Domains**:

1. Click en **Add Domain**
2. Ingresa tu dominio (ej: `app.tudominio.com`)
3. Habilita **SSL** si esta disponible
4. Apunta el DNS de tu dominio a la IP del servidor Dokploy

---

## Dockerfile (incluido en el repo)

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx expo export --platform web

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf (SPA fallback para expo-router)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

---

## Build para Produccion (EAS Build)

Si prefieres compilar APK/IPA directamente:

### Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Configurar EAS

```bash
eas login
eas build:configure
```

### Crear Build

```bash
# Build para Android (APK)
eas build --platform android --profile preview

# Build para Android (AAB para Play Store)
eas build --platform android --profile production

# Build para iOS
eas build --platform ios --profile production
```

---

## Estructura del Proyecto

```
appkoha/
├── app/                    # Expo Router (screens)
│   ├── (tabs)/            # Navegacion por tabs
│   │   ├── _layout.tsx    # Layout de tabs
│   │   ├── index.tsx      # Home
│   │   ├── search.tsx     # Buscar
│   │   ├── favorites.tsx  # Favoritos
│   │   ├── loans.tsx      # Prestamos
│   │   └── profile.tsx    # Perfil
│   ├── book/[id].tsx      # Detalle de libro
│   ├── login.tsx          # Login
│   ├── scanner.tsx        # Escanner
│   ├── ai.tsx             # Asistente IA
│   └── _layout.tsx        # Layout raiz
├── src/
│   ├── api/               # Cliente Koha API
│   ├── components/        # Componentes compartidos
│   ├── screens/           # Logica de pantallas
│   ├── stores/            # Zustand stores
│   ├── theme/             # Tema y estilos
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Utilidades y animaciones
│   └── hooks/             # Custom hooks (useVoiceSearch)
├── Dockerfile             # Para Dokploy
├── nginx.conf             # Config nginx SPA
├── .dockerignore
└── package.json
```

---

## Comandos Utiles

```bash
# Desarrollo local
npm start

# Build para web
npx expo export --platform web

# Build para Android
npx expo export --platform android

# Build Docker
docker build -t appkoha-web .

# Limpiar cache
npx expo start --clear

# Type check
npx tsc --noEmit
```

---

## API de Koha

La app se conecta a la API REST de Koha v25.05.

**Endpoints principales:**
- `GET /api/v1/biblios` - Buscar biblios
- `GET /api/v1/biblios/{id}` - Detalle de biblio
- `GET /api/v1/patrons/{id}/checkouts` - Prestamos
- `POST /api/v1/holds` - Crear reserva
- `POST /api/v1/checkouts/{id}/renew` - Renovar prestamo

**Autenticacion:** Basic Auth (usuario + contrasena del socio)

---

## Solucion de Problemas

### Build falla en Dokploy

1. Verifica los logs en Dokploy > Deployments
2. Asegurate de que el Dockerfile este en la raiz
3. Verifica que `npm install --legacy-peer-deps` funcione localmente

### App no conecta a Koha

1. Verifica que la URL sea correcta (sin `/` al final)
2. Confirma que la API de Koha este habilitada
3. Verifica credenciales del socio

### Build web muestra 404

1. Verifica que `npx expo export --platform web` funcione localmente
2. Revisa la configuracion de nginx (`try_files $uri $uri/ /index.html`)

### Busqueda por voz no funciona en Expo Go

`expo-speech-recognition` incluye codigo nativo y **no funciona en Expo Go**. Requiere build nativo (`npx expo run:android` / `npx expo run:ios`) o dev client (`expo start --dev-client`).

---

## Licencia

MIT

## Autor

brandall2021 - https://github.com/brandall2021