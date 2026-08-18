import { Fragment } from "react";

import type { CasoDeExito } from "@/types/kunak";

/**
 * LA TARJETA DE `L5` — `article.case-studies` del `loop-del-tema` de
 * `page-template-case-studies.php`.
 *
 * Spec: `docs/research/listados-hubs/components/indice-casos.spec.md`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LO QUE ESTA TARJETA TIENE Y EL ESPEJO NO PODÍA ENSEÑAR
 *
 * `lh-espejo` congela `cards.slice(0, 3)`: dice `nTarjetas 57` y trae **tres**.
 * Las tres primeras tienen **un** sector cada una, así que el espejo enseña
 * **un solo camino de render** de los tres que el original ejercita. Derivado
 * del canal SIN RECORTAR —`corpus/fase-3/listados/casos-de-exito/index.html`,
 * las 57 enteras— salen los otros dos, y no son teóricos:
 *
 * | sectores del caso | qué sirve `span.case-sectores` | n |
 * |---|---|---|
 * | **0** | el `<span>` **vacío**: ni rótulo ni enlace | **4** |
 * | **1** | `<span>Sector: </span>` + un `<a rel=tag>` | **49** |
 * | **2** | `<span>Sectores: </span>` + dos `<a>` separados por `, ` | **4** |
 *
 * **El rótulo cambia de número con el cardinal**, y los tres caminos están
 * ESTRENADOS (49 · 4 · 4) — al revés que el «documento sin fecha», que es 0 de
 * 57 y por tanto sigue sin estrenar. Construir desde el espejo habría emitido
 * «Sector: » en las 57 y un enlace donde no hay ninguno.
 *
 * ── EL ESPACIO ENTRE LOS DOS `<span>` ES CONTENIDO SERVIDO ────────────────
 * `textContent` concatena **sin** meter separador, y el barrido lee `meta` como
 * `.case-taxonomies` con `replace(/\s+/g," ").trim()`. El original tiene saltos
 * de línea entre `</span>` y `<span class="case-ubicacion">`, que colapsan a UN
 * espacio; sin el `{" "}` el texto saldría «…EDAR / PTARUbicación: Omán» y
 * serían pares de eje `contenido` en las 57. Es la misma lección que ya costó 6
 * pares en `TarjetaCientifica`, aquí sobre otro par de nodos.
 *
 * ── LAS CLASES DEL `<article>`: lo que se emite y lo que NO ───────────────
 * `post_class()` del CPT `case-studies`. Se emiten `case-studies
 * type-case-studies status-publish has-post-thumbnail hentry` y **`sector-<slug>`
 * por término, en el orden del dato** — verificado en las 57: orden de clases ==
 * orden de los `<a rel=tag>` == orden del array de la DB, **0 desajustes**.
 *
 * Dos familias de clase **no se pueden emitir**, y se declaran en vez de
 * inventarse:
 *
 * | clase | por qué no | ficha |
 * |---|---|---|
 * | `post-<ID>` | el ID de WordPress **no está en el modelo** y es irreproducible por diseño | mismo caso que `TarjetaCientifica` — eje **mixto** |
 * | `tag-<slug>` | la relación `post_tag` la anotó `D3` como dato y **no la añadió al modelo** *«hasta que un listado la consuma»*; **este listado no la consume** — quien la consumiría es el filtro, y ése usa `sector` | `SP-K6` de la spec |
 *
 * ── LA FOTO: el original sirve una variante que el clon no genera ─────────
 * Va como `background-image` de un `<a class="case-imagen">` — **la tarjeta de
 * caso no tiene `<img>`**, que es lo que `qa:hover-zonal` ya había dicho por el
 * canal del CSS (su regla de zoom amplía el propio `<a>`). El original pide la
 * variante **`1024×*`** en **53 de 57** (46 son `1024x683`) y el almacén del
 * clon declara `300 · 480 · 768 · 980 · 1280` + el original: **no hay 1024**, así
 * que se sirve el original. Es la misma clase que
 * `PENDIENTES-QA.md` §F3-LH-VARIANTE-724x1024, y se declara porque una
 * desviación que nadie mide es exactamente la que se olvida.
 *
 * ── EL TÍTULO VA CON SUS ESPACIOS, y no es formato ────────────────────────
 * El original sirve `<a href="…"> Título </a>` — con espacio a los dos lados
 * dentro del `<a>`. Colapsan contra los bordes del bloque y **no mueven un
 * píxel**, pero se replican igual: lo que se transcribe es lo servido, no lo que
 * un formateador considera limpio.
 *
 * ⚠ **Y un título de los 57 NO se puede reproducir hoy**: el original sirve
 * `H<sub>2</sub>S` en `control-emisiones-de-olor-en-ptar-en-israel` y el modelo
 * guarda el texto aplanado («H 2 S»). Es §CMS-TITULO-RICO, defecto **vivo con
 * dueño** y anterior a esta forma —el mismo corte en `<sub>` que ya tapa
 * `Medición de PM<sub>10</sub>` en `/recursos/articulos/`—. **1 de 57**, y cae
 * fuera del `slice(0, 3)` del espejo, así que ningún comparador lo verá: por eso
 * se escribe aquí.
 */
export function TarjetaCaso({ caso, href, hrefSector }: {
  caso: CasoDeExito;
  /** Ruta LOCAL del caso: las 57 están clonadas bajo sus dos prefijos. */
  href: string;
  /** El destino del chip de sector, por slug. */
  hrefSector: (slug: string) => string;
}) {
  const sectores = caso.sectores ?? [];
  const clases = [
    "case-studies",
    "type-case-studies",
    "status-publish",
    "has-post-thumbnail",
    "hentry",
    ...sectores.map((s) => `sector-${s.slug}`),
  ].join(" ");

  return (
    <article className={clases}>
      <div className="case-imagen-container">
        <a href={href} className="case-imagen" style={{ backgroundImage: `url(${caso.imagenCabecera})` }} />
      </div>

      <div className="case-taxonomies">
        {/* El `<span>` se emite SIEMPRE, también con 0 términos: el original lo
            sirve vacío en las 4 sin sector, y es él quien lleva el
            `padding-inline-end: 1rem` de `.case-taxonomies > span:first-child`.
            Omitirlo movería ese padding al de ubicación. */}
        <span className="case-sectores">
          {sectores.length > 0 ? (
            <>
              <span>{sectores.length > 1 ? "Sectores: " : "Sector: "}</span>
              {/* ⚠ **`Fragment`, NO un `<span>` envolvente.** El original pone
                  los `<a>` como hijos DIRECTOS de `.case-sectores`, con `, `
                  suelto entre ellos. Envolverlos añadiría un nodo que el barrido
                  censa en `etiquetas` — y, peor, casaría
                  `.case-taxonomies span span { font-weight: 700 }`, que la hoja
                  del tema sirve para poner en negrita el rótulo: los dos enlaces
                  saldrían en negrita. Es §El principio en su forma de cascada —
                  se replica lo que el navegador hace con lo servido, y un nodo
                  de más cambia quién casa. */}
              {sectores.map((s, i) => (
                <Fragment key={s.slug}>
                  {i > 0 ? ", " : null}
                  <a href={hrefSector(s.slug)} rel="tag">
                    {s.nombre}
                  </a>
                </Fragment>
              ))}
            </>
          ) : null}
        </span>{" "}
        <span className="case-ubicacion">
          <span>Ubicación: </span>
          {caso.detalles.ubicacion}
        </span>
      </div>

      <header>
        <div className="case-cliente">{caso.cliente}</div>
        <h3 className="case-title">
          <a href={href}> {caso.titulo} </a>
        </h3>
      </header>
    </article>
  );
}
