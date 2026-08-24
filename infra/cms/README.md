# Stack local CMS + Push

Levanta Directus 11 (panel en `http://localhost:8055`), PostgreSQL 16 interno y el push-sender (`:8056`).

## Uso

```bash
cp .env.example .env   # completar valores reales antes de levantar
docker compose up -d
docker compose ps      # esperar que directus esté healthy (~20-40s en primer arranque)
```

Verificación de salud:

```bash
curl -s localhost:8055/server/health   # {"status":"ok"}
curl -s localhost:8056/health          # {"ok":true}
```

Bajar todo (los volúmenes `pgdata` y `uploads` persisten):

```bash
docker compose down
```

## Credenciales

- Todas las credenciales viven en `.env` (nunca en git). `.env.example` es solo la plantilla.
- Generación: `openssl rand -hex 16` para `DIRECTUS_KEY`, `openssl rand -hex 32` para `DIRECTUS_SECRET`, contraseñas aleatorias fuertes para `POSTGRES_PASSWORD`, `DIRECTUS_ADMIN_PASSWORD` y `PUSH_SHARED_SECRET`.
- `DIRECTUS_SERVICE_TOKEN`: se completa en Task 6 (bootstrap de colecciones). Mientras tanto vale el placeholder; el push-sender arranca igual y solo falla al intentar llamar a Directus.
- Claves VAPID: se generan en Task 6 con `npx web-push generate-vapid-keys`; dejar vacías por ahora.
