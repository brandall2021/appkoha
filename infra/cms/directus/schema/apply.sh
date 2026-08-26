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

echo "[1/5] esperando directus..."
docker compose up -d postgres directus >/dev/null
for i in $(seq 1 45); do
  curl -sf http://localhost:8055/server/ping >/dev/null && break
  [ "$i" = 45 ] && { echo "directus no respondio" >&2; exit 1; }
  sleep 3
done

echo "[2/5] aplicando snapshot de esquema..."
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

echo "[3/5] sembrando permisos del rol Public..."
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

echo "[4/5] sembrando servicio push (rol, usuario, flow)..."
ADMIN_TOKEN="$TOKEN" python3 <<'PY'
import json, os, urllib.request, urllib.error

SECRET  = os.environ["PUSH_SHARED_SECRET"]
SVC_TOK  = os.environ["DIRECTUS_SERVICE_TOKEN"]
SVC_EMAIL = "svc-push-sender@institucion.edu.ar"

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

def one(url):
    d = req("GET", url).get("data")
    return d[0] if d else None

def filter_get(path, **kwargs):
    qs = "&".join(f"filter[{k}][_eq]={v}" for k, v in kwargs.items())
    return req("GET", f"{path}?{qs}&limit=-1")["data"]

# --- policy ---
pol = one("/policies?filter[name][_eq]=servicio")
if not pol:
    pol = req("POST", "/policies", {"name": "servicio", "icon": "build",
        "description": "Acceso minimo para servicios internos (push-sender)",
        "app_access": False, "admin_access": False})["data"]
    print("  + policy servicio")
pid = pol["id"]

# --- role ---
rol = one("/roles?filter[name][_eq]=servicio")
if not rol:
    rol = req("POST", "/roles", {"name": "servicio", "icon": "smart_toy",
        "description": "Servicios internos"})["data"]
    print("  + role servicio")
rid = rol["id"]

# --- access role -> policy ---
acc = filter_get("/access", role=rid, policy=pid)
if not acc:
    req("POST", "/access", {"role": rid, "policy": pid})
    print("  + role servicio -> policy servicio")

# --- permissions on push_tokens ---
for action in ("create", "read", "delete"):
    if not filter_get("/permissions", policy=pid, collection="push_tokens", action=action):
        req("POST", "/permissions", {"policy": pid, "collection": "push_tokens",
            "action": action, "fields": ["*"]})
        print(f"  + push_tokens {action}")

# --- user with static token ---
users = req("GET", "/users?limit=-1")["data"]
usr = next((u for u in users if u["email"] == SVC_EMAIL), None)
if not usr:
    req("POST", "/users", {"email": SVC_EMAIL, "first_name": "svc", "status": "active",
        "role": rid, "token": SVC_TOK})
    print("  + usuario svc-push-sender con token de .env")
else:
    cur_tok = (req("GET", "/users/" + usr["id"])["data"] or {}).get("token", "")
    if cur_tok != SVC_TOK:
        req("PATCH", "/users/" + usr["id"], {"token": SVC_TOK})
        print("  ~ token del usuario actualizado al de .env")

# --- flow: Noticia publicada → push ---
FLOW_NAME = "Noticia publicada \u2192 push"
flows = req("GET", "/flows?limit=-1")["data"]
flow = next((f for f in flows if f["name"] == FLOW_NAME), None)
if not flow:
    flow = req("POST", "/flows", {"name": FLOW_NAME, "status": "active",
        "trigger": "event", "accounting": {},
        "options": {"type": "action", "scope": ["items.update"],
                    "collections": ["noticias"]}})["data"]
    print("  + flow", FLOW_NAME)
fid = flow["id"]

COND_EXPR = '{{\\$trigger.payload.status}} === "published"'
READ_Q = '{{"filter": {"id": {"_eq": "{{\\$trigger.keys[0]}}"}}, "limit": 1}}'
BODY_TPL = '{{"titulo": "{{\\$last.0.titulo}}", "id": "{{\\$last.0.id}}"}}'
SPEC = [
    ("condicion_publicada", "condition",
     {"expression": '{{$trigger.payload.status}} === "published"'}, None),
    ("leer_noticia", "item-read",
     {"collection": "noticias",
      "query": '{"filter": {"id": {"_eq": "{{$trigger.keys[0]}}"}}, "limit": 1}'},
     None),
    ("enviar_push", "request",
     {"method": "post", "url": "http://push-sender:8056/send",
      "headers": [{"header": "x-shared-secret", "value": SECRET}],
      "body": '{"titulo": "{{$last.0.titulo}}", "id": "{{$last.0.id}}"}'},
     None),
]
POS = {"condicion_publicada": (100, 100), "leer_noticia": (300, 100), "enviar_push": (500, 100)}
existing = {o["key"]: o["id"]
            for o in req("GET", f"/operations?filter[flow][_eq]={fid}&limit=-1")["data"]}
ids = {}
for key, typ, opts, _ in SPEC:
    if key in existing:
        ids[key] = existing[key]
        req("PATCH", f"/operations/{ids[key]}", {"options": opts})
        continue
    op = req("POST", "/operations", {"flow": fid, "name": key, "key": key,
        "type": typ, "options": opts, "position_x": POS[key][0], "position_y": POS[key][1]})
    ids[key] = op["data"]["id"]
    print(f"  + operacion {key}")

req("PATCH", f"/operations/{ids['condicion_publicada']}", {"resolve": ids["leer_noticia"]})
req("PATCH", f"/operations/{ids['leer_noticia']}",      {"resolve": ids["enviar_push"]})
if flow.get("operation") != ids["condicion_publicada"]:
    req("PATCH", f"/flows/{fid}", {"operation": ids["condicion_publicada"]})
    print("  + entry point del flow fijado")
print("  servicio push ok")
PY

echo "[5/5] listo. Verificacion:"
curl -s -o /dev/null -w '  GET /items/noticias     sin token -> %{http_code}\n' http://localhost:8055/items/noticias
curl -s -o /dev/null -w '  GET /items/push_tokens  sin token -> %{http_code}\n' http://localhost:8055/items/push_tokens
