#!/usr/bin/env bash
# ESCALÓN 3 de la 148.ª — el reparto: qué queda, medido y no supuesto.
#
#   bash docs/research/cola-larga/derivaciones/reparto-148.sh > reparto-148.log 2>&1; echo "EXIT=$?"
#
# NO TOCA NADA. Es sólo lectura: deriva el estado del enrutado, si el panel ve
# el servicio nuevo, y por dónde se rompe el ciclo de publicación ahora que el
# sitio corre en OTRA máquina que el publicador.

set -u
export MSYS_NO_PATHCONV=1
VPS=kunak-vps

echo "############ REPARTO · $(date -u +%Y-%m-%dT%H:%M:%SZ) ############"
echo

echo "======== 1 · EL DOMINIO: quién reclama qué ========"
ssh $VPS 'bash -s' <<'REMOTO'
python3 - <<'PY' 2>/dev/null || echo "(sin python3, se cae al grep de abajo)"
import json,sys
d=json.load(open('/etc/easypanel/traefik/config/main.yaml'))
rs=d.get('http',{}).get('routers',{})
print("routers totales:", len(rs))
print()
print("los que mencionan web.ambientalia.cloud:")
for n,r in sorted(rs.items()):
    rule=r.get('rule','')
    if 'web.ambientalia.cloud' in rule:
        host=rule.split('`')[1] if '`' in rule else '?'
        valido = ('/' not in host) and (' ' not in host)
        print(f"  {n}")
        print(f"     host='{host}'  ¿host VÁLIDO? {'SÍ' if valido else 'NO — lleva una barra dentro'}")
        print(f"     -> servicio: {r.get('service')}   entryPoints={r.get('entryPoints')}")
print()
print("¿existe el servicio de Traefik al que apunta cada uno?")
svcs=d.get('http',{}).get('services',{})
for n in ('ambientalia_project_ambientalia-web-0','ambientalia_project_web-0'):
    s=svcs.get(n)
    print(f"  {n}: {'DEFINIDO -> '+str(s.get('loadBalancer',{}).get('servers')) if s else 'NO DEFINIDO'}")
PY
REMOTO
echo

echo "======== 2 · ¿EL PANEL VE EL SERVICIO NUEVO? ========"
ssh $VPS 'bash -s' <<'REMOTO'
echo -n "swarm lo tiene:       "; docker service inspect ambientalia_project_web >/dev/null 2>&1 && echo "SÍ" || echo "no"
echo -n "Easypanel lo declara: "; [ -d /etc/easypanel/projects/ambientalia_project/web ] && echo "SÍ (directorio del intento fallido)" || echo "no"
echo "-- y el source que Easypanel tiene guardado para él sigue siendo GitHub --"
echo "   (si el propietario pulsa Deploy, Easypanel intentará reconstruir y PISARÁ este servicio)"
echo
echo "-- réplicas del servicio nuevo --"
docker service ls --filter name=ambientalia_project_web --format '   {{.Name}} {{.Replicas}} {{.Image}}'
docker service ls --filter name=ambientalia_project_kunak-db --format '   {{.Name}} {{.Replicas}} {{.Image}}'
REMOTO
echo

echo "======== 3 · EL CICLO DE PUBLICACIÓN: por dónde se rompe ========"
echo "-- (a) cómo promociona el publicador, derivado del fuente --"
grep -n "renameSync(DIST_NUEVO, DIST)" scripts/publicar/publicador.mjs | head -2 | sed 's/^/   /'
grep -n 'spawnSync("docker", \["restart"' scripts/publicar/publicador.mjs | head -2 | sed 's/^/   /'
echo "   -> promoción = rename en el SISTEMA DE FICHEROS LOCAL"
echo "   -> reinicio  = docker restart contra el DEMONIO LOCAL"
echo
echo "-- (b) ¿dónde vive el .next del contenedor del VPS? --"
ssh $VPS 'CID=$(docker ps -q -f name=ambientalia_project_web | head -1);
  echo -n "   montajes del contenedor: ";
  docker inspect "$CID" --format "{{range .Mounts}}{{.Destination}} {{end}}";
  echo -n "   .next dentro de la imagen: ";
  docker exec "$CID" sh -c "test -d /app/apps/web/.next && echo SI || echo no"'
echo "   -> el .next viaja DENTRO de la imagen: no hay volumen que promocionar"
echo
echo "-- (c) el buildId servido HOY (la unidad de B1) --"
ssh $VPS 'CID=$(docker ps -q -f name=ambientalia_project_web | head -1);
  docker exec "$CID" sh -c "cat /app/apps/web/.next/BUILD_ID" | sed "s/^/   BUILD_ID=/"'
echo

echo "======== 4 · LA PREGUNTA DE LA 147.ª, REDIMENSIONADA ========"
echo "-- ¿sigue la tubería de Easypanel en algún camino crítico? --"
ssh $VPS 'bash -s' <<'REMOTO'
echo -n "   el clon corre desde imagen local: "
docker service inspect ambientalia_project_web --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' 2>/dev/null
echo -n "   ¿pasó por curl|tar de Easypanel? "
echo "NO — llegó por docker save/scp/load, verificado por sha256"
REMOTO
echo
echo "############ FIN REPARTO ############"
