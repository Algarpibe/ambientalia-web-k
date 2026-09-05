#!/usr/bin/env bash
# ESCALÓN 2 (2.ª mitad) de la 148.ª — arrancar el servicio en el VPS.
#
#   bash docs/research/cola-larga/derivaciones/arranque-148.sh > arranque-148.log 2>&1; echo "EXIT=$?"
#
# LO QUE ESTE SCRIPT NO HACE, y está declarado en el pre-registro:
#   · no toca `web.ambientalia.cloud` — lo sirve producción (200, 144 327 bytes)
#   · no reinicia, para ni reconfigura ninguno de los 25 servicios corriendo
#   · no borra la definición `web` de Easypanel ni su log: son la evidencia
#   · Postgres es PROPIO, no uno de los 6 existentes: el clon corre migraciones
#     y compartir base con producción no es una optimización, es acoplamiento
#
# Los secretos se generan EN EL VPS y no se imprimen (§regla 59: no añadir el
# secreto a la transcripción; su presencia se prueba por efecto, no leyéndolo).

set -u
export MSYS_NO_PATHCONV=1
VPS=kunak-vps

echo "############ ARRANQUE · $(date -u +%Y-%m-%dT%H:%M:%SZ) ############"
echo

ssh $VPS 'bash -s' <<'REMOTO'
set -u
RED=easypanel-ambientalia_project
IMG=ai-website-cloner:145-publicfix
SVC_DB=ambientalia_project_kunak-db
SVC_WEB=ambientalia_project_web
ENVF=/etc/easypanel/kunak-clon.env

echo "======== A · GUARDA: nada que ya exista se toca ========"
for s in $SVC_DB $SVC_WEB; do
  if docker service inspect "$s" >/dev/null 2>&1; then
    echo "  ⚠ $s YA EXISTE — se PARA aquí, no se pisa"; exit 9
  else
    echo "  $s: libre"
  fi
done
echo "  servicios corriendo ANTES: $(docker service ls -q | wc -l)"
echo

echo "======== B · SECRETOS (generados aquí, no impresos) ========"
if [ -f "$ENVF" ]; then
  echo "  $ENVF ya existe — se reutiliza (no se regenera: rotar secretos no es de esta tanda)"
else
  umask 077
  {
    echo "PGPASS=$(openssl rand -hex 24)"
    echo "PAYLOAD_SECRET=$(openssl rand -hex 32)"
    echo "PUBLICAR_SECRETO=$(openssl rand -hex 32)"
    echo "PREVIEW_SECRETO=$(openssl rand -hex 32)"
  } > "$ENVF"
  echo "  generado $ENVF"
fi
chmod 600 "$ENVF"
. "$ENVF"
echo "  longitudes (no los valores): PGPASS=${#PGPASS} PAYLOAD_SECRET=${#PAYLOAD_SECRET} PUBLICAR_SECRETO=${#PUBLICAR_SECRETO} PREVIEW_SECRETO=${#PREVIEW_SECRETO}"
echo

echo "======== C · POSTGRES PROPIO ========"
docker volume create kunak-clon-pgdata >/dev/null
docker service create --detach \
  --name "$SVC_DB" \
  --network "$RED" \
  --mount type=volume,source=kunak-clon-pgdata,target=/var/lib/postgresql/data \
  --env POSTGRES_USER=kunak \
  --env POSTGRES_PASSWORD="$PGPASS" \
  --env POSTGRES_DB=kunak \
  --limit-cpu 0.5 --limit-memory 512M \
  postgres:17 >/dev/null 2>&1 && echo "  creado $SVC_DB" || { echo "  FALLO al crear $SVC_DB"; exit 1; }
echo "  (limitado a 0.5 CPU y 512M: no puede competir con producción)"

echo -n "  esperando a que acepte conexiones"
for i in $(seq 1 60); do
  CID=$(docker ps -q -f name="$SVC_DB" | head -1)
  if [ -n "$CID" ] && docker exec "$CID" pg_isready -U kunak -q 2>/dev/null; then
    echo " -> LISTO en ${i}s"; break
  fi
  echo -n "."; sleep 1
done
echo
echo "  -- y el CANAL que importa no es pg_isready, es el SOCKET (§El principio) --"
docker run --rm --network "$RED" postgres:17 \
  sh -c "PGPASSWORD='$PGPASS' psql -h $SVC_DB -U kunak -d kunak -tAc 'select 1'" 2>&1 | head -2
echo

echo "======== D · EL SITIO, con las NUEVE variables ========"
docker service create --detach \
  --name "$SVC_WEB" \
  --network "$RED" \
  --mount type=volume,source=kunak-clon-media,target=/app/media \
  --env DATABASE_URI="postgres://kunak:${PGPASS}@${SVC_DB}:5432/kunak" \
  --env PAYLOAD_SECRET="$PAYLOAD_SECRET" \
  --env PUBLICAR_SECRETO="$PUBLICAR_SECRETO" \
  --env PREVIEW_SECRETO="$PREVIEW_SECRETO" \
  --env PUBLICAR_URL="http://127.0.0.1:3001/publicar" \
  --env PUBLICAR_SERVIDOR=1 \
  --env PUBLICAR_CONTENEDOR="$SVC_WEB" \
  --env MEDIA_DIR=/app/media \
  --env PG_POOL_MAX=3 \
  --env NODE_ENV=production \
  --limit-cpu 1.0 --limit-memory 1024M \
  "$IMG" >/dev/null 2>&1 && echo "  creado $SVC_WEB" || { echo "  FALLO al crear $SVC_WEB"; exit 1; }
echo "  (limitado a 1.0 CPU y 1024M de los 4 738 disponibles)"
echo "  las nueve: DATABASE_URI PAYLOAD_SECRET PUBLICAR_SECRETO PREVIEW_SECRETO"
echo "             PUBLICAR_URL PUBLICAR_SERVIDOR PUBLICAR_CONTENEDOR MEDIA_DIR PG_POOL_MAX"

echo -n "  esperando a que la tarea arranque"
for i in $(seq 1 90); do
  CID=$(docker ps -q -f name="$SVC_WEB" | head -1)
  [ -n "$CID" ] && { echo " -> contenedor arriba en ${i}s"; break; }
  echo -n "."; sleep 1
done
echo
echo "  -- estado de la tarea --"
docker service ps "$SVC_WEB" --no-trunc --format '  {{.Name}} {{.CurrentState}} {{.Error}}' | head -3
echo
echo "  -- ¿escucha? El canal es el SOCKET, no el estado del proceso --"
CID=$(docker ps -q -f name="$SVC_WEB" | head -1)
for i in $(seq 1 60); do
  if [ -n "$CID" ] && docker exec "$CID" node -e 'fetch("http://127.0.0.1:3000/").then(r=>{console.log("HTTP "+r.status);process.exit(0)}).catch(e=>process.exit(1))' 2>/dev/null; then
    echo "  -> sirve en ${i}s"; break
  fi
  sleep 1
  [ "$i" = 60 ] && { echo "  NO responde en 60 s — logs:"; docker service logs "$SVC_WEB" 2>&1 | tail -20; }
done
echo

echo "======== E · IMPACTO SOBRE PRODUCCIÓN (el invariante) ========"
echo -n "  servicios corriendo DESPUÉS: "; docker service ls -q | wc -l
echo "  carga: $(uptime | sed 's/.*load average: //')"
echo "  memoria: $(free -m | awk '/^Mem:/{printf "usado=%s disponible=%s",$3,$7}')"
echo "  -- los 25 de antes siguen con sus réplicas? --"
docker service ls --format '{{.Replicas}}' | sort | uniq -c
REMOTO
echo
echo "############ FIN ARRANQUE ############"
