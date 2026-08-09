# TRASPASO DEL CMS — manual para quien edita y quien opera

> **F2-5 (2026-08-08).** Este documento es el entregable de traspaso de la
> Fase 2: qué es cada colección, qué campo es qué, **qué NO tocar y por qué**,
> y las notas de operación que hasta hoy vivían dispersas. Está escrito para
> quien va a editar contenido y para quien va a desplegar — no para quien
> programó. Lo técnico de método vive en `CLAUDE.md`; el modelo y sus
> decisiones, en `ESQUEMA-CMS.md`; el estado de la fase, en `PLAN-FASE-2.md`.

---

## 1 · Qué es esto

Dos aplicaciones sobre **una** base de datos Postgres:

| app | qué hace | puerto |
|---|---|---|
| `apps/web` | **el sitio** — HTML estático generado en build; no lee la DB al servir (salvo la vista previa) | 3000 |
| `apps/cms` | **el admin** (Payload) — donde se edita el contenido | 3001 |

**Publicar ES reconstruir** (decisión CMS-0c): guardar un contenido publicado
dispara una reconstrucción del sitio; no hay regeneración por página. El sitio
servido es siempre un build completo y verificado.

## 2 · Cuentas y roles

Dos roles, firmados por el propietario:

| rol | puede | no puede |
|---|---|---|
| **Admin** | todo: contenido, publicación, usuarios, registro del sistema | — |
| **Editor** | contenido y publicación | usuarios, configuración, registro `slugs` |

- **El PRIMER usuario de una DB vacía entra por el formulario «Crear el primer
  usuario» — elígele rol `Admin`.** El defecto del campo es `editor` (a quien
  olvide elegir le falta poder, no le sobra), así que hay que cambiarlo a mano
  esa primera vez.
- Un editor puede cambiar su nombre y su clave; **su rol solo lo cambia un
  admin** — el intento falla con mensaje, no en silencio.
- El menú del editor no muestra el grupo *Sistema*. Eso es cosmética; la
  restricción real es de acceso y está medida (`npm run qa:roles`, 8
  invariantes con su test en negativo).

## 3 · Las colecciones, de un vistazo

Grupos tal como aparecen en el menú del admin:

### Páginas
| colección | qué es |
|---|---|
| `sectores` | las páginas de `/sectores/*` de arquetipo SECTOR (4 vivas). El cuerpo es una lista de bloques; cada bloque lleva sus campos de presentación (`flujo`, `variante`, `anchoPct`) **con defecto** — vacío = el defecto, y eso es una decisión, no un olvido |
| `monograficos` | misma ruta, otro arquetipo (EDAR · petróleo y gas) |

### Catálogo
| colección | qué es |
|---|---|
| `productos` | el CPT `solutions` del original: 9 con lado medido de 24. `slug` + `padre` componen su URL; **el enlace sale local si el clon sirve esa página y al original si no — automático, no es un campo** |

### Contenido
| colección | qué es |
|---|---|
| `casos` | casos de éxito (`/casos-de-exito/*` · `/case-studies/*`) |
| `faqs` | preguntas frecuentes (`/faqs/*`) |
| `entradas-blog` | el blog — plano de raíz `/<slug>` |
| `terminos-kunakpedia` | términos del glosario — mismo plano de raíz |
| `documentos-cientificos` | recursos científicos (`/recursos/…`), con su `prefijo` |
| `articulos-kb` | centro de ayuda (biblioteca pendiente de construir: el dato existe, la plantilla no) |

El campo `cuerpo` de estas familias es **HTML del corpus original** (editor de
código, no visual). Admite las 43 etiquetas censadas en las 209 páginas;
`<script>` está prohibido y el propio campo lo dice debajo del editor.

### Taxonomías
`categorias` · `etiquetas` · `categorias-recursos` · `categorias-cientificas` ·
`taxonomia-sectores`. Clasifican; **no** tienen estado de publicación a
propósito — una categoría en borrador apuntada por una entrada publicada sería
una relación rota.

### Media
`media` — biblioteca de imágenes y PDF, con variantes generadas. `rutaOrigen`
conserva la URL del original: es la llave con la que el render reconstruye el
`src` exacto. **No la edites.**

### Sistema (solo lo ve el admin)
| colección | qué es |
|---|---|
| `usuarios` | cuentas y roles |
| `slugs` | **registro derivado** del plano de URLs (§4 del ESQUEMA): lo escriben los hooks al guardar contenido y garantiza que dos familias no reclamen la misma URL. **Nadie escribe aquí a mano, ni el admin** — el acceso lo impide; editarlo lo desincronizaría |

## 4 · Publicar: estado, hora programada, y qué se ve durante el rebuild

- **`Estado`**: solo «Publicado» sale en el sitio. Un borrador se ve en
  `/vista-previa/<slug>?token=…` con la credencial (`PREVIEW_SECRETO`).
- **`Publicar En`**: si está en Borrador y esa hora pasa, el cron lo publica y
  reconstruye. Vacío = manual.
- **Al guardar un publicado**, el admin avisa al publicador y este reconstruye
  y **promociona solo si el build sale bien**. Números medidos: un rebuild del
  sitio actual (31 rutas) tarda **~36–40 s**; la estimación A-SP13 para el
  sitio completo (~220 rutas) es **~91 s**.
- **Mientras reconstruye, el sitio anterior sigue servido entero** — no hay
  ventana sin sitio (el build se hace fuera y se promociona al final).
- **Si el build FALLA, el sitio NO cambia**: se queda el anterior, y
  `GET /estado` del publicador conserva el motivo y las últimas líneas del
  fallo hasta que un build termine bien. Ahí es donde se mira por qué algo
  «no se publicó».
- Guardar varias veces seguidas no encola builds infinitos: los avisos se
  **coalescen** (un build en marcha + como mucho uno pendiente).

### ✅ El caso que un editor podía pisar — CERRADO el 2026-08-08

**Ya NO hace falta ponerle etiqueta a una entrada para publicarla.** Hasta esa
fecha, una entrada de blog publicada **sin ninguna etiqueta** tumbaba el build
(§F2-5-ESCALON-ETIQUETAS). Está arreglado, y se arregló **midiendo el original
antes de decidir**: de las 149 entradas capturadas de kunakair.com, **8 no
tienen etiquetas**, y ahí el original **no pinta el bloque de etiquetas** — ni
vacío ni con el rótulo suelto. El clon hace exactamente eso.

O sea que **las etiquetas son opcionales de verdad**, como en el original: si no
le pones ninguna, la línea de «Etiquetas:» simplemente no aparece. La categoría
sí sigue saliendo (las 149 del original tienen al menos una).

Lo comprueba en cada corrida `npm run qa:f25-final`, que da de alta una entrada
sin etiquetas desde una cuenta de editor y verifica que el sitio se reconstruye
con ella dentro.

## 5 · QUÉ NO TOCAR Y POR QUÉ

Este clon replica el original **al píxel, defectos incluidos**. Lo que sigue
parece un error y NO lo es — «arreglarlo» rompería la fidelidad medida:

| qué verás | por qué se queda |
|---|---|
| **Erratas en los textos** (p. ej. en la página de software) | regla 1 del proyecto: los textos van *verbatim*, erratas incluidas. El texto es del original; si el original lo corrige, se corrige aquí **desde el original**, no de memoria |
| **`headingColor` `#0c71c3` en Industria y EDAR** (los demás sectores llevan `#0075c9`, el azul de marca) | es un **error del original replicado a propósito**: esas dos páginas usan el azul de serie de Divi. El campo tiene defecto `#0075c9` y solo se guarda cuando difiere |
| **Imágenes cuya URL da 404 también en el original** (§M-ORIGEN404) | el original SIRVE esa referencia rota; el dato la conserva. Quitar el `<img>` sería una desviación irreversible: el día que repongan el fichero, un dato que conserva la referencia se arregla solo |
| **Campos vacíos que coinciden con su defecto** (`flujo`, `variante`, `anchoPct`, `tipo`, `headingColor`, `tituloMiga`…) | vacío = el defecto **explícito y medido**. Rellenarlos «por completar» cambia la página |
| **El registro `slugs`** | estado derivado — lo mantienen los hooks (§3 arriba) |
| **`rutaOrigen` en media** | es la identidad del fichero frente al original |
| **Filas con marca `qa-f25-…`**, si ves alguna | son de una corrida de `qa:f25-final` que no llegó a limpiar. Se pueden borrar sin pensarlo: no son contenido |

## 6 · Operación y despliegue

**Variables de entorno** (sin ninguna de las obligatorias, el proceso
correspondiente **no arranca** — es la dirección segura, no un descuido):

| variable | quién la necesita | qué pasa sin ella |
|---|---|---|
| `DATABASE_URI` | admin, build del sitio, publicador | no arranca |
| `PAYLOAD_SECRET` | admin, build, publicador | no arranca |
| `PUBLICAR_SECRETO` | publicador (y el admin para avisar) | el publicador no arranca; el admin avisa con 401 y lo grita |
| `PUBLICAR_URL` | el admin | **el webhook es opt-in**: sin ella, guardar NO reconstruye (así el seed y las sondas no disparan builds). En producción tiene que estar |
| `PREVIEW_SECRETO` | el sitio (ruta `/vista-previa`) | **la preview revienta** — no está en ningún `.env` del repo a propósito: la pone quien despliega |
| `PUBLICAR_SERVIDOR=1` | publicador | si no la pones, la promoción exige parar el servidor web por fuera |

**Dependencias de build:**

- **Postgres (`kunak-cms-pg`) es dependencia de BUILD del sitio**: `next build`
  lee el contenido por Local API. Con la DB parada el build falla — y un build
  fallido **borra su propio directorio**, por eso el publicador construye en un
  directorio aparte y promociona al final. No construyas «en sitio» a mano en
  producción.
- El paquete `@kunak/cms-config` es el esquema compartido; **las migraciones
  viven ahí** y el esquema de la DB solo cambia por migración
  (`npx payload migrate` desde `apps/cms`), nunca por sync implícito.

**El cron de publicación programada:** el sistema llama a `POST /cron` del
publicador (con el `Bearer` de `PUBLICAR_SECRETO`); este publica lo vencido
(`Publicar En` ≤ ahora) y reconstruye. Sin cron del sistema no hay salidas
programadas — el servidor no mira el reloj solo.

**⚠ El `Dockerfile` está SIN VERIFICAR**: nadie ha construido ni corrido esa
imagen todavía. El despliegue verificado hasta hoy es el de arriba (Node +
Postgres en contenedor + publicador como proceso). Verificarlo es una tanda
pendiente declarada.

## 7 · Dónde está cada cosa

| pregunta | documento |
|---|---|
| ¿por qué el modelo es así? | `docs/ESQUEMA-CMS.md` (decisiones CMS-n, con medidas) |
| ¿en qué estado está la fase? | `docs/PLAN-FASE-2.md` |
| ¿qué defectos/preguntas siguen abiertos? | `docs/PENDIENTES-QA.md` |
| ¿cómo se mide y verifica? | `CLAUDE.md` + `scripts/qa/README.md` |
| ¿cómo arranca un agente nuevo? | `docs/TRASPASO-AGENTE.md` y `docs/HANDOFF.md` |
