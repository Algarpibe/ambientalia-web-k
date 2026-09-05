#!/usr/bin/env bash
# ESCALÓN 2 de la 147.ª — LOS CUATRO CAMINOS DE ENTREGA, MEDIDOS EN EL VPS.
#
# Cada camino con su TAMAÑO TRANSFERIDO, su TIEMPO y su EXIT. Todo en /tmp y
# se limpia al terminar: el VPS es de producción del propietario.
#
# Tres guardas que este repo ya pagó y que aquí son obligatorias:
#
#   · §regla 11/62 — en `A | B` el exit es el de B. La TUBERÍA se mide con
#     ${PIPESTATUS[@]} para tener los DOS, porque el de curl es justo el que
#     dice si la transferencia se cortó y el de tar el que la tapa;
#   · §regla 61 — un exit 0 no dice qué hay detrás. Cada camino cuenta sus
#     FICHEROS y se compara contra el denominador que se le pasa;
#   · §regla 28d — el `gzip -t` va con TESTIGO POR LAS DOS POLARIDADES: tiene
#     que pasar sobre el íntegro y FALLAR sobre una copia truncada a mano.
#
# NO se ejecuta con `set -e`: aquí un fallo es el DATO, no un motivo para
# abortar. Cada exit se captura y se publica.
#
# Uso:  bash caminos-147.sh <denominador-ficheros> <sha-esperado>

BASE=/tmp/entrega-147
DENOM="${1:?falta el denominador de ficheros}"
SHA_ESPERADO="${2:?falta el sha de HEAD esperado}"
REPO_TAR="https://codeload.github.com/Algarpibe/ambientalia-web-k/tar.gz/refs/heads/main"
REPO_GIT="https://github.com/Algarpibe/ambientalia-web-k.git"

rm -rf "$BASE"
mkdir -p "$BASE"
cd "$BASE" || exit 99

echo "=== ENTORNO ==="
echo "fecha_utc=$(date -u +%FT%TZ)"
echo "denominador_ficheros=$DENOM"
echo "sha_esperado=$SHA_ESPERADO"
echo "disco_libre_kb_inicio=$(df -k /tmp | awk 'NR==2{print $4}')"

# El ETag identifica QUÉ artefacto se está midiendo. Sin él, una corrida
# posterior a un push mide otra cosa y no hay forma de saberlo (§regla 45).
echo "etag_al_empezar=$(curl -sI "$REPO_TAR" | awk 'tolower($1)=="etag:"{print $2}' | tr -d '\r')"

########################################################################
echo
echo "=== CAMINO 1 · TUBERIA (control positivo) ==="
mkdir -p "$BASE/c1"
T0=$(date +%s.%N)
# El exit de una tuberia es el del ULTIMO comando. Se capturan los DOS.
curl -sS --fail-with-body "$REPO_TAR" 2>"$BASE/c1-curl.err" | tar -xz -C "$BASE/c1" 2>"$BASE/c1-tar.err"
ESTADOS=("${PIPESTATUS[@]}")
T1=$(date +%s.%N)
echo "c1_exit_curl=${ESTADOS[0]}"
echo "c1_exit_tar=${ESTADOS[1]}"
echo "c1_exit_tuberia_APARENTE=${ESTADOS[1]}"
echo "c1_segundos=$(echo "$T1 - $T0" | bc)"
echo "c1_ficheros=$(find "$BASE/c1" -type f 2>/dev/null | wc -l)"
echo "c1_bytes_en_disco=$(du -sb "$BASE/c1" 2>/dev/null | cut -f1)"
echo "c1_curl_err=$(tr '\n' ' ' < "$BASE/c1-curl.err" | head -c 300)"
echo "c1_tar_err=$(tr '\n' ' ' < "$BASE/c1-tar.err" | head -c 300)"
rm -rf "$BASE/c1"

########################################################################
echo
echo "=== CAMINO 2 · SEPARADO ==="
mkdir -p "$BASE/c2"
T0=$(date +%s.%N)
curl -sS --fail-with-body -o "$BASE/t.tar.gz" \
  -w "c2_size_download=%{size_download}\nc2_speed_bps=%{speed_download}\nc2_tiempo_curl=%{time_total}\nc2_http=%{http_code}\n" \
  "$REPO_TAR" > "$BASE/c2-curl.out" 2>"$BASE/c2-curl.err"
EXIT_DESCARGA=$?
T1=$(date +%s.%N)
cat "$BASE/c2-curl.out"
echo "c2_exit_descarga=$EXIT_DESCARGA"
echo "c2_segundos_descarga=$(echo "$T1 - $T0" | bc)"
echo "c2_bytes_fichero=$(stat -c %s "$BASE/t.tar.gz" 2>/dev/null || echo 0)"

# ── La comprobación que sustituye al `content-length` que el origen NO declara.
T0=$(date +%s.%N)
gzip -t "$BASE/t.tar.gz" 2>"$BASE/c2-gzip.err"
echo "c2_gzip_t_exit=$?"
T1=$(date +%s.%N)
echo "c2_segundos_gzip_t=$(echo "$T1 - $T0" | bc)"
echo "c2_gzip_err=$(tr '\n' ' ' < "$BASE/c2-gzip.err" | head -c 200)"
echo "c2_sha256_1=$(sha256sum "$BASE/t.tar.gz" | cut -d' ' -f1)"

# ── TESTIGO POR LAS DOS POLARIDADES (§regla 28d).
# Sin el lado negativo, un `gzip -t` que pasa no distingue «está bien» de
# «no sé mirar»: hay que verlo FALLAR sobre algo que sabemos roto.
head -c 100000000 "$BASE/t.tar.gz" > "$BASE/truncado.tar.gz"
gzip -t "$BASE/truncado.tar.gz" 2>/dev/null
echo "testigo_gzip_t_sobre_TRUNCADO_exit=$?   # tiene que ser != 0"
echo "testigo_bytes_truncado=$(stat -c %s "$BASE/truncado.tar.gz")"
rm -f "$BASE/truncado.tar.gz"

# ── Extracción, ya desde disco local y sin ninguna conexión abierta.
T0=$(date +%s.%N)
tar -xzf "$BASE/t.tar.gz" -C "$BASE/c2" 2>"$BASE/c2-tar.err"
echo "c2_exit_tar=$?"
T1=$(date +%s.%N)
echo "c2_segundos_extraccion=$(echo "$T1 - $T0" | bc)"
echo "c2_ficheros=$(find "$BASE/c2" -type f 2>/dev/null | wc -l)"
echo "c2_bytes_extraido=$(du -sb "$BASE/c2" 2>/dev/null | cut -f1)"
echo "c2_tar_err=$(tr '\n' ' ' < "$BASE/c2-tar.err" | head -c 300)"
rm -rf "$BASE/c2"

# ── Segunda descarga: ¿es el artefacto REPRODUCIBLE al byte?
# Si no lo fuera, ningún hash serviría de referencia y el `etag` no
# identificaría el contenido — es una propiedad del canal, no del fichero.
T0=$(date +%s.%N)
curl -sS --fail-with-body -o "$BASE/t2.tar.gz" "$REPO_TAR" 2>"$BASE/c2b-curl.err"
echo "c2_exit_descarga_2=$?"
T1=$(date +%s.%N)
echo "c2_segundos_descarga_2=$(echo "$T1 - $T0" | bc)"
echo "c2_bytes_fichero_2=$(stat -c %s "$BASE/t2.tar.gz" 2>/dev/null || echo 0)"
echo "c2_sha256_2=$(sha256sum "$BASE/t2.tar.gz" | cut -d' ' -f1)"
rm -f "$BASE/t.tar.gz" "$BASE/t2.tar.gz"

########################################################################
echo
echo "=== CAMINO 3 · git clone COMPLETO ==="
T0=$(date +%s.%N)
GIT_TERMINAL_PROMPT=0 git clone --progress "$REPO_GIT" "$BASE/c3" >"$BASE/c3.out" 2>"$BASE/c3.err"
echo "c3_exit=$?"
T1=$(date +%s.%N)
echo "c3_segundos=$(echo "$T1 - $T0" | bc)"
echo "c3_ficheros=$(find "$BASE/c3" -type f -not -path '*/.git/*' 2>/dev/null | wc -l)"
echo "c3_bytes_pack=$(du -sb "$BASE/c3/.git/objects" 2>/dev/null | cut -f1)"
echo "c3_bytes_git_entero=$(du -sb "$BASE/c3/.git" 2>/dev/null | cut -f1)"
echo "c3_bytes_checkout=$(du -sb --exclude=.git "$BASE/c3" 2>/dev/null | cut -f1)"
echo "c3_sha=$(git -C "$BASE/c3" rev-parse HEAD 2>/dev/null)"
echo "c3_recibido_segun_git=$(grep -o 'Receiving objects: 100%[^,]*, [0-9.]* [KMG]iB' "$BASE/c3.err" | tail -1)"
rm -rf "$BASE/c3"

########################################################################
echo
echo "=== CAMINO 4 · git clone --depth 1 ==="
T0=$(date +%s.%N)
GIT_TERMINAL_PROMPT=0 git clone --depth 1 --progress "$REPO_GIT" "$BASE/c4" >"$BASE/c4.out" 2>"$BASE/c4.err"
echo "c4_exit=$?"
T1=$(date +%s.%N)
echo "c4_segundos=$(echo "$T1 - $T0" | bc)"
echo "c4_ficheros=$(find "$BASE/c4" -type f -not -path '*/.git/*' 2>/dev/null | wc -l)"
echo "c4_bytes_pack=$(du -sb "$BASE/c4/.git/objects" 2>/dev/null | cut -f1)"
echo "c4_bytes_git_entero=$(du -sb "$BASE/c4/.git" 2>/dev/null | cut -f1)"
echo "c4_bytes_checkout=$(du -sb --exclude=.git "$BASE/c4" 2>/dev/null | cut -f1)"
echo "c4_sha=$(git -C "$BASE/c4" rev-parse HEAD 2>/dev/null)"
echo "c4_recibido_segun_git=$(grep -o 'Receiving objects: 100%[^,]*, [0-9.]* [KMG]iB' "$BASE/c4.err" | tail -1)"
rm -rf "$BASE/c4"

########################################################################
echo
echo "=== CIERRE ==="
echo "etag_al_terminar=$(curl -sI "$REPO_TAR" | awk 'tolower($1)=="etag:"{print $2}' | tr -d '\r')"
echo "disco_libre_kb_fin=$(df -k /tmp | awk 'NR==2{print $4}')"
cd /tmp || exit
rm -rf "$BASE"
echo "limpieza_ok=$(test -d "$BASE" && echo NO || echo si)"
echo "FIN_DEL_GUION"
