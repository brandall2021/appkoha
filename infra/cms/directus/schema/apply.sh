#!/usr/bin/env bash
# Aplica el esquema de novedades (snapshot.yaml) sobre un Directus recién creado
# y siembra los permisos del rol Public (public-permissions.json).
#
# Usa la API REST de esquema (POST /schema/diff + /schema/apply), el mismo flujo
# del panel (Ajustes > Modelo de datos > Importar). Idempotente: si el esquema ya
# está aplicado el diff vuelve vacio y solo se siembran los permisos faltantes.
#
# Uso: bash directus/schema/apply.sh   (desde infra/cms/, con .env completo;
#      DIRECTUS_ADMIN_EMAIL debe ser un email con formato valido o el bootstrap
#      inicial de Directus falla)
set -euo pipefail
cd "$(dirname "$0")/../.."

set -a; . ./.env; set +a

echo "[1/4] esperando directus..."
docker compose up -d postgres directus >/dev/null
for i in $(seq 1 45); do
  curl -sf http://localhost:8055/server/ping >/dev/null && break
  [ "$i" = 45 ] && { echo "directus no respondio" >&2; exit 1; }
  sleep 3
done

echo "[2/4] aplicando snapshot de esquema..."
TOKEN=$(curl -sf -X POST http://localhost:8055/auth/login \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$DIRECTUS_ADMIN_EMAIL\",\"password\":\"$DIRECTUS_ADMIN_PASSWORD\"}" \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["access_token"])')

ADMIN_TOKEN="$TOKEN" python3 <<'PY'
import json, os, urllib.request, urllib.error, yaml

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request("http://localhost:8055" + path, data=data, method=method,
                               headers={"Authorization": "Bearer " + os.environ["ADMIN_TOKEN"],
                                        "Content-Type": "application/json"})
    try:
        resp = urllib.request.urlopen(r)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ERROR {method} {path} -> {e.code}: {e.read().decode()[:300]}")
    raw = resp.read().decode()
    return json.loads(raw) if raw else None

snap = yaml.safe_load(open("directus/schema/snapshot.yaml"))
diff = req("POST", "/schema/diff?force=true", snap)
d = (diff or {}).get("data")
if not d or not d.get("diff"):
    print("  esquema sin diferencias")
else:
    print(f"  diff: {len(d['diff'])} operaciones")
    req("POST", "/schema/apply", {"diff": d["diff"], "hash": d["hash"]})
    print("  esquema aplicado")
PY

echo "[3/4] sembrando permisos del rol Public..."
ADMIN_TOKEN="$TOKEN" python3 <<'PY'
import json, os, urllib.request, urllib.error

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request("http://localhost:8055" + path, data=data, method=method,
                               headers={"Authorization": "Bearer " + os.environ["ADMIN_TOKEN"],
                                        "Content-Type": "application/json"})
    try:
        resp = urllib.request.urlopen(r)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"ERROR {method} {path} -> {e.code}: {e.read().decode()[:300]}")
    raw = resp.read().decode()
    return json.loads(raw) if raw else None

pols = req("GET", "/policies?limit=-1&fields=id,name,app_access,admin_access")["data"]
pub = [p for p in pols if p["name"] == "$t:public_label"] or \
      [p for p in pols if not p["app_access"] and not p["admin_access"]]
assert pub, "politica publica no encontrada"
policy = pub[0]["id"]

wanted = json.load(open("directus/schema/public-permissions.json"))
for w in wanted:
    q = (f"/permissions?filter[policy][_eq]={policy}"
         f"&filter[collection][_eq]={w['collection']}&filter[action][_eq]={w['action']}")
    if req("GET", q)["data"]:
        continue
    req("POST", "/permissions", {"policy": policy, **w})
    print(f"  + public read {w['collection']}")
print("  permisos ok")
PY

echo "[4/4] listo. Verificacion:"
curl -s -o /dev/null -w '  GET /items/noticias     sin token -> %{http_code}\n' http://localhost:8055/items/noticias
curl -s -o /dev/null -w '  GET /items/push_tokens  sin token -> %{http_code}\n' http://localhost:8055/items/push_tokens
