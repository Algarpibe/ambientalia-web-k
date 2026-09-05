#!/usr/bin/env bash
# PASO 0 de la 148.ª — el terreno del VPS, derivado.
#
# Ninguna cifra del encargo es premisa: todo lo que sale aquí se mide.
# Se corre desde el host del propietario; la parte del VPS va por `ssh kunak-vps`.
#
#   bash docs/research/cola-larga/derivaciones/paso0-148.sh > paso0-148.log 2>&1; echo "EXIT=$?"
#
# §regla 62: el veredicto se lee EN EL LOG, no en el "exit code" que informa
# quien lanza — la propia forma `> log; echo EXIT=$?` se lo quita.

set -u
VPS=kunak-vps
export MSYS_NO_PATHCONV=1

echo "############ PASO 0 · 148.ª · $(date -u +%Y-%m-%dT%H:%M:%SZ) ############"
echo

echo "======== 1 · EL ÁRBOL ========"
git log --oneline -1
echo -n "worktree limpio: "; test -z "$(git status --porcelain)" && echo "SÍ" || echo "NO"
echo

echo "======== 2 · CENSO DEL VPS (con denominador) ========"
ssh $VPS 'bash -s' <<'REMOTO'
echo "-- host --"
hostname
echo -n "núcleos: "; nproc
echo "-- memoria (MB) --"
free -m | awk '/^Mem:/{printf "total=%s usado=%s libre=%s disponible=%s\n",$2,$3,$4,$7}'
echo "-- carga --"
uptime | sed 's/.*load average/load average/'
echo "-- disco --"
df -h / | awk 'NR==2{printf "total=%s usado=%s libre=%s uso=%s\n",$2,$3,$4,$5}'
echo
echo "-- contenedores --"
echo -n "docker ps -a  : "; docker ps -a -q | wc -l
echo -n "corriendo     : "; docker ps -q | wc -l
echo -n "parados       : "; docker ps -a -q -f status=exited | wc -l
echo
echo "-- servicios swarm (la unidad correcta: un servicio != un contenedor) --"
echo -n "n servicios swarm: "; docker service ls -q | wc -l
echo -n "con replicas 0   : "; docker service ls --format '{{.Replicas}}' | grep -c '^0/'
echo
echo "-- reparto por imagen, corriendo --"
docker ps --format '{{.Image}}' | sort | uniq -c | sort -rn
echo
echo "-- POSTGRES: derivado por imagen, no contado a mano --"
echo -n "n postgres:17 corriendo: "; docker ps --filter ancestor=postgres:17 -q | wc -l
docker ps --filter ancestor=postgres:17 --format '{{.Names}}' | sed -E 's/\.1\.[a-z0-9]+$//' | sort
echo
echo "-- swarm: cuantos NODOS --"
docker node ls --format '{{.Hostname}} {{.Status}} {{.ManagerStatus}}'
echo -n "n nodos: "; docker node ls -q | wc -l
REMOTO
echo

echo "======== 3 · EL SERVICIO 'web' — LA EVIDENCIA DEL FALLO ========"
ssh $VPS 'bash -s' <<'REMOTO'
echo "-- existe la DEFINICION en Easypanel? --"
if [ -d /etc/easypanel/projects/ambientalia_project/web ]; then
  echo "SÍ  mtime=$(stat -c %y /etc/easypanel/projects/ambientalia_project/web | cut -d. -f1)"
  echo -n "tamaño de web/code: "; du -sh /etc/easypanel/projects/ambientalia_project/web/code 2>/dev/null | cut -f1
else
  echo "NO"
fi
echo "-- existe el SERVICIO swarm? (los dos canales, §El principio) --"
if docker service inspect ambientalia_project_web >/dev/null 2>&1; then
  echo "SÍ — swarm lo tiene"
else
  echo "NO — declarado en Easypanel y NUNCA desplegado a swarm"
fi
echo
echo "-- cuantos INTENTOS de despliegue hubo? --"
N=$(grep -l 'ambientalia_project/web' /etc/easypanel/actions/*.log 2>/dev/null | wc -l)
echo "n intentos con log: $N"
for f in $(grep -l 'ambientalia_project/web' /etc/easypanel/actions/*.log 2>/dev/null); do
  echo "--- $f  ($(stat -c %y "$f" | cut -d. -f1)) ---"
  # sólo la cola: la cabecera del log es el mensaje de commit, no el build
  sed -n '/Download Github Archive Started/,$p' "$f"
done
REMOTO
echo

echo "======== 4 · CAMINOS DE ENTREGA DE IMAGEN ========"
ssh $VPS 'bash -s' <<'REMOTO'
echo "-- (a) REGISTRO: hay credenciales? --"
if [ -f /root/.docker/config.json ]; then
  echo "SÍ existe /root/.docker/config.json"
  grep -o '"auths"[^,]*' /root/.docker/config.json 2>/dev/null | head -1
else
  echo "NO — /root/.docker/config.json no existe: cero credenciales de registro"
fi
echo
echo "-- (b) IMAGEN LOCAL: swarm la acepta? Evidencia + control --"
echo -n "servicios corriendo con imagen local easypanel/*: "
docker service ls --format '{{.Image}}' | grep -c '^easypanel/ambientalia'
echo "  EVIDENCIA — hub-api referencia:"
docker service inspect ambientalia_project_hub-api \
  --format '    {{.Spec.TaskTemplate.ContainerSpec.Image}}'
echo "  y ese repo NO existe en ningún registro:"
docker manifest inspect easypanel/ambientalia_project/hub-api:latest 2>&1 | head -2 | sed 's/^/    /'
echo "  CONTROL — n8n, imagen SÍ pública:"
docker service inspect ambientalia_project_n8n \
  --format '    {{.Spec.TaskTemplate.ContainerSpec.Image}}'
echo
echo "-- (c) docker load disponible? --"
docker load --help >/dev/null 2>&1 && echo "SÍ" || echo "NO"
echo
echo "-- (d) API del panel: se puede automatizar? --"
echo -n "GET /api/trpc/projects.listProjectsAndServices -> "
curl -s -o /dev/null -w '%{http_code}\n' --max-time 10 \
  http://127.0.0.1:3000/api/trpc/projects.listProjectsAndServices
REMOTO
echo

echo "======== 5 · EL ARTEFACTO — CUÁL LLEVAR ========"
echo "-- candidatas en el host --"
docker images --format '{{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}' \
  | grep '^ai-website-cloner' | sort
echo
echo "-- (a) SECRETO dentro (§regla 59), CON SUS DOS POLARIDADES (§regla 28d) --"
for TAG in 144-test 144-fix 145-publicfix; do
  N=$(docker run --rm --entrypoint sh ai-website-cloner:$TAG \
        -c 'find / -name "*.env" -not -path "/proc/*" 2>/dev/null | wc -l' 2>/dev/null)
  printf '  %-28s n_env=%s\n' "ai-website-cloner:$TAG" "$N"
done
echo "  (si 144-test no da >=1, la sonda está MUDA y su 0 no es ausencia)"
echo
echo "-- (b) public/ (§regla 61: el defecto que deja los assets en 404) --"
for TAG in 144-fix 145-publicfix; do
  echo "  ai-website-cloner:$TAG"
  docker run --rm --entrypoint sh ai-website-cloner:$TAG -c \
    'for d in /app/public /app/apps/web/public; do
       if [ -d "$d" ]; then echo "    EXISTE $d ($(find $d -type f 2>/dev/null | wc -l) ficheros)";
       else echo "    no existe $d"; fi; done' 2>/dev/null
done
echo
echo "-- (c) de dónde sale el +1.38 GB de 145-publicfix --"
docker history ai-website-cloner:145-publicfix --format '{{.Size}}\t{{.CreatedBy}}' --no-trunc 2>/dev/null \
  | awk -F'\t' '$1!="0B"{printf "    %-10s %.70s\n",$1,$2}' | head -3
echo

echo "======== 6 · EL DOMINIO — LO QUE EL ESCALÓN 3 IBA A TOCAR ========"
ssh $VPS 'bash -s' <<'REMOTO'
echo "-- routers que reclaman web.ambientalia.cloud --"
grep -oE '"rule": "Host\(`web\.ambientalia\.cloud[^`]*`\)[^"]*"' \
  /etc/easypanel/traefik/config/main.yaml 2>/dev/null | sort | uniq -c
echo "-- y a qué servicio apunta cada uno --"
grep -B3 -A1 'web\.ambientalia\.cloud' /etc/easypanel/traefik/config/main.yaml 2>/dev/null \
  | grep '"service"' | sort | uniq -c
REMOTO
echo "-- QUÉ SIRVE HOY ese dominio (§El principio: la salida servida) --"
curl -s -o /dev/null -w '  status=%{http_code}  bytes=%{size_download}\n' \
  -L --max-time 25 https://web.ambientalia.cloud/
echo -n "  title: "
curl -s -L --max-time 25 https://web.ambientalia.cloud/ | grep -o -m1 '<title>[^<]*</title>'
echo

echo "############ FIN PASO 0 ############"
