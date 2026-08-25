import { MENU_CENTRO_AYUDA, type ItemMenuAyuda } from "@/lib/menu-centro-ayuda";

/**
 * LA BARRA LATERAL DEL CASCARÓN `_tb_` — el `et_pb_sidebar_0_tb_body` que el
 * original sirve en las DOS familias de KB, y que el clon emitía VACÍO.
 *
 * Medida: `npm run qa:kb-barra` → `medidas/kb-barra-{1440,390}.json`.
 * Hoja: `app/barra-ayuda.css`. Dato: `lib/menu-centro-ayuda.ts`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * POR QUÉ EXISTE ESTE FICHERO, Y POR QUÉ NO EXISTÍA
 *
 * El hueco **no era un defecto de emisión: era una MEDIDA QUE NUNCA SE TOMÓ**,
 * y estaba declarada como tal —*«`cascaron.spec.md` §2 midió la caja y no lo de
 * dentro … inventarle contenido sería rellenar una medida que no se tomó»*—.
 * La 107.ª la tomó, así que la razón para dejarlo vacío se acabó.
 *
 * ⚠ Y de paso corrigió el número que la sostenía: la cabecera decía **«1 widget
 * en 6/6»**. Son **TRES en 13/13** — un `widget_nav_menu` y **dos
 * `widget_custom_html` VACÍOS**. Las dos lecturas eran ciertas y contestaban
 * preguntas distintas (§*un censo de NODOS y un censo de LO QUE SE VE*): los
 * dos vacíos computan `h 0` y **no tienen caja**.
 *
 * ── Los dos vacíos SE EMITEN, y la razón no es la maquetación ─────────────
 * No mueven un píxel: está medido que `barra.h` = `widget0.h` = `menu.ul.h` =
 * **493.66** exacto a 1440 y **461.16** a 390, o sea que sus `margin-bottom` de
 * 32 px **se colapsan fuera del contenedor** y no suman. Se emiten porque
 * **están en la salida servida** y porque un censo futuro que cuente
 * `section[id$='-sidebar']` encontraría **1 contra 3** y ficharía un defecto que
 * no existe. El `id` repetido es del original y se transcribe tal cual
 * (§fidelidad sobre criterio propio).
 *
 * ── Lo que NO se transcribe, con su derivación ────────────────────────────
 * Los `id="menu-item-26062"` y su clase gemela `menu-item-26062` son ids de
 * post de WordPress. **No se emiten**, y no es comodidad: censadas contra el
 * CSS servido de la página, `menu-item-2…`, `menu-item-object-page`,
 * `menu-centro-de-ayuda` y `widget_nav_menu` tienen **0 reglas** — son inertes.
 * Inventar números que el CMS del clon no tiene sería fabricar dato.
 *
 * ── El ESTADO se DERIVA de la ruta, no se guarda ──────────────────────────
 * Los `current-*` son la única cosa que varía entre las 13 instancias: **14
 * firmas distintas de 14**. No son un campo — son *dónde está el lector*.
 * Guardarlos obligaría a mantener 13 copias del mismo árbol con un `current`
 * movido. Medido el cruce estado × color en las 13: **sólo `current-menu-item`
 * —el ítem EXACTO— pinta azul**; los ancestros se quedan en `#333`.
 */

/**
 * ⚠⚠ **NO TODAS LAS `BT` LLEVAN ESTA BARRA: 7 de 8.** La octava
 * —`/sistema-interno-de-informacion/`— es `BT` y tiene barra lateral, pero
 * **OTRA**: un `widget_custom_html.pages-content` con el titular «Índice del
 * artículo» y un `<ul id="indice-contenido">` **vacío que rellena un script**.
 * Otra forma, y encima una que necesita el eje COMPORTAMIENTO para medirse.
 *
 * Y no es una excepción sin mecanismo — son **dos plantillas de theme-builder
 * distintas**, leído en la hoja que cada documento pide:
 *
 *   hubs + artículos ......  `et-divi-dynamic-tb-140-tb-25181-tb-342-…`
 *   sistema-interno .......  `et-divi-dynamic-tb-61286-tb-61280-tb-342-…`
 *
 * En régimen plantillado *lo que varía entre FORMAS distingue plantillas*, así
 * que son dos, no una con el hueco vacío. Lo confirma su geometría: su `techo`
 * mide **406.42** contra los **339.16** de las otras siete.
 *
 * ── Qué eje se usa para discriminar, y por qué no el que tiene el mecanismo ─
 * `ruta bajo el centro de ayuda` y `plantilla tb-25181` van **1:1 en las 31
 * páginas**, así que este dominio **no puede separarlos** (§*un discriminador
 * 1:1 puede ser la sombra de otro*). Se elige la ruta por el criterio que la
 * ley da: **el que está SERVIDO en los dos lados**. La plantilla es el
 * mecanismo y **el clon no la tiene en su modelo** — no se puede escribir una
 * regla sobre un campo que no existe.
 *
 * Verificado contra el original, no supuesto: el predicado casa
 * `cascaron.barra` de `f33-cmp` en **31 de 31 rutas, 0 discrepancias** (7 con
 * barra, 24 sin ella).
 *
 * ⚠ **El arreglo bueno es un CAMPO** —qué plantilla de theme-builder usa la
 * página—, y no se hace aquí porque exige migración y re-siembra, o sea mover
 * el dato de 31 rutas en mitad de una tanda que mide (§regla 20). Fichado:
 * §F3-3-BT-DOS-FORMAS.
 */
/**
 * ⚠⚠ **Y LA RAÍZ CUENTA COMO SUYA, que es donde la primera versión se dejó una
 * de las siete.** `startsWith("/soporte/centro-de-ayuda/")` —con barra— es
 * FALSO para **`/soporte/centro-de-ayuda`**, que es una de las 7 y además un
 * hub. El predicado se verificó contra las rutas de `f33-cmp`, que llevan
 * **barra final** (`/es/soporte/centro-de-ayuda/`), y `rutaDePagina()` **no la
 * lleva**: 31/31 contra la forma medida y **6 de 7** contra la forma servida.
 *
 * Es §*verificar contra la SALIDA SERVIDA, no contra la fuente que uno supone
 * responsable* — aquí con la fuente cambiada por **la forma en que la ruta
 * viaja**. Y no habría dado error: habría dejado un hub sin barra, en silencio.
 */
const RAICES_AYUDA = ["/centro-de-ayuda", "/soporte/centro-de-ayuda"];
export function tieneBarraAyuda(ruta: string): boolean {
  return RAICES_AYUDA.some((r) => ruta === r || ruta.startsWith(`${r}/`));
}

/** ¿Es `href` la ruta actual, o un ancestro suyo? */
function estadoDe(href: string, ruta: string): "actual" | "ancestro" | null {
  if (href === ruta) return "actual";
  return ruta.startsWith(`${href}/`) ? "ancestro" : null;
}

function Rama({ items, ruta, nivel }: { items: ItemMenuAyuda[]; ruta: string; nivel: number }) {
  return (
    <ul className={nivel === 0 ? "ayuda-menu" : "sub-menu"}>
      {items.map((it) => {
        const est = estadoDe(it.href, ruta);
        /* Las clases del original, menos los ids de post. `menu-item-has-children`
         * se emite porque el CSS servido SÍ la usa (8 reglas), a diferencia de
         * las otras cuatro. */
        const clases = [
          "menu-item",
          "menu-item-type-post_type",
          "menu-item-object-page",
          it.hijos?.length ? "menu-item-has-children" : null,
          est === "actual" ? "current-menu-item" : null,
          est === "actual" ? "current_page_item" : null,
          est === "ancestro" ? "current-menu-ancestor" : null,
          est === "ancestro" ? "current-page-ancestor" : null,
          est === "ancestro" ? "current_page_ancestor" : null,
        ].filter(Boolean).join(" ");
        return (
          <li key={it.href} className={clases}>
            {/* Sin `target="_blank"`: los 12 destinos son del propio clon. */}
            <a href={it.href} {...(est === "actual" ? { "aria-current": "page" as const } : {})}>
              {it.label}
            </a>
            {it.hijos?.length ? <Rama items={it.hijos} ruta={ruta} nivel={nivel + 1} /> : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * @param ruta la ruta LOCAL de la página que pinta la barra (`/centro-de-ayuda/…`).
 *   Se pasa explícitamente porque esto es un componente de servidor y las dos
 *   familias la derivan de sitios distintos: `PaginaKb` de `prefijo`+`slug`,
 *   `PaginaF33` de `rutaDePagina(p)`.
 */
export function BarraAyudaKb({ ruta }: { ruta: string }) {
  return (
    <div className="ayuda-barra" data-barra="">
      <section id="help-center-sidebar" className="ayuda-widget">
        <div className="menu-centro-de-ayuda-container">
          <Rama items={MENU_CENTRO_AYUDA} ruta={ruta} nivel={0} />
        </div>
      </section>
      {/* Los dos `widget_custom_html` VACÍOS del original. Ver ⚠ de arriba: no
          mueven un píxel (medido) y se emiten porque están servidos. */}
      <section id="help-center-sidebar" className="ayuda-widget">
        <div className="textwidget custom-html-widget" />
      </section>
      <section id="help-center-sidebar" className="ayuda-widget">
        <div className="textwidget custom-html-widget" />
      </section>
    </div>
  );
}
