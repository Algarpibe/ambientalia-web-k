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
 * ⚠ **CORREGIDO EN LA 100.ª (2026-08-24): aquí decía «ESTA COLECCIÓN NO ESTÁ EN
 * `COLECCIONES` TODAVÍA, Y ES DELIBERADO», y llevaba tiempo siendo FALSO.**
 *
 * Derivado, no recordado: `colecciones.ts:155` y `:188` la importan y la
 * registran, y la DB tiene sus **31 filas** y su migración
 * (`20260823_131718_f3_3_paginas_cola_larga`). La 98.ª la dio de alta —está
 * escrito con su razón en `seed.mjs` §SEMBRADAS— y **este comentario no se
 * actualizó**.
 *
 * Es §regla 3 (*documentado no es conectado*) **por el otro lado**: allí el
 * comentario prometía una llamada que no existía; aquí niega un alta que sí
 * existe. Los dos fallan igual y por lo mismo — **el comentario es la única
 * cosa del fichero que nadie ejecuta ni verifica**, así que lo que afirme sobre
 * el estado del repo es un dato **recordado**, y envejece **contra** él en
 * silencio (§regla 9).
 *
 * Lo que sigue en pie de aquel bloque es el resultado de la prueba por
 * extracción —la unión no expresaba 2 de las 32, y **por régimen**—; está
 * resuelto y se lee al final del fichero, en `⚠ LO QUE LA PRUEBA DEVOLVIÓ`.
 * ══════════════════════════════════════════════════════════════════════════
 */
import type { CollectionConfig } from "payload";

import { campoHtml, seoA } from "../campos/comunes.ts";
import { bloquesPagina } from "../bloques/paginas.ts";
import { registroDeSlug } from "../hooks/registro-slug.ts";

export const paginas: CollectionConfig = {
  slug: "paginas",
  admin: { useAsTitle: "titulo", group: "Contenido" },
  /**
   * ⚠⚠ **`enElPlano` NO es opcional aquí, y lo dice la medida (94.ª tanda).**
   *
   * Sin el predicado, `registroDeSlug` reclama **las 31** en el plano de un
   * segmento de `/es/`. Y las 31 **no están en el plano**: `qa:f33-rutas` mide
   * su profundidad y da **19 de un segmento · 8 de dos · 2 de tres · 2 de
   * cuatro**. O sea que reclamar todas reservaría **12 slugs de raíz que no son
   * la URL de nadie** —`kunak-air`, `kunakpedia`, `centro-de-ayuda`,
   * `servicio-de-reparacion`…— y eso **no protege: BLOQUEA altas legítimas**,
   * que es la otra forma de que una guarda deje de servir.
   *
   * **No es una precaución teórica: el defecto ya existe en el repo y está
   * medido.** `articulos-kb` llama a `registroDeSlug` **sin** `enElPlano` y es
   * una colección PREFIJADA (`prefijo` es `required`), así que reserva **6 de
   * 6** slugs de raíz que sus URLs reales —`/centro-de-ayuda/kunak-air/
   * articulos-de-ayuda/<slug>`, cuatro segmentos— no usan. Sale nombrado en
   * `qa:slugs` §RECLAMO SIN RUTA y está fichado en `PENDIENTES-QA.md`
   * §F3-3-REGISTRO-SOBRE-RECLAMA; **no se arregla aquí** porque toca una
   * colección ya verificada.
   *
   * El predicado es el mismo patrón que `productos` (§2e), con su eje: allí el
   * discriminador es `padre`, aquí es `prefijo`. Y va escrito **antes** de
   * emitir, que es la única forma de que no se pague dos veces.
   */
  hooks: registroDeSlug({
    familia: "paginas",
    enElPlano: (doc) => !doc.prefijo,
  }),
  /**
   * ⚠⚠ **LA IDENTIDAD ES EL PAR `(prefijo, slug)`, NO EL SLUG — y F3-3 es el
   * PRIMER arquetipo donde eso importa (2026-08-23, 96.ª; lo destapó la
   * siembra).**
   *
   * Las otras siete colecciones declaran `slug` con `unique: true`, y hacen
   * bien: **en sus dominios el slug ES único**. Copiarlo aquí falla, y está
   * medido — de las 31 páginas salen **29 slugs distintos**:
   *
   * | slug | ×  | prefijos |
   * |---|---|---|
   * | `articulos-de-ayuda` | 2 | `centro-de-ayuda/kunak-air` · `soporte/centro-de-ayuda/kunak-air-cloud` |
   * | `video-tutoriales`   | 2 | ídem |
   *
   * Los pares `(prefijo, slug)`, en cambio, son **31 de 31 distintos**. Así que
   * `unique` sobre el slug no es una guarda estricta: es una guarda cuyo
   * DOMINIO no coincide con el invariante, y por eso **rechaza dos páginas
   * legítimas** (§*una guarda cuyo dominio es más ancho que su invariante deja
   * de proteger y pasa a bloquear*).
   *
   * ⚠ Y es §*una regla derivada sobre un dominio donde el caso NO SE DA está
   * SIN PROBAR para ese caso*, cometida sobre un PATRÓN en vez de sobre un
   * número: `unique: true` se venía copiando de colección en colección porque
   * en todas valía, y nadie podía notar que su premisa era del dato.
   *
   * El índice compuesto expresa la identidad real. `index: true` en el slug se
   * conserva porque las consultas siguen entrando por él.
   */
  indexes: [{ fields: ["prefijo", "slug"], unique: true }],
  fields: [
    { name: "slug", type: "text", required: true, index: true },
    /**
     * ⚠ **El prefijo es CAMPO, y lo dice la medida — igual que en
     * `articulos-kb` y en `/recursos/[...ruta]`.** Las 32 rutas tienen
     * profundidad de 1 a 5 segmentos (`/es/empresa/` contra
     * `/es/soporte/centro-de-ayuda/kunak-air-cloud/video-tutoriales/`), así que
     * el slug **no basta** para construir la URL y el prefijo no se puede
     * cablear en la ruta.
     */
    { name: "prefijo", type: "text" },
    /**
     * ══════════════════════════════════════════════════════════════════════
     * ⚠⚠ **CMS-5 · EL RÉGIMEN — R1, decidida por el propietario el 2026-08-24
     * y aplicada en la 100.ª tanda.** Enunciado y las tres salidas en
     * `ESQUEMA-CMS.md` §2j.8; el cierre, en §2j.9.
     *
     * **Qué decide, y no es cosmético.** El régimen del `<body>` decide **qué
     * cascarón sirve el tema**, de ahí sale el **ancho de fila**, y de ahí el
     * **default de `mb` de cada módulo** (34.05 contra 25.06). Sin este campo
     * el clon no puede elegir en **30 de 31** páginas.
     *
     * | régimen | n | cascarón |
     * |---|---|---|
     * | `B-` | **22** | sin barra lateral (el de SECTOR/MONOGRÁFICO) |
     * | `BT` | **8** | columna `1_4` de barra + `3_4` de cuerpo (el de `articulos-kb`) |
     * | `--` | **1** | plantilla clásica del tema (`entry-content`) |
     * | `-T` | **0** | ⚠ **SIN EJERCITAR** — ver abajo |
     *
     * ── Por qué es CAMPO y no plantilla ───────────────────────────────────
     * Varía **dentro de la misma colección** —22 · 8 · 1—, así que pasa el
     * **test B** (la variación intra-arquetipo) con holgura. Lo escribió quien
     * construyó cada página en WordPress al elegir plantilla, igual que
     * `prefijo` o `flujo`: es la huella del editor, no de quien maquetó.
     *
     * ── Por qué NO se cableó la ruta (R3) ─────────────────────────────────
     * Porque está **REFUTADA con dos separadoras, una por dirección**
     * (`derivaciones/f33-regimen-discriminador.log`): la ruta acierta 30/31, y
     * `/sistema-interno-de-informacion` es **raíz y BT** mientras
     * `/soporte/servicio-de-reparacion` es **prefijada y B-**. **30 de 31 no es
     * «casi bien»: es refutado** — es el arreglo falso, o sea el valor de la
     * mayoría esperando a la tercera instancia.
     *
     * ── Por qué se DERIVA y no se escribe a mano ──────────────────────────
     * `regimenDe()` en `scripts/seed/extractor-f33.mjs` lo calcula del `<body>`
     * del corpus —que ya lo hacía para su censo—, así que **no hay lista de
     * rutas que envejezca contra el corpus** (§regla 9, 7.º caso) y **no hay
     * que volver al original**.
     *
     * ── Los CUATRO casilleros, y el que entra SIN EJERCITAR ───────────────
     * Son **dos marcadores binarios**, así que la taxonomía tiene `2 × 2 = 4`
     * casilleros **por construcción**, y `regimenDe()` puede devolver los
     * cuatro. `-T` entra **con su denominador: 0 de 31** en esta colección.
     * **SIN EJERCITAR no es 0** (§*un campo que ADMITE un caso y que ningún dato
     * de calibración EJERCITA es un camino de render sin estrenar*): se declara
     * en vez de recortarse, porque recortar el enum haría que una página `-T`
     * futura **fuese rechazada por el esquema** en lugar de sembrarse.
     *
     * ── `required`, y el porqué del coste que trae ────────────────────────
     * Va **obligatorio a propósito**, con el defecto puesto en la dirección que
     * GRITA (§sondas 6): sin regimen, la siembra **falla en el acto**; con un
     * `defaultValue` benigno, las 8 `BT` se servirían con el cascarón de las 22
     * y **nadie se enteraría** — que es §regla 6 exacta, *un valor por defecto
     * convierte «no lo sé» en «está bien»*.
     *
     * ⚠ **Su precio, medido y declarado:** `required` es `NOT NULL` en
     * Postgres, así que el `up` de la migración **sólo puede correr con la
     * tabla VACÍA**. No es un problema del pipeline —`cms:reset` dropea el
     * esquema y reaplica las versionadas sobre vacío en cada corrida— pero **sí
     * es la ventana de la reversa**, y por eso se probó ahí (§regla 30). El
     * número está en la cabecera de la migración.
     * ═════════════════════════════════════════════════════════════════════ */
    {
      name: "regimen",
      type: "select",
      required: true,
      options: [
        { label: "B- · builder puro (sin barra lateral)", value: "B-" },
        { label: "BT · híbrido (barra lateral 1_4 + cuerpo 3_4)", value: "BT" },
        { label: "-T · plantillado (theme builder)", value: "-T" },
        { label: "-- · plantilla clásica del tema (entry-content)", value: "--" },
      ],
    },
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
