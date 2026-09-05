#!/usr/bin/env bash
# ESCALÓN 2 de la 148.ª — la entrega de la imagen ya construida.
#
# Camino declarado en el pre-registro (`pre-registro-148.md`, commit 63e1a49):
#   save -> fichero -> scp -> load
# NO la tubería de un paso: ésa tiene la forma de §regla 66 y es la que mató el
# despliegue del propietario. Con fichero intermedio la completitud se comprueba
# desde el FORMATO (gzip -t) y desde el CONTENIDO (sha256 en los dos lados).
#
#   bash docs/research/cola-larga/derivaciones/entrega-148.sh > entrega-148.log 2>&1; echo "EXIT=$?"
#
# §regla 62: el veredicto se lee EN EL LOG.

set -u
export MSYS_NO_PATHCONV=1

VPS=kunak-vps
IMG=ai-website-cloner:145-publicfix
SCRATCH="C:/Users/algar/AppData/Local/Temp/claude/C--Users-algar-OneDrive-Documentos-Ambientalia-2026-K-kunak-web-clone/48eeb6af-c747-4706-a4dc-5fc9e79c23a1/scratchpad"
TAR="$SCRATCH/kunak-145-publicfix.tar.gz"
REMOTO=/root/kunak-145-publicfix.tar.gz

echo "############ ESCALÓN 2 · ENTREGA · $(date -u +%Y-%m-%dT%H:%M:%SZ) ############"
echo "imagen: $IMG"
echo

# ---------------------------------------------------------------- P2, muestreo
# El muestreo de procesos del VPS corre EN PARALELO a la entrega, no después:
# una foto tomada al final no puede ver lo que pasó durante.
muestrea_vps () {
  local etiqueta="$1"
  ssh $VPS "bash -s" <<'REMOTO_PS' 2>/dev/null | sed "s/^/  [$etiqueta] /"
echo -n "load=";  uptime | sed 's/.*load average: //'
echo -n "build_procs=";  ps -eo comm,args --no-headers 2>/dev/null \
  | grep -E 'next build|webpack|tsc |npm run build|nixpacks' | grep -cv grep
echo -n "load_procs=";   ps -eo comm,args --no-headers 2>/dev/null \
  | grep -E 'docker load|gzip|dockerd|containerd' | grep -cv grep
REMOTO_PS
}

echo "======== 0 · ESTADO DE PARTIDA (P2: el control ANTES) ========"
muestrea_vps "antes"
echo

echo "======== 1 · EMPAQUETAR (docker save | gzip) ========"
rm -f "$TAR"
T0=$(date +%s)
docker save "$IMG" | gzip -6 > "$TAR"
RC=${PIPESTATUS[0]}
T1=$(date +%s)
echo "exit_docker_save=$RC"
echo "t_empaquetado_s=$((T1-T0))"
BYTES=$(stat -c %s "$TAR" 2>/dev/null || stat -f %z "$TAR")
echo "bytes=$BYTES"
echo "MiB=$(awk -v b="$BYTES" 'BEGIN{printf "%.2f", b/1048576}')"
echo "GiB=$(awk -v b="$BYTES" 'BEGIN{printf "%.3f", b/1073741824}')"
echo
echo "-- completitud POR EL FORMATO (§regla 66) --"
gzip -t "$TAR" && echo "gzip -t: OK" || echo "gzip -t: FALLA"
echo "-- huella del contenido --"
SHA_LOCAL=$(sha256sum "$TAR" | cut -d' ' -f1)
echo "sha256_local=$SHA_LOCAL"
echo

echo "======== 2 · TRANSFERIR (scp) ========"
muestrea_vps "pre-scp"
T2=$(date +%s)
scp -q "$TAR" "$VPS:$REMOTO"
RC_SCP=$?
T3=$(date +%s)
DT=$((T3-T2)); [ "$DT" -eq 0 ] && DT=1
echo "exit_scp=$RC_SCP"
echo "t_scp_s=$DT"
echo "ancho_subida_MiBps=$(awk -v b="$BYTES" -v t="$DT" 'BEGIN{printf "%.2f", b/1048576/t}')"
echo "ancho_subida_Mbps=$(awk -v b="$BYTES" -v t="$DT" 'BEGIN{printf "%.1f", b*8/1000000/t}')"
echo

echo "======== 3 · VERIFICAR EN EL DESTINO (los dos canales) ========"
ssh $VPS "bash -s" <<REMOTO_VER
echo -n "bytes_remoto="; stat -c %s $REMOTO
echo -n "gzip_t="; gzip -t $REMOTO && echo OK || echo FALLA
echo -n "sha256_remoto="; sha256sum $REMOTO | cut -d' ' -f1
REMOTO_VER
echo "sha256_local  =$SHA_LOCAL   <- para comparar a la vista (§sondas 1: los dos lados)"
echo

echo "======== 4 · CARGAR (docker load) ========"
muestrea_vps "pre-load"
T4=$(date +%s)
ssh $VPS "docker load -i $REMOTO" 2>&1 | tail -3
T5=$(date +%s)
echo "t_load_s=$((T5-T4))"
muestrea_vps "post-load"
echo
echo "-- ¿está la imagen en el VPS? --"
ssh $VPS "docker images --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}' | grep ai-website-cloner || echo 'NO ESTÁ'"
echo

echo "######## RESUMEN ########"
echo "t_empaquetado_s=$((T1-T0))  t_scp_s=$DT  t_load_s=$((T5-T4))  t_total_s=$((T5-T0))"
echo "############ FIN ENTREGA ############"
