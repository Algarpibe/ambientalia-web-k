import type { ReactNode } from "react";

import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Footer } from "@/components/Footer";
import { HeaderNav } from "@/components/HeaderNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WidgetsBarra } from "@/components/listados/BarraLateral";

import "@/app/listados.css";
import "@/app/tema.css";

/**
 * EL CASCARÓN DE `L2` — EL ARCHIVO DE CPT (`/glosario` · `/preguntas-frecuentes`).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL RÉGIMEN: NI BUILDER NI THEME BUILDER, Y NO ES UN TERCERO
 *
 * El `<body>` no trae `et_pb_pagebuilder_layout` **ni** `et-tb-has-body`, y el
 * esqueleto da `cuerpo = 0` en las 12 instancias y a los dos anchos: **cuatro
 * secciones Divi, todas de cascarón** (`tb_header 1` + `tb_footer 3`). El
 * listado lo emite **la plantilla PHP del archivo de CPT**.
 *
 * ⚠ **Y aun así el LISTADO sí es un módulo de Divi** (`listado.via =
 * modulo-divi`, `article.et_pb_post`). O sea: plantilla del tema que incrusta
 * el bucle de Divi. Para el clon eso significa que **la tarjeta lleva la clase
 * del módulo y el cascarón no**, que es justo lo contrario de `L1`.
 *
 * ── Lo que hay entre la cabecera y la primera tarjeta: NADA, y 58 px ──────
 * Derivado del corpus **sin recortar** (`corpus/fase-3/listados/glosario/`),
 * entre `#et-main-area` y el primer `<article>` hay exactamente cuatro divs y
 * ningún contenido:
 *
 *   #et-main-area › #main-content › .container › #content-area.clearfix › #left-area
 *
 * **Sin miga, sin `h1`, sin banda de filtros.** El `h1` no falta por descuido:
 * `D4b` lo cierra con su denominador —**12 documentos sin `<h1>`**, glosario
 * 8/8 y faqs 4/4, **0 con `<h1>` vacío** en los 149—, así que la base de
 * lectura de esta forma es **la primera tarjeta** y no el titular.
 *
 * Los 58 px son el `padding-top` de `.container`, **iguales a 1440 y a 390**
 * (283 − 225 y 194.58 − 136.58), y ya los sirve `.lh-tema .container`.
 *
 * ── La retícula: `#left-area` + `#sidebar`, y el sidebar SÍ existe ────────
 * `SP-C8` lo cazó: `lh-barra` daba `conBarra 0 de 12` porque buscaba la
 * partición Divi `3_4+1_4`, y la barra de `L2` es **la del TEMA**. Medido:
 *
 * | | @1440 | @390 |
 * |---|---|---|
 * | `#left-area` | **911.52** con `padding-right 63.36` ⇒ contenido **848.16** | **312**, sin padding |
 * | `#sidebar` | **240.48** al lado | **426.19** apilado debajo |
 *
 * `911.52 / 1152 = 79.125 %` y `63.36 / 1152 = 5.5 %` — los dos defaults de
 * Divi, transcritos como el porcentaje que producen el número medido.
 *
 * ── Y los cuatro widgets son LOS MISMOS que los de `L1` ──────────────────
 * Byte a byte salvo los `href`. Por eso `WidgetsBarra` se extrajo en vez de
 * copiarse: lo único que difiere es el envoltorio, y el envoltorio es la CAPA.
 *
 * ── Lo que este cascarón NO resuelve, con su cardinal (§regla 14) ─────────
 * · **`P-LH-C8` a medias**: que el ancla —la primera tarjeta— sea *el mismo
 *   elemento* en los dos lados no se había podido comprobar porque el clon no
 *   emitía estas rutas. Con `L2` emitida ya se puede, y lo hace `pie-cmp` /
 *   `lh-cmp`; hasta que salga en verde, un Δ0 en el cuerpo de `L2` **no
 *   significa lo que parece**;
 * · **el ruido de estas 12 rutas**: sin campaña, un residuo pequeño es SIN
 *   PROBAR (§Notas de método);
 * · **`SP-C6`**: la varianza de esta forma tiene **n = 2** (una instancia por
 *   CPT). Toda propiedad que sólo aparezca en una queda SIN PROBAR — y este
 *   componente sirve **glosario**, así que lo que aquí se fija está medido en
 *   una instancia y confirmado en la otra sólo donde la spec lo dice.
 */
export function PaginaArchivoCpt({
  listado,
  paginador,
  hrefSiguiente,
  hrefAnterior,
}: {
  /** Los `<article class="et_pb_post">`, ya compuestos por la forma. */
  listado: ReactNode;
  /** El `div.wp-pagenavi`. Va DENTRO de `#left-area`, detrás del listado. */
  paginador: ReactNode;
  hrefSiguiente?: string;
  hrefAnterior?: string;
}) {
  return (
    <>
      {hrefSiguiente ? <link rel="next" href={hrefSiguiente} /> : null}
      {hrefAnterior ? <link rel="prev" href={hrefAnterior} /> : null}

      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* 225 / 136.58 — entrada propia aunque coincida con `listado`: la
            cabecera de `L2` se la sirve otra capa. Ver `BANDA.archivoCpt`. */}
        <BandaCabecera {...BANDA.archivoCpt} />

        <div id="et-main-area">
          {/* Fondo **#f7f7f7**, medido: `L2` va con el de `L1` y no con el
              blanco de `L3`, aunque comparta con `L3` el régimen de plantilla
              PHP. Dos ejes que no van juntos. */}
          <div
            id="main-content"
            data-lh="cpt"
            className="lh-cuerpo lh-tema lh-cpt w-full overflow-hidden bg-[#f7f7f7]"
          >
            <div className="container">
              <div id="content-area" className="clearfix">
                <div id="left-area">
                  {listado}
                  {paginador}
                </div>
                {/* El `#sidebar` del TEMA: los widgets cuelgan DIRECTOS, sin el
                    módulo Divi que `L1` sí sirve. */}
                <div id="sidebar">
                  {/* `/categoria/<slug>/` NO está clonado (F3-4): se queda
                      apuntando al original hasta que se clone. */}
                  <WidgetsBarra hrefCategoria={(s) => `https://kunakair.com/es/categoria/${s}/`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer tipo="archivoCpt" />
      <ScrollToTop />
    </>
  );
}
