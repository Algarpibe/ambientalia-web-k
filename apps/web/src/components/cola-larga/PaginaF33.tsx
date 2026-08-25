import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HeaderNav } from "@/components/HeaderNav";
import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BarraAyudaKb, tieneBarraAyuda } from "@/components/BarraAyudaKb";
import { ColumnaAncha, ColumnaEstrecha, FilaTb, SeccionCuerpoTb } from "@/components/CascaronTb";
import { CuerpoPagina } from "@/components/cola-larga/CuerpoPagina";
import {
  getPaginaColaLarga,
  rutaDePagina,
  type PaginaColaLarga,
  type RegimenPagina,
} from "@/lib/cms/paginas";

/**
 * LA PÁGINA DE LA COLA LARGA (F3-3, **E1**), compartida por sus CINCO planos de
 * ruta: `/[slug]` (19) · los tres catch-all (4 · 4 · 3) · `/empresa/…` (1).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * UN SOLO ÁRBOL PARA CINCO FICHEROS DE RUTA
 *
 * Es el mismo criterio que `PaginaKb` dejó escrito y por el mismo motivo: **dos
 * copias del árbol de un arquetipo es la peor forma de duplicación que hay** —
 * enseñan algo *parecido*, y divergen el día que alguien toca una sola de las
 * dos sin que nada lo diga. Aquí serían **cinco**.
 *
 * `dynamicParams = false` va en **cada fichero de ruta**, no aquí: sin eso un
 * catch-all responde 200 con una página cualquiera en vez de 404 (medido en el
 * andamio del ENRUTADO de grupo A, resultado 3).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ EL CASCARÓN LO ELIGE `regimen`, Y EL `switch` LLEVA `default` QUE TIRA
 *
 * CMS-5 (§2j.9) derivó `regimen` del `<body>` porque **la ruta está REFUTADA
 * como discriminador con dos separadoras, una por dirección**: acierta 30/31, y
 * `/sistema-interno-de-informacion` es **raíz y `BT`** mientras
 * `/soporte/servicio-de-reparacion` es **prefijada y `B-`**. *30 de 31 no es
 * «casi bien»: es refutado* — es el valor de la mayoría esperando a la tercera
 * instancia.
 *
 * | régimen | n | cascarón | de dónde sale |
 * |---|---|---|---|
 * | `B-` | 22 | banda + secciones a pelo, fila 1238.39 | `BANDA.colaLargaB`, medido |
 * | `BT` | 8 | `1_4` barra + `3_4` cuerpo, fila 911.75 | `articulos-kb` (`CascaronTb`) |
 * | `--` | 1 | plantilla clásica del tema (`entry-content`) | S2, §2j.3c |
 * | `-T` | **0** | — | **SIN EJERCITAR**: el `switch` TIRA |
 *
 * El `default` que tira no es celo: es el defecto puesto **en la dirección que
 * grita** (§sondas 6). Un `-T` futuro sin cascarón se serviría con el de otro
 * régimen y **nadie se enteraría** — que es exactamente cómo `articulos-kb`
 * sirvió **6 páginas con filas, columnas y CERO módulos**, con HTTP 200 y todo
 * lo demás en verde.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ LO QUE NO ESTÁ VERIFICADO, CON SU CARDINAL (§regla 14)
 *
 * · **el cascarón de `BT`**: se reusa el de `articulos-kb` porque la ficha
 *   §F3-3-CASCARON lo mapea así, y su geometría está medida **en KB**, no en
 *   este arquetipo. En el piloto hay **1 sola página `BT`**, y su `y` de
 *   primera sección propia (340.16 @1440) **no coincide** con la de KB
 *   (371.44): un Δ de **31.28** que esta tanda **no adjudica** — se mide con
 *   `qa:f33-cmp` y se ficha con sus dos lados (CORTE LIMPIO 2);
 * · **el cascarón de `--`**: `n = 1 de 31`. Con una sola instancia **nada de lo
 *   que haga está probado por variación**;
 * · **la cabecera y el pie NO se han comparado contra el original en esta
 *   familia**: `c-cabecera` cubre 17 rutas y ninguna es de la cola larga. Lo
 *   único medido es la banda de `B-` — ver `BANDA.colaLargaB`.
 */

type Params = { ruta: string[] };

/** El pie. `grupoA` es el que sirven las plantillas de theme-builder del sitio. */
const PIE = "grupoA" as const;

/**
 * Los `params` de un plano. Se **derivan del catálogo**, no de una lista: el
 * prefijo es un campo, así que una página que cambie de sitio cambia su ruta
 * sola y **no hay lista que envejezca contra la DB** (§regla 9, 7.º caso).
 */
export function segmentosDe(p: PaginaColaLarga): string[] {
  return rutaDePagina(p).slice(1).split("/");
}

export async function metadataF33(segmentos: string[]): Promise<Metadata> {
  const p = await getPaginaColaLarga(segmentos);
  if (!p) return {};
  return {
    title: p.seo.title,
    ...(p.seo.description ? { description: p.seo.description } : {}),
    // Igual que en el resto del clon: el `canonical` se DERIVA de la ruta y
    // apunta al original, declarando cuál es la página buena para los buscadores.
    alternates: { canonical: `https://kunakair.com/es${rutaDePagina(p)}/` },
    ...(p.seo.ogImage ? { openGraph: { images: [p.seo.ogImage] } } : {}),
  };
}

/**
 * El cuerpo, envuelto en el cascarón de SU régimen.
 *
 * ⚠ Los tres casos devuelven el MISMO `CuerpoPagina`: lo que cambia es la
 * retícula de alrededor, no el contenido. Meter el `switch` dentro del cuerpo
 * habría acoplado las dos cosas.
 */
function ConCascaron({ p }: { p: PaginaColaLarga }) {
  const cuerpo = (
    <CuerpoPagina bloques={p.bloques} cuerpoClasico={p.cuerpoClasico} ruta={rutaDePagina(p)} />
  );

  switch (p.regimen) {
    case "B-":
      /* Builder puro: la banda y las secciones a pelo. `f33.css` ya lleva el
       * `width: 86%` y el `max-width: 1380px` de la fila, así que aquí no va
       * ningún contenedor — meterlo sería una segunda definición del ancho. */
      return (
        <>
          <BandaCabecera {...BANDA.colaLargaB} />
          {cuerpo}
        </>
      );

    case "BT":
      /* Híbrido: la plantilla de theme-builder pone el cascarón (con el
       * `post_content` dentro) y el builder de la instancia inyecta sus
       * secciones. Es la MISMA plantilla que `articulos-kb`, con la barra a la
       * IZQUIERDA — por eso se reusan sus componentes en vez de copiarlos. */
      return (
        <>
          <BandaCabecera {...BANDA.kb} />
          <SeccionCuerpoTb>
            <FilaTb>
              <div className="min-[981px]:flex">
                {/* `col_1_4` — 258.5, canal derecho 68.1094. Su contenido lo
                    mide `qa:kb-barra` (107.ª): es el MISMO widget que sirve
                    `articulos-kb`, y que sea el mismo está medido —15 ejes con
                    varianza cero ENTRE las dos familias— y no supuesto. */}
                <ColumnaEstrecha lado="izquierda">
                  {/* ⚠ 7 de las 8 `BT`. La octava —`sistema-interno-de-informacion`—
                      tiene OTRA barra (un índice que rellena un script) y otra
                      plantilla de theme-builder; se queda vacía y está fichada
                      como §F3-3-BT-DOS-FORMAS. El predicado casa el original en
                      31/31, ver la cabecera de `BarraAyudaKb`. */}
                  {tieneBarraAyuda(rutaDePagina(p)) ? <BarraAyudaKb ruta={rutaDePagina(p)} /> : null}
                </ColumnaEstrecha>
                {/* `col_3_4` — 911.75. Aquí entra la capa PROPIA del builder. */}
                <ColumnaAncha>{cuerpo}</ColumnaAncha>
              </div>
            </FilaTb>
          </SeccionCuerpoTb>
        </>
      );

    case "--":
      /* Sin NINGÚN marcador de Divi: la plantilla clásica del tema, PHP puro,
       * con el cuerpo en `entry-content`. `CuerpoPagina` ya lo distingue por
       * `cuerpoClasico`; aquí sólo va la banda. */
      return (
        <>
          <BandaCabecera {...BANDA.colaLargaB} />
          {cuerpo}
        </>
      );

    case "-T":
      /**
       * ⚠⚠ **SIN EJERCITAR, y por eso TIRA en vez de caer en un cascarón
       * cualquiera.** `-T` es uno de los cuatro casilleros **por construcción**
       * —dos marcadores binarios del `<body>`— y su denominador en esta
       * colección es **0 de 31**. *SIN EJERCITAR no es 0*: es un camino de
       * render **sin estrenar**, o sea SIN MEDIR.
       *
       * No se recorta del enum porque recortarlo haría que una página `-T`
       * futura **fuese rechazada por el esquema al sembrarla**, que es el error
       * contrario y más caro. Se admite en el dato y se rechaza en el render,
       * que es donde falta la medida.
       */
      throw new Error(
        `PaginaF33: régimen "-T" (plantillado, theme builder) SIN CASCARÓN MEDIDO.\n` +
          `  Su denominador en \`paginas\` es 0 de 31: el enum lo admite —son 4 casilleros por\n` +
          `  construcción— pero ninguna instancia lo ejercita, así que no hay con qué pintarlo.\n` +
          `  Servirlo con el cascarón de "B-" o "BT" sería el arreglo falso: HTTP 200 y nadie se entera.`,
      );

    default: {
      /* ⚠ EXHAUSTIVIDAD COMPROBADA POR EL TIPO. Si mañana se añade un QUINTO
       * valor al enum, TypeScript rompe AQUÍ —`never` deja de aceptar la
       * asignación— en vez de dejar que el render devuelva `undefined`, que en
       * React **no falla: no pinta**. Es la guarda que faltaba cuando
       * `articulos-kb` sirvió 6 páginas con CERO módulos y todo en verde. */
      const nunca: never = p.regimen;
      throw new Error(`PaginaF33: régimen desconocido: ${JSON.stringify(nunca)}.`);
    }
  }
}

export async function PaginaF33({
  segmentos,
  conBorradores = false,
}: {
  segmentos: string[];
  /**
   * ⚠ Prop que Next NUNCA pasa. Existe para que la vista previa REUSE esta
   * página en vez de copiarla — mismo criterio que `/[slug]` y `PaginaKb`.
   */
  conBorradores?: boolean;
}) {
  const p = await getPaginaColaLarga(segmentos, { conBorradores });
  if (!p) notFound();

  return (
    <>
      <HeaderNav />
      <main className="flex flex-1 flex-col">
        <ConCascaron p={p} />
      </main>
      <Footer tipo={PIE} />
      <ScrollToTop />
    </>
  );
}

/** Azúcar para los ficheros de ruta con catch-all, que reciben `{ ruta }`. */
export async function paginaF33DeParams(raiz: string, params: Promise<Params>) {
  const { ruta } = await params;
  return [raiz, ...ruta];
}
