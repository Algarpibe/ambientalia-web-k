# PRE-REGISTRO · 145.ª ESCALÓN 3 — ¿desaparece solo el problema de los assets con el modelo B?

**Escrito el 2026-09-04, ANTES de medirlo.** El encargo lo pide así, y la razón
es §regla 8b: una predicción escrita después de ver el resultado no es una
predicción.

## La pregunta del encargo, y por qué NO es una sola pregunta

> *«Fichaste los 2.02 GB con `public/` en 699 MB, y planteaste "¿viajan los
> assets dentro?". Pero **CMS-0b (2026-07-30) ya decidió que la media vive en un
> VOLUMEN PERSISTENTE del VPS**. Deriva si tu pregunta 2 es una decisión nueva o
> es CMS-0b sin aplicar.»*

**Derivado del repo: son DOS canales distintos con dos respuestas distintas, y
sólo uno es CMS-0b.** Confundirlos es §*dos lecturas del mismo conjunto con el
mismo cardinal* con el objeto puesto en la palabra «assets».

| canal | qué es | tamaño **medido** | ¿en la imagen hoy? | veredicto |
|---|---|---|---|---|
| `media/` | **uploads del CMS** — lo que un editor sube por el admin de Payload | **313 M** | **NO** — `.dockerignore` lo excluye (`media`, `media-corpus`, `corpus`) | **es CMS-0b, y NO se vuelve a decidir: se aplica y se cita** |
| `apps/web/public/` | **assets del CLON** — las imágenes y fuentes del original, descargadas por `scripts/download-assets.mjs` | **668 M** (667 M en `images/`) | **SÍ** — `Dockerfile:116`, `COPY … /apps/web/public ./public` | **NO es CMS-0b**: es una pregunta abierta y distinta |

**Y el mecanismo de CMS-0b ya está escrito en el código**, no hay que
inventarlo. `packages/cms-config/src/colecciones/media.ts:33`:

```
export const DIR_MEDIA = process.env.MEDIA_DIR ?? path.resolve(dirname, "../../../../media");
```

con su propio comentario diciendo para qué existe: *«se deja sobreescribir por
`MEDIA_DIR`, que es por donde entrará el **volumen persistente de CMS-0b**
cuando F2-4 despliegue. No hay defecto silencioso: si `MEDIA_DIR` no está, la
ruta anclada es una decisión, no un accidente del `cwd`»*.

> **Así que la pregunta 2 es, para `media/`, CMS-0b SIN APLICAR — y aplicarla es
> poner `MEDIA_DIR` en el destino, no tomar una decisión nueva.**

## LA PREDICCIÓN, escrita antes de medir

El encargo la enuncia así: *«con el modelo B, ¿desaparece el problema solo? Si el
build vive en un volumen, `public/` deja de hornearse en la imagen»*.

> ### ❌ **PREDIGO QUE NO DESAPARECE SOLO.**

**Y la razón se deriva del `Dockerfile`, no se supone: son `COPY` INDEPENDIENTES,
y B sólo toca uno.**

| línea | qué hornea | ¿lo toca el volumen de B? |
|---|---|---|
| `Dockerfile:116` | `apps/web/public` → `/app/public` | **NO** — B monta `.next`, no `public` |
| `Dockerfile:124` | `.next/standalone` → `/app` | sí (queda tapado por el volumen) |
| `Dockerfile:125` | `.next/static` → `/app/apps/web/.next/static` | sí (idem) |

**Predicción operativa, falsable y con su número:** un contenedor que monte
**sólo** `.next` como volumen seguirá sirviendo `public/` **desde la capa
horneada**, así que la imagen seguirá pesando ≈2.02 GB y los 668 M seguirán
dentro. El problema **no desaparece solo**: requiere un segundo montaje
explícito, que es una decisión aparte de CMS-10.

**Cómo se falsaría:** si tras montar sólo `.next` el contenedor **no** sirviera
`public/` —un 404 en un asset conocido—, la predicción sería falsa y `public`
estaría viniendo del volumen. **El testigo es un fichero concreto de
`public/images/`**, pedido al contenedor por HTTP.

## Lo que esto NO decide

Que `public/` deba o no salir de la imagen **no lo decide esta tanda**: es la
pregunta que la 144.ª ya fichó (*«la pregunta de B3 no es cómo adelgazar la
imagen sino si esos assets deben viajar dentro de ella»*). Lo que esta tanda
aporta es **separar los dos canales con su cardinal** y decir cuál ya está
decidido.

---

## RESULTADO — medido el mismo día, después de escribir lo de arriba

### ✅ La predicción se CONFIRMA: el problema NO desaparece solo

**Sobre el artefacto, no sobre el `Dockerfile`:** un `find` dentro de la imagen
`ai-website-cloner:144-fix` encuentra `/app/public/images` con sus 4
subdirectorios (`logos`, `other`, `theme`, …). El volumen de B monta **sólo**
`.next`, así que `public/` **sigue viniendo de la capa horneada** y la imagen
sigue pesando 2.02 GB. Hace falta un segundo montaje explícito, que es una
decisión aparte de `CMS-10`.

### ⚠⚠ Y EL TESTIGO QUE EL PRE-REGISTRO FIJÓ ENCONTRÓ OTRA COSA — UN CUARTO DEFECTO DEL `Dockerfile`

El pre-registro decía: *«el testigo es un fichero concreto de `public/images/`,
pedido al contenedor por HTTP»*. Pedido:

| | resultado |
|---|---|
| `GET /images/logos/kunak-logo.svg` | **HTTP 404**, 10 796 bytes (o sea la página de error, no el SVG) |
| el fichero **en la imagen** | **existe**: `/app/public/images/logos/kunak-logo.svg`, 6 037 bytes |

**Un 404 sobre un fichero que está en la imagen no es un asset que falte: es una
ruta que no cuadra.** Derivado:

- `public/` está en **`/app/public`** — donde `Dockerfile:116` lo pone;
- `server.js` hace **`process.chdir(__dirname)`** = `/app/apps/web`, y ahí Next
  busca `./public` → **`/app/apps/web/public`**, que **no existe**.

**Control positivo, y cierra el diagnóstico al bit:** copiando `public` a
`/app/apps/web/public` dentro del mismo contenedor, el mismo `GET` pasa a
**HTTP 200 con 6 037 bytes** — el tamaño exacto del fichero.

> **Es el TERCER sitio donde este `Dockerfile` se equivoca en lo mismo:** en un
> monorepo, `output: standalone` **preserva la ruta del paquete**, y las rutas de
> `COPY` están escritas para un proyecto de una sola app. La 144.ª ya lo pagó dos
> veces (`server.js` en la raíz, y los `.env` anidados del `.dockerignore`).

**Y por qué no lo vio la 144.ª aunque comparó el contenedor contra la referencia
local:** su comparador (P2) mira **HTML normalizado**, y el HTML es **idéntico**
—las etiquetas `<img>` están, con su `src` correcto—. Lo que falla es lo que hay
**detrás** del `src`. Es §*la causa común: el NIVEL al que se mide*, con el HTML
absorbiendo que ningún asset cargue: **la página responde 200 y se ve rota**, que
es exactamente la salida plausible-y-falsa que este repo persigue.

**Arreglado** en `Dockerfile:116` → destino `./apps/web/public`.
