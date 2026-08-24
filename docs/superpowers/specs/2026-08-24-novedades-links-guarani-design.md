# Novedades, Links útiles y acceso a Guaraní — Diseño

Fecha: 2026-08-24 · Estado: aprobado (pendiente revisión de spec)

## Contexto

appkoha es una app Expo (React Native + react-native-web) para biblioteca Koha,
deployada como **PWA** (Dockerfile + nginx en Dokploy) y como apps nativas
(Android `com.kohalibrary.app`). Tabs actuales: Inicio, Buscar, Favoritos,
Préstamos, Cuenta. La app habla directo con la API REST de Koha; no tiene
backend propio. El usuario pidió: sección de novedades/noticias, links útiles
y acceso externo a SIU-Guaraní, con aviso push al publicar. La publicación la
hará personal administrativo sin perfil técnico.

## Objetivos

1. Tab "Novedades" con noticias e imágenes, actualizable sin publicar la app.
2. Bloque de Links útiles en la misma tab; Guaraní primero (link externo).
3. Push notification al publicar una noticia, en **nativo y PWA**.
4. Panel de administración listo para usar (sin desarrollar UI admin).

## No objetivos (YAGNI)

- Segmentación de push por usuario o rol.
- Estado "leído/no leído", comentarios, buscador de noticias.
- Login o SSO integrado con Guaraní (solo link externo).
- Notificaciones dirigidas a un usuario puntual.

## Arquitectura

```
Admin (browser) ──► Panel Directus ──► Postgres
                          │ (Flow: noticia publicada)
App (PWA/nativa) ──REST──►▼
  │                    Directus (lectura pública)
  │ POST /register            ▲
  ▼                           │ GET tokens (server-side)
push-sender ◄──POST /send─────┘
  ├── Expo Push API      (tokens nativos Android/iOS)
  └── Web Push + VAPID   (suscripciones PWA)
```

Piezas nuevas:

| Pieza | Qué es | Dónde corre |
|---|---|---|
| Directus | CMS headless: panel, API, colecciones, Flow | Dokploy (Docker) |
| Postgres | Base del CMS | Dokploy |
| push-sender | Microservicio TS (~150 líneas): registra tokens, envía push | Dokploy |
| Feature móvil | Tab Novedades + detalle + registro push | Repo appkoha |

No se escribe ningún otro backend: el contenido y su administración son 100% Directus.

## CMS (Directus)

Deploy: imagen oficial `directus/directus`, Postgres dedicado, volumen para
uploads, dominio HTTPS propio (requisito para Web Push).

Colecciones:

- `noticias`: `titulo` (string), `cuerpo` (rich text), `imagen` (file),
  `fecha` (timestamp, default now), `status` (draft/published, flujo estándar).
- `links_utiles`: `titulo`, `url`, `icono` (string, nombre MaterialCommunityIcons),
  `orden` (int), `destacado` (bool — Guaraní va con `true`).
- `push_tokens`: `token` (text), `tipo` (`expo` | `web`), `creado` (timestamp).

Roles:

- `Public`: lectura de `noticias` (solo `published`), `links_utiles`; nada más.
- Admin: panel completo (único rol extra necesario).

Flow "Noticia publicada": trigger en cambio de `noticias.status` a `published`
→ HTTP POST a `push-sender /send` con `{ titulo, id }` (header con token compartido).

## push-sender (microservicio)

- Node 22 + TypeScript + Fastify, un solo archivo de lógica + Dockerfile.
- `POST /register` body `{ token, tipo }`: valida y persiste en Directus usando
  un token estático de servicio guardado solo server-side.
- `POST /send` (auth: header `x-shared-secret`): busca tokens, envía
  - `tipo=expo` → API `https://exp.host/--/api/v2/push/send`
  - `tipo=web` → lib `web-push` con las claves VAPID
  - payload único para ambas plataformas: `{ title, body: titulo, data: { id, url } }`
    (`id` para el deep link nativo; `url` absoluta `/novedad/<id>` para web)
  - elimina tokens que respondan 404/410 (suscripción vencida).
- `GET /health`.
- Env vars: `DIRECTUS_URL`, `DIRECTUS_SERVICE_TOKEN`, `SHARED_SECRET`,
  `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `EXPO_ACCESS_TOKEN` (opcional).
- Claves VAPID: generadas una vez con `npx web-push generate-vapid-keys`.

## App móvil (repo appkoha)

Config nueva (`.env`):

- `EXPO_PUBLIC_CMS_URL` — URL del Directus.
- `EXPO_PUBLIC_PUSH_URL` — URL del push-sender.
- `EXPO_PUBLIC_VAPID_PUBLIC_KEY` — clave pública VAPID (web).
- `projectId` EAS agregado a `app.json` (para Expo Push nativo).

Pantallas:

- Tab **Novedades** (6ta tab, ícono `bell-ring`): feed de noticias con
  react-query (`['noticias']`, refetch on focus, pull-to-refresh). Debajo del
  feed (o como cabecera colapsable), bloque **Links útiles**: lista con ícono +
  título, ordenada por `orden`; los `destacado` van primero en fila separada;
  tap abre navegador externo (`Linking.openURL`). Guaraní = link destacado.
- Detalle `/novedad/[id]`: título, imagen, fecha, cuerpo renderizado.
- Carpeta destino: `src/screens/notifications/` (ya existe, vacía) + rutas en `app/`.

Push:

- Hook `usePushRegistration` (se ejecuta al iniciar sesión/app):
  - nativo: permiso + `getDevicePushTokenAsync` → `tipo: expo`;
  - web/PWA: `Notification.requestPermission()` + `registration.pushManager.subscribe(VAPID)`
    → `tipo: web` (iOS requiere PWA instalada en pantalla de inicio; Android
    funciona desde el navegador);
  - POST a `push-sender /register`; reintento silencioso en próximo arranque.
- Service worker web mínimo para recibir/mostrar la notificación.
- Tap en notificación → deep link `appkoha://novedad/<id>` (y ruta web equivalente).

Errores:

- CMS caído: el feed muestra estado de error con reintento (react-query retry
  con backoff); links útiles cacheados en AsyncStorage como fallback.
- Registro de push fallido: nunca bloquea el uso de la app.
- Envío push parcial: el Flow igual publica; push-sender loguea fallos.

## Testing y verificación

- App: `tsc --noEmit`, lint, test unitario del hook de registro (mock por plataforma).
- End-to-end local: `docker compose` con Directus + Postgres + push-sender;
  crear noticia desde el panel → verificar feed en la app y push recibido en Chrome.
- Smoke: `curl /health`, `curl /send` con token falso (403) y válido (202).

## Deploy

- Dokploy: tres servicios (directus, postgres, push-sender) bajo un dominio
  institucional HTTPS.
- La app apunta al dominio del CMS/push-sender vía `.env` de build.

## Decisiones abiertas

- Ninguna pendiente: CMS = Directus, push dual (expo/web-push), layout = 6ta tab.
