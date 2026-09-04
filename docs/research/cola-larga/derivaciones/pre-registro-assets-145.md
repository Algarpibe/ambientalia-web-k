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
