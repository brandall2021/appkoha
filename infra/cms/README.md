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

## Bootstrap desde cero

Reconstruye Directus vacío con el esquema de novedades (`noticias`, `links_utiles`, `push_tokens`)
y los permisos del rol Public ya aplicados:

```bash
cd infra/cms
cp .env.example .env   # completar valores reales; DIRECTUS_ADMIN_EMAIL debe tener formato válido
docker compose up -d postgres directus
bash directus/schema/apply.sh
```

`apply.sh` es idempotente y hace tres cosas:

1. Espera a que Directus esté sano (el admin inicial se crea solo desde `DIRECTUS_ADMIN_EMAIL`/`DIRECTUS_ADMIN_PASSWORD`).
2. Aplica `directus/schema/snapshot.yaml` vía `POST /schema/diff` + `POST /schema/apply` (mismo flujo que el panel: Ajustes → Modelo de datos → Importar).
3. Siembra los permisos del rol Public desde `directus/schema/public-permissions.json` (read en `noticias` solo con `status=published`, read en `links_utiles`, nada más).

Verificación:

```bash
curl -s localhost:8055/items/noticias     # 200 {"data":[]}
curl -s localhost:8055/items/push_tokens  # 403
```

### Regenerar el snapshot tras cambios de esquema

```bash
docker compose exec -T directus npx directus schema snapshot --format yaml \
  | sed -n '/^version:/,$p' > directus/schema/snapshot.yaml
```

El `sed` descarta líneas de log que el CLI emite por stdout. Si cambian los permisos públicos,
actualizar también `directus/schema/public-permissions.json` exportando las filas de
`GET /permissions?filter[policy][_eq]=<id-politica-public>` con los campos
`collection`, `action`, `fields` y `permissions`.
