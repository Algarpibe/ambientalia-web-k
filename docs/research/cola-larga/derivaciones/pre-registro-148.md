# PRE-REGISTRO · 148.ª ESCALÓN 1 — la entrega de una imagen ya construida

**Commiteado ANTES de medir.** Lo que se escriba después se lee contra esto, no
contra el recuerdo de lo que se esperaba.

Terreno del que parten (todo en `paso0-148.log`, commit `a6176eb`): VPS de 2
núcleos y 4 738 MB disponibles, 78 GB libres, swarm de **1 nodo** que ya corre
**13 servicios con imágenes locales**; **cero** credenciales de registro; API del
panel en **401**.

---

## DECISIÓN PREVIA · qué imagen y por qué camino

**La imagen es `ai-website-cloner:145-publicfix`, NO la `144-fix` que el encargo
nombra.** Medido en el PASO 0: `144-fix` deja `public/` en `/app/public` y el
servidor lo busca en `/app/apps/web/public` — que es literalmente §regla 61, el
defecto que deja **todos** los assets en 404. Llevar la que el encargo nombra
haría que **P3 fallara por construcción**, y el fallo no sería del despliegue.

Precio medido de esa elección: **3.4 GB frente a 2.02**, porque el arreglo es un
`RUN mv` que cruza capas y copia los 699 MB de `public/` enteros.

**El camino es `save` → fichero → `scp` → `load`, NO la tubería de un solo paso.**
Y la razón es el propio fallo que se está sorteando:

> §regla 66 — *un origen que no declara tamaño sirve un stream que no puede
> avisar de su propio truncamiento*. La tubería `docker save | ssh 'docker load'`
> tiene exactamente esa forma, y **es la forma que mató el despliegue del
> propietario** (`curl: (23)` + `gzip: unexpected end of file`, `paso0-148.log`
> §3). Con fichero intermedio la completitud se comprueba **desde el formato**
> (`gzip -t`) y **desde el contenido** (`sha256sum` en los dos lados), que es lo
> que la regla manda cuando el protocolo no puede.

Coste aceptado: un fichero temporal de ~2 GiB en el host (hay 535 GB libres) y
una pasada más de disco. **El host no tiene `rsync`** (derivado), así que la
transferencia es `scp` y **no es reanudable**: si se corta, se repite entera.

---

## P1 · CUÁNTO TRANSFIERE Y CUÁNTO TARDA

### P1a · bytes transferidos — **predicción firme**

> **El `.tar.gz` medirá entre 1.4 y 2.2 GiB**, punto central **~1.7 GiB**.

Razonamiento, con el ratio por componente y no uno global (§regla 63 — *el ratio
de compresión no es uniforme, así que los dos repartos no se parecen*):

| componente | crudo | ratio esperado | comprimido |
|---|---|---|---|
| `public/` **×2** (original + la capa `mv`) | ~1 398 MB | **~1.02×** — son webp/jpg, ya comprimidos | ~1 370 MB |
| `.next/standalone` | 257 MB | ~3× (JS) | ~86 MB |
| runtime node | 150 MB | ~2.5× | ~60 MB |
| base debian | 85 MB | ~2.5× | ~34 MB |

El `1.02×` no es una estimación de manual: **es lo que la 147.ª midió** sobre
`public/` y `media-corpus` de este mismo repo. Y es lo que hace que la
predicción sea estrecha por abajo: **el 80 % de esta imagen es incompresible**,
así que comprimir ayuda mucho menos de lo que un ratio global sugeriría.

**Refutada si sale fuera de [1.4, 2.2] GiB.**

### P1b · tiempo — **predicción CONDICIONADA, y se declara por qué**

§regla 54 — *una predicción de magnitud se escribe con el ESTADO en el que se
afirma*. Aquí el estado que falta es **el ancho de subida del portátil**, que
**no está medido en ningún sitio del repo**: lo único medido es la **bajada del
VPS** (la 147.ª: 32.5 MiB/s clonando de GitHub), y **subida y bajada no son la
misma magnitud ni el mismo enlace**.

Así que el tiempo se predice **con su fórmula, no con un número**:

> **t_total ≈ t_empaquetado + (bytes / ancho_de_subida) + t_load**

| tramo | predicción |
|---|---|
| `docker save \| gzip` en el host | **3–10 min** (CPU del portátil, ~1.7 GiB de salida) |
| `scp` | **bytes / subida** — a 10 Mbps ≈ 23 min · a 50 ≈ 4.6 min · a 100 ≈ 2.3 min |
| `docker load` en el VPS | **1–4 min** (descompresión + escritura de capas, 2 núcleos) |

**Lo que se refuta aquí no es el total: es la FÓRMULA.** Queda refutada si el
tiempo observado no cae en `±50 %` de lo que la fórmula predice **una vez medido
el ancho de subida real**. El ancho de subida se mide en el ESCALÓN 2 y **se
publica**, porque es el dato que falta para que esta predicción sea evaluable.

---

## P2 · ¿EL BUILD LOCAL TOCA ALGUNA VEZ EL VPS?

> ## **NO.**

**Por qué, mecánicamente:** en el modelo B el `next build` de las 429 rutas corre
**dentro del `docker build` en el host**, y su salida —`.next/standalone`,
`.next/static`, `public/`— queda **congelada en capas**. Lo único que cruza la
red es el resultado. El VPS recibe bytes y hace `docker load`, que es
**descomprimir y escribir capas**: I/O de disco y `gzip`, no compilación. No hay
`node_modules` que resolver, no hay `tsc`, no hay webpack, no hay Postgres de
build que consultar.

**Y ése es exactamente el invariante que protege producción**, así que no se
afirma: se mide, con las dos polaridades (§regla 28d).

| testigo | qué exige | qué separa |
|---|---|---|
| **negativo** — `ps` en el VPS durante toda la entrega | **0** procesos `next`/`webpack`/`tsc`/`npm run build` | que no haya build |
| **positivo** — `ps` en el mismo muestreo | **≥1** proceso de `docker load`/`gzip`/`dockerd` trabajando | **que la sonda no esté muda**: si no ve ni lo que SÍ está pasando, su 0 no vale |
| **carga** — `load average` del VPS | **< 2.00** sostenido (son 2 núcleos) | que no compita con producción |

**Sin el testigo positivo, el `0` del negativo es §sondas 4** — no encontrar nada
y no mirar nada dan la misma salida.

Y una comprobación más, que es la que de verdad contesta la pregunta del
encargo: **`prerender-manifest.json` está DENTRO de la imagen** (derivado en el
PASO 0: 429 rutas), o sea que las páginas ya están construidas antes de que el
VPS vea un solo byte. Si el VPS tuviera que construir, ese fichero no existiría
todavía.

---

## P3 · ¿SIRVE LAS RUTAS Y CARGAN LOS ASSETS?

### P3a · rutas

> **Una muestra de rutas del manifiesto responde 200. Predicción: 20 de 20.**

El manifiesto de la imagen declara **429 rutas** (derivado). La muestra se toma
determinista —la primera, la última y 18 repartidas— y se declara como muestra:
**esto NO afirma nada de las 409 no pedidas** (§regla 14: una limitación sin su
cardinal se lee como nota al pie).

### P3b · assets — **y aquí el 200 NO es el criterio**

§regla 61 es explícita: *«no basta con el 200: una página de error también lo es.
Lo que cierra es que los BYTES coincidan»*.

> **El testigo es `/images/logos/kunak-logo.svg`, y tiene que devolver
> EXACTAMENTE 6 037 bytes** — el tamaño que el fichero mide dentro de la imagen,
> derivado en el PASO 0 y el mismo número que §regla 61 registra.

**Y va con su separadora, que cuesta cero red porque se corre en el host:** la
misma petición contra `144-fix` levantada localmente tiene que dar **algo
distinto de 6 037** (404 o página de error). Si las dos imágenes dieran lo mismo,
el testigo **no separa** y P3b no habría probado nada (§*un modelo se elige por
lo que lo SEPARA, no por lo que acierta*).

| imagen | predicción para `kunak-logo.svg` |
|---|---|
| `145-publicfix` (la que se lleva) | **200 · 6 037 bytes** |
| `144-fix` (separadora, local) | **≠ 6 037** — es el defecto de §regla 61 |

### P3c · el cardinal de assets, no un testigo suelto

Un solo asset bueno no prueba que carguen los assets. Así que además:

> **De los assets referenciados por el HTML de `/`, se piden todos y se publican
> tres cardinales: referenciados · pedidos · con los bytes correctos.** Predicción:
> **los tres iguales**, y ninguno cero.

Un cero en `referenciados` sería la sonda muda, no un sitio sin assets.

---

## LO QUE ESTE ESCALÓN **NO** VA A TOCAR

Declarado antes de empezar, para que no sea una excusa después:

1. **`web.ambientalia.cloud`** — lo sirve producción (200, 144 327 bytes,
   `<title>Inicio | Ambientalia</title>`). No se le toca el router, no se le
   corrige la barra al del clon, no se cambia prioridad. La verificación va **por
   la red interna**;
2. **ninguno de los 25 servicios corriendo** — ni reinicio, ni parada, ni cambio
   de variables. Si algo lo exigiera, se para y se reporta;
3. **la definición `web` de Easypanel y su log** — son la evidencia del fallo
   (§regla 5: la corrida que verifica un arreglo no pisa la que lo diagnosticó);
4. **Postgres**: el clon lleva **el suyo propio**, no uno de los 6 existentes.
   Compartir una base con producción no es una optimización, es un acoplamiento
   — y el clon corre migraciones.
