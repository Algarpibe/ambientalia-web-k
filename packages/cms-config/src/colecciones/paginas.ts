/**
 * `paginas` — LA COLECCIÓN DE LA COLA LARGA. CMS-3 (`ESQUEMA-CMS.md` §2j),
 * decidida por el propietario en la 91.ª y escrita en la 92.ª.
 *
 * ── Su membresía, en la unidad correcta ────────────────────────────────────
 * La cola larga son **48 RUTAS**, que en unidad PÁGINA son **32**: 7 hubs de
 * KB + 6 hubs de L4 + 19 sueltas. Las otras 16 no son páginas (13 × 301 ·
 * 3 × 404) y su mapa de redirecciones es **otro mecanismo**, no un documento de
 * esta colección (`derivaciones/redirects-f33.log`).
 *
 * ── Lo que R1 y R2 permiten ────────────────────────────────────────────────
 * **R1 (cero arquetipos) se respeta porque una colección no es un arquetipo**:
 * la cola larga no estrena plantilla, estrena content type. **R2 se respeta
 * porque `MonoSeccion[]` no se toca**: la unión es propia (`bloques/paginas.ts`).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ ESTA COLECCIÓN **NO ESTÁ EN `COLECCIONES` TODAVÍA**, Y ES DELIBERADO.
 *
 * La 92.ª tenía escrito «no emitir ninguna página». Registrarla en el catálogo
 * la mete en el `payload.config`, en el push de esquema y en `qa:cms-campos`
 * —o sea, en la migración— que es la mitad irreversible. Se escribe, se
 * typechequea y **se prueba por extracción contra el corpus**; darla de alta es
 * de la tanda que emita.
 *
 * ⚠⚠ **Y HAY UN RESULTADO DE LA PRUEBA QUE HAY QUE LEER ANTES DE DARLA DE
 * ALTA:** `derivaciones/prueba-union-f33.log` dice que la unión **NO expresa 2
 * de las 32**, y no por falta de bloques — por **régimen**. Ver el bloque
 * `⚠ LO QUE LA PRUEBA DEVOLVIÓ` al final de este fichero.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { CollectionConfig } from "payload";

import { campoHtml, seoA } from "../campos/comunes.ts";
import { bloquesPagina } from "../bloques/paginas.ts";
import { registroDeSlug } from "../hooks/registro-slug.ts";

export const paginas: CollectionConfig = {
  slug: "paginas",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  hooks: registroDeSlug({ familia: "paginas" }),
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    /**
     * ⚠ **El prefijo es CAMPO, y lo dice la medida — igual que en
     * `articulos-kb` y en `/recursos/[...ruta]`.** Las 32 rutas tienen
     * profundidad de 1 a 5 segmentos (`/es/empresa/` contra
     * `/es/soporte/centro-de-ayuda/kunak-air-cloud/video-tutoriales/`), así que
     * el slug **no basta** para construir la URL y el prefijo no se puede
     * cablear en la ruta.
     */
    { name: "prefijo", type: "text" },
    seoA,
    { name: "titulo", type: "text", required: true },
    bloquesPagina,
    /**
     * ⚠⚠ **S2 · EL SEGUNDO CANAL DE CONTENIDO — decisión del propietario,
     * 2026-08-22, cierre de §2j.3b.**
     *
     * `bloques` es opcional, y por sí solo **eso no expresa nada**: un
     * documento sin bloques se emite con cabecera, pie y nada en medio. Es
     * §*un campo opcional no expresa un caso — sólo permite que falte*, que
     * salió justo de este documento.
     *
     * Este campo es lo que da sitio al contenido del **régimen `--`**: sin
     * `et_pb_pagebuilder_layout` ni `et-tb-has-body`, el tema sirve la
     * plantilla clásica de WordPress y el cuerpo vive en `entry-content` como
     * HTML. Hoy lo ejercita **1 documento de 31**
     * (`/es/politica-de-seguridad-de-la-informacion/`, 8387 caracteres,
     * `p · h2 · ul · li · b`).
     *
     * ⚠ **Y ese n = 1 se DECLARA, no se disimula** (§*un campo que ningún dato
     * ejercita es un camino de render sin estrenar*): con una sola instancia,
     * nada de lo que este campo haga está probado por variación. Lo que sí
     * está probado es que el dato **PASA la validación**, corrida y no
     * inspeccionada — `derivaciones/valida-campo-rico-f33.log`.
     *
     * **NO es un campo nuevo**: es `campoHtml`, el mismo helper y el mismo
     * `validaHtmlCorpus` que ya usan `entradas-blog`, `terminos-kunakpedia`,
     * `documentos-cientificos` y `articulos-kb`, con su contrato medido en
     * 209/209 documentos (43 etiquetas · `<script>` prohibido · 275–69 784).
     * Reusarlo es lo que impide que S2 sea «un escape elegido sin medir», que
     * es el reproche que tumbó a C2.
     *
     * **Por qué NO se tomó S3** (dejar el régimen `--` fuera y esperar a su
     * segunda instancia): S3 cambia un campo sin probar por **una ruta sin
     * emitir**, y esa ruta existe y se sirve hoy. El campo, en cambio, no
     * inventa contrato: hereda uno ya censado. Entre «un camino de render con
     * n = 1 y contrato heredado» y «una baja declarada», el propietario tomó
     * el primero — y lo que queda SIN PROBAR es la geometría, que es lo mismo
     * que queda sin probar en los otros 30.
     */
    campoHtml("cuerpoClasico"),
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠ LO QUE LA PRUEBA DEVOLVIÓ — y por qué esta colección no se da de alta hoy
 *
 * La prueba por extracción (`npm run` no: `node docs/research/cola-larga/
 * derivaciones/prueba-union-f33.mjs`) recorre las 32 capturas y pregunta si
 * cada módulo de contenido cae en un bloque de la unión. Resultado POR RÉGIMEN,
 * que es como hay que leerlo porque el reparto no es uniforme:
 *
 * | régimen | n | expresadas | NO expresadas |
 * |---|---|---|---|
 * | HÍBRIDO (`BT`) | 8 | **8** | 0 |
 * | BUILDER puro (`B-`) | 22 | **22** | 0 |
 * | PLANTILLADO (`-T`) | 1 | 0 | **1** |
 * | **SIN MARCADOR (`--`)** | **1** | 0 | **1** |
 *
 * ⚠⚠ **DOS COSAS QUE EL PLAN NO DECÍA, y las dos salieron de contar por
 * régimen en vez de en total:**
 *
 * **1 · El reparto no es «híbrido 8 · builder 22 · plantillado 2»: hay una
 * CUARTA combinación.** `/es/politica-de-seguridad-de-la-informacion/` no lleva
 * `et_pb_pagebuilder_layout` **ni** `et-tb-has-body` — lleva
 * `page-template-default` + `et-tb-has-header/footer`, o sea la plantilla
 * CLÁSICA del tema con `<article><div class="entry-content">` dentro. Es un
 * régimen `--` que la taxonomía `BT`/`B-`/`-T` de `CLAUDE.md` no tiene, y
 * estaba **dentro de las 32 capturadas**, no entre las 16 que no existen.
 *
 * **2 · Las 2 «de cero módulos» NO son el mismo caso, y ninguna de las dos está
 * vacía.** La lectura de partida —*«son el caso que obliga al opcional»*— es
 * cierta en la forma (`bloques` ausente) y **falsa en el fondo**: las dos traen
 * contenido, y de un tipo que esta unión no puede sostener.
 *
 *   · `/es/redes-hibridas-…-grabacion-webinar/` es una **ENTRADA DE BLOG**
 *     (`single-post`, `postid-51434`), con su contenido en `et_pb_post_content`
 *     como HTML rico. **Y no hay que modelarla: ya tiene colección** — aparece
 *     como `<article id="post-51434">` en el bucle de entradas de
 *     `corpus/entradas-blog/…`, con su titular y su fecha (May 23, 2024). Está
 *     en el bucket `sueltas` **por su URL, no por su forma**;
 *   · `/es/politica-de-seguridad-de-la-informacion/` es el régimen `--`: su
 *     contenido vive en `entry-content` como HTML clásico de WordPress (`p`,
 *     `h2`, `ul`, `li`). **No hay colección para esa forma.**
 *
 * **Por qué esto NO se arregla poniendo `bloques` opcional.** Un documento con
 * `bloques` ausente se emite con cabecera, pie y **nada en medio**. Las dos
 * responderían **200 sirviendo una página vacía**, que es §*una ruta que
 * responde 200 no prueba que sirva CONTENIDO* — el modo de fallo que ya costó
 * seis páginas de `articulos-kb` servidas con cero módulos y todo en verde.
 *
 * **Y por qué NO se arregla aquí.** El encargo de la 92.ª lo dice: una
 * refutación medida *«vuelve al propietario, no se arregla ampliando la unión
 * sobre la marcha»*. Ampliar `paginas` con un campo rico de escape sería
 * exactamente el reproche que tumbó a **C2** —*un escape que traga el caso
 * mayoritario no acota nada*—, aquí en pequeño: dos casos, dos regímenes
 * distintos, y una solución elegida sin medir.
 *
 * **Lo que la refutación NO dice, que es la mitad honesta:** no dice que C3 esté
 * mal. **30 de 32 caen limpias**, y los 11 bloques de la unión expresan **313
 * de 313 módulos de contenido**. Lo que dice es que **el coste de C3 estaba
 * mal contado**: §2j.1 lo cifró en «`bloques` opcional en las 32» y el coste
 * medido es «`bloques` opcional **más** dos documentos cuyo contenido no son
 * bloques». Es un precio distinto, y quién lo paga es decisión del propietario.
 * ═════════════════════════════════════════════════════════════════════════ */
