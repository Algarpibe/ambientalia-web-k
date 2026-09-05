#!/usr/bin/env bash
# P3 de la 148.ª — ¿sirve las rutas y CARGAN LOS ASSETS?
#
#   bash docs/research/cola-larga/derivaciones/p3-148.sh > p3-148.log 2>&1; echo "EXIT=$?"
#
# §regla 61 — el 200 NO es el criterio para un asset: una página de error también
# lo es. Lo que cierra es que los BYTES coincidan con el fichero de origen.
#
# Y el testigo lleva SEPARADORA (§*un modelo se elige por lo que lo SEPARA*): la
# misma petición contra `144-fix` —la imagen con el defecto de §regla 61— se
# corre EN LOCAL y tiene que dar algo distinto. Si diera lo mismo, el testigo no
# separa y P3b no habría probado nada.

set -u
export MSYS_NO_PATHCONV=1
VPS=kunak-vps
SVC=ambientalia_project_web
TESTIGO=/images/logos/kunak-logo.svg
BYTES_ESPERADOS=6037

echo "############ P3 · $(date -u +%Y-%m-%dT%H:%M:%SZ) ############"
echo

echo "======== P3a · RUTAS DEL MANIFIESTO ========"
ssh $VPS "bash -s" <<'REMOTO'
CID=$(docker ps -q -f name=ambientalia_project_web | head -1)
[ -z "$CID" ] && { echo "NO hay contenedor del clon"; exit 1; }
docker exec "$CID" node -e '
const m = require("/app/apps/web/.next/prerender-manifest.json");
const todas = Object.keys(m.routes || {}).filter(r => !r.startsWith("/_"));
console.log("rutas_en_manifiesto=" + Object.keys(m.routes||{}).length);
console.log("rutas_pedibles=" + todas.length + "  (descontadas /_global-error y /_not-found)");
// muestra DETERMINISTA: primera, ultima y 18 repartidas
const N = 20, idx = [];
for (let i = 0; i < N; i++) idx.push(Math.floor(i * (todas.length - 1) / (N - 1)));
const muestra = [...new Set(idx)].map(i => todas[i]);
console.log("muestra=" + muestra.length);
(async () => {
  let ok = 0, mal = [];
  for (const r of muestra) {
    try {
      const res = await fetch("http://127.0.0.1:3000" + r);
      if (res.status === 200) ok++; else mal.push(r + " -> " + res.status);
    } catch (e) { mal.push(r + " -> " + e.message); }
  }
  console.log("status_200=" + ok + "/" + muestra.length);
  if (mal.length) { console.log("FALLAN:"); mal.forEach(m => console.log("  " + m)); }
})();
'
REMOTO
echo

echo "======== P3b · EL ASSET TESTIGO, POR BYTES ========"
echo "esperado: $BYTES_ESPERADOS bytes en $TESTIGO"
echo
echo "-- (1) EN EL VPS, la imagen que se entregó (145-publicfix) --"
ssh $VPS "bash -s" <<REMOTO
CID=\$(docker ps -q -f name=$SVC | head -1)
docker exec "\$CID" node -e '
fetch("http://127.0.0.1:3000$TESTIGO")
  .then(async r => {
    const b = Buffer.from(await r.arrayBuffer());
    console.log("  status=" + r.status + "  bytes=" + b.length +
      "  veredicto=" + (b.length === $BYTES_ESPERADOS ? "COINCIDE" : "NO COINCIDE"));
  })
  .catch(e => console.log("  ERROR " + e.message));
'
REMOTO
echo
echo "-- (2) SEPARADORA en LOCAL: 144-fix, la imagen con el defecto --"
docker rm -f p3-separadora >/dev/null 2>&1
docker run -d --name p3-separadora -p 39123:3000 \
  -e DATABASE_URI=postgres://x:x@127.0.0.1:5432/x \
  -e PAYLOAD_SECRET=separadora-no-es-un-secreto-real \
  ai-website-cloner:144-fix >/dev/null 2>&1
for i in $(seq 1 40); do
  curl -s -o /dev/null --max-time 3 http://127.0.0.1:39123/ 2>/dev/null && break
  sleep 1
done
curl -s -o /dev/null -w "  status=%{http_code}  bytes=%{size_download}\n" \
  --max-time 15 "http://127.0.0.1:39123$TESTIGO" 2>&1
docker rm -f p3-separadora >/dev/null 2>&1
echo "  (si esto diera $BYTES_ESPERADOS, el testigo NO separa y P3b no prueba nada)"
echo

echo "======== P3c · LOS TRES CARDINALES DE ASSETS ========"
ssh $VPS "bash -s" <<'REMOTO'
CID=$(docker ps -q -f name=ambientalia_project_web | head -1)
docker exec "$CID" node -e '
(async () => {
  const base = "http://127.0.0.1:3000";
  const html = await (await fetch(base + "/")).text();
  // assets referenciados por el HTML de /
  const refs = [...new Set([...html.matchAll(/(?:src|href)="(\/[^"]+\.(?:svg|png|jpe?g|webp|css|js|woff2?|ico))"/g)]
    .map(m => m[1]))];
  console.log("referenciados=" + refs.length);
  if (refs.length === 0) { console.log("  CERO: la sonda esta MUDA, no es un sitio sin assets"); return; }
  let pedidos = 0, correctos = 0; const malos = [];
  const fs = require("fs"), path = require("path");
  for (const r of refs) {
    let res;
    try { res = await fetch(base + r); pedidos++; } catch { malos.push(r + " (no responde)"); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    // el fichero de origen, dentro de la imagen
    const cand = [ "/app/apps/web/public" + r, "/app/apps/web/.next/static" + r.replace(/^\/_next\/static/, "") ];
    const f = cand.find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } });
    if (!f) { malos.push(r + " status=" + res.status + " (sin fichero de origen que comparar)"); continue; }
    const esperado = fs.statSync(f).size;
    if (res.status === 200 && buf.length === esperado) correctos++;
    else malos.push(r + " status=" + res.status + " servido=" + buf.length + " origen=" + esperado);
  }
  console.log("pedidos=" + pedidos);
  console.log("con_bytes_correctos=" + correctos);
  if (malos.length) { console.log("DISCREPANCIAS (" + malos.length + "):"); malos.slice(0,15).forEach(m => console.log("  " + m)); }
})();
'
REMOTO
echo
echo "############ FIN P3 ############"
