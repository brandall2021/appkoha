# Stack local CMS + Push

> **Deploy a producción (pendiente):**
> - **EAS projectId:** correr `npx eas init` (requiere login Expo) y pegar el resultado en `app.json → extra.eas.projectId`. No hay projectId inventado — es manual.
> - **URLs de institución:** los links seed de `apply.sh` usan URLs de ejemplo (`autogestion.institucion.edu.ar`). Actualizar antes de deploy real.

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
- `DIRECTUS_SERVICE_TOKEN`: token estático del usuario `svc-push-sender` (generar con `uuidgen` o `openssl rand -hex 20`; `apply.sh` lo asigna al usuario al crearlo).
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`: generar con `npx web-push generate-vapid-keys` y pegar los valores. El push-sender las usa para la vía web-push nativa.

## Bootstrap desde cero

Reconstruye Directus vacío con el esquema de novedades (`noticias`, `links_utiles`, `push_tokens`)
y los permisos del rol Public ya aplicados:

```bash
cd infra/cms
cp .env.example .env   # completar valores reales; DIRECTUS_ADMIN_EMAIL debe tener formato válido
docker compose up -d postgres directus
bash directus/schema/apply.sh
```

`apply.sh` es idempotente y hace cinco cosas:

1. Espera a que Directus esté sano (el admin inicial se crea solo desde `DIRECTUS_ADMIN_EMAIL`/`DIRECTUS_ADMIN_PASSWORD`).
2. Aplica `directus/schema/snapshot.yaml` vía `POST /schema/diff` + `POST /schema/apply` (mismo flujo que el panel: Ajustes → Modelo de datos → Importar).
3. Siembra los permisos del rol Public desde `directus/schema/public-permissions.json` (read en `noticias` solo con `status=published`, read en `links_utiles`, nada más).
4. Crea el usuario `svc-push-sender@institucion.edu.ar` con la política `servicio` (create/read/delete en `push_tokens`), el Flow "Noticia publicada → push" y las 3 operaciones de encadenamiento (condición → lectura → request a push-sender).
5. Verificación: comprueba que `/items/noticias` es legible sin token y que `/items/push_tokens` devuelve 403.

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

## Flujo de push (Noticia publicada → push)

El Flow "Noticia publicada → push" (`apply.sh` paso 4) dispara al publicar una noticia:

1. **condicion_publicada** — evalúa `status === "published"`.
2. **leer_noticia** — lee la noticia modificada (`$trigger.keys[0]`) vía `item-read`.
3. **enviar_push** — POST a `http://push-sender:8056/send` con header `x-shared-secret` y body `{"titulo": "$last.0.titulo", "id": "$last.0.id"}`.

> **Nota técnica (Directus 11.17.4):** las variables de operaciones anteriores **no** se
> exponen por key (`$leer_noticia`); solo están disponibles `$last` (salida de la
> operación inmediata), `$trigger` y `$accountability`. El acceso a elementos del array
> debe usar notación punto (`$last.0.titulo`), no corchetes (`$last[0]`), por compatibilidad
> con micromustache.

El push-sender reenvía a Expo (`exp.host/--/api/v2/push/send`). Tokens mal formados o
desconocidos provocan un HTTP 200 con ticket de error (no 400/410), así que la limpieza
automática de `push_tokens` solo se activa para la vía web-push.

### Sembrar links útiles

```bash
TOKEN=$(curl -sf -X POST http://localhost:8055/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$DIRECTUS_ADMIN_EMAIL\",\"password\":\"$DIRECTUS_ADMIN_PASSWORD\"}" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["access_token"])')

curl -s -X POST http://localhost:8055/items/links_utiles \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"titulo":"SIU Guaraní","url":"https://autogestion.institucion.edu.ar","icono":"school","orden":1,"destacado":true}'
# ... repeat for other links
```
