import type { CSSProperties, ReactNode } from "react";

import type {
  ColumnaPagina,
  FilaPagina,
  MedidaKb,
  ModuloPagina,
  PielKb,
  SeccionPagina,
} from "@/lib/cms/paginas";

/**
 * EL CUERPO DE LA COLA LARGA — sección → fila → columna → módulo.
 *
 * Esquema `packages/cms-config/src/bloques/paginas.ts`; geometría del ORIGINAL
 * derivada en `qa:f33-geo` (congelada `medidas/f33-geo.json`, 2026-08-22).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠ LA FASE DE SPECS YA EXISTE (100.ª, 2026-08-24) — Y ESTE FICHERO **TODAVÍA
 * NO ESTÁ TRANSCRITO DE ELLA**
 *
 * Hasta la 100.ª este bloque decía *«este arquetipo NO TIENE FASE DE SPECS»*, y
 * era cierto. Ya no: `docs/research/cola-larga/components/` tiene
 * `README.md` · `modulos.spec.md` · `reticula.spec.md`, derivados con
 * `qa:f33-spec` (313 módulos · 11 tipos · 31 páginas, negativo 5/5).
 *
 * **Pero el estado de ESTE fichero no cambia por eso, y decir lo contrario
 * sería §regla 3** —*documentado no es conectado*—: el marcado de aquí abajo
 * **se escribió de memoria antes de que la spec existiera** y **nadie lo ha
 * cotejado con ella todavía**. Que exista la medida y que el componente la
 * cumpla son **dos afirmaciones distintas**, y sólo la primera está respaldada.
 *
 * **Lo que la spec ya destapó del propio instrumento** —y que vale como aviso
 * de cuánto se le escapa a lo escrito de memoria—: un censo por `.et_pb_module`
 * pierde **`button` ENTERO** (13 instancias), porque en Divi el botón es un
 * `<a>` **sin** `et_pb_module`. No dio error: dio 300 módulos y 10 tipos en vez
 * de 313 y 11.
 *
 * > **Léase como lo que es: la ESTRUCTURA del arquetipo, con su marcado como
 * > primera aproximación medida, PENDIENTE de cotejo contra
 * > `components/modulos.spec.md`.** El cotejo es trabajo de la tanda que emita,
 * > y su instrumento definitivo es `qa:f33-cmp` —el comparador de dos lados—,
 * > que sigue a **0 ejes comparados** porque el lado del clon no existe.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS TRES REGLAS QUE GOBIERNAN ESTE FICHERO
 *
 * **1 · Sólo se emite lo que el DATO trae.** Un eje ausente no se traduce a un
 * valor «razonable»: se deja llegar el default de la hoja. Convertir *«el
 * editor no lo tocó»* en *«el editor escribió esto»* es §regla 6 al revés, y
 * aquí tiene nombre y cardinal — `qa:f33-geo` declaró **24 ejes SIN ESCRIBIR**
 * (`text.pt`, `code.*`, `icon.mt/pt/pb`, los cuatro de `map`, los cuatro de
 * `slider`…), todos con **un solo valor observado y ese valor el INICIAL de la
 * propiedad**. §*un eje cuyo ÚNICO valor observado es el inicial sale SIN
 * ESCRIBIR — que no es ni campo ni plantilla, y no se cablea*.
 *
 * **2 · El ritmo va por VARIABLE CSS, con prefijo POR NIVEL.** Un mismo hueco
 * tiene hasta tres orígenes (default de plantilla · escritorio · móvil) y sólo
 * una cascada los ordena. Y el prefijo es obligatorio porque las custom
 * properties **heredan**: un `--f33-mb` puesto en la fila lo verían sus
 * columnas y sus módulos, y un módulo sin `mb` propio cogería el de su fila —
 * sin dar error y sólo en las filas que traen `mb`. Con `--f33s-*` / `--f33f-*`
 * / `--f33m-*` el hueco de cada nivel es suyo.
 *
 * **3 · El `switch` lleva `default` que TIRA.** Ver abajo.
 *
 * ── ⚠ Y LOS 11 `kind` SE CRUZARON CONTRA LA CONFIG, no se dedujeron ───────
 * Es la comprobación que le faltó a KB, así que aquí se hace y se deja escrita:
 * recorriendo `MODULOS_PAGINA` de `bloques/paginas.ts` salen **11 slugs** —
 * `texto-pagina · imagen-pagina · boton-pagina · codigo · toggle · video-pagina
 * · blurb · slider-completo · slider · mapa · icono`— y son **exactamente** los
 * `case` de abajo. La cadena que lo justifica es `mapeo.mjs` §blocks:
 * `ctx.conKind(aqui, b.slug, cuerpo)`, o sea que **el `kind` ES el slug del
 * bloque**. Cruzar dos instrumentos sobre el mismo objeto es lo único que
 * distingue «lo deduje bien» de «lo deduje».
 * ═════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
 * ⚠⚠ LOS CUATRO KINDS QUE ESTA TANDA **NO PINTA** — CORTE LIMPIO 2
 *
 * El encargo lo dice literal: *«si el renderizador necesita un valor para
 * pintar donde no hay medida, ESO es el hallazgo — se ficha, no se elige»*.
 * Aquí hay cuatro, y **las razones NO son la misma**, así que se separan:
 *
 * | kind | inst. | con caja | por qué no se cabla |
 * |---|---|---|---|
 * | `video-pagina` | **30** | **0** | **NO MEDIBLE.** Las 30 viven dentro de desplegables CERRADOS. `getComputedStyle` sobre un elemento sin caja **no resuelve los porcentajes contra nada**: devuelve ceros, y esos ceros entrarían en la distribución como si fueran dato. Lo que su geometría necesita no es otra sonda del HTML servido: es **INTERACCIÓN** — abrir el desplegable— que es el eje que este repo tiene a 0 |
 * | `slider-completo` | **2** | 2 | **n = 2 y varianza CERO**: `et_pb_media_alignment_center` y `et_pb_bg_layout_dark` salen en las dos, o sea que no hay con qué separar plantilla de campo (§*un discriminador hallado en una sola instancia no es un discriminador*) |
 * | `slider` | **1** | 1 | **n = 1** |
 * | `mapa` | **1** | 1 | **n = 1** |
 *
 * **34 módulos de 313 · 7 rutas de 31.** Derivado de `medidas/f33-geo.json`,
 * no recordado.
 *
 * ── Y «no pintar» NO PUEDE SER SILENCIO ──────────────────────────────────
 * Devolver `null` a secas es exactamente el modo de fallo del que este repo se
 * defiende: la página respondería **200 con contenido de menos** y ninguna
 * guarda de recuento lo vería. Así que la ausencia se marca:
 *
 *   · el `case` es **explícito** —un `null` DECLARADO, no un `undefined` que se
 *     cuela por el `default`—;
 *   · y la COLUMNA emite `data-f33-sin-cablear="<kinds>"`, **marcador de sonda
 *     y no estilo** (mismo precedente que `data-fila`, que se aceptó con su
 *     antes/después a umbral cero). Así el hueco es **contable y localizable**
 *     por el comparador en vez de invisible.
 *
 * El comparador de dos lados **tiene que verlo** como `nModulos: orig N →
 * clon N−k` en esas 7 rutas. Eso no es un fallo del clon: es el hallazgo
 * declarado, y está fichado en `PENDIENTES-QA.md` §F3-3-CUATRO-SIN-CABLEAR.
 * ═════════════════════════════════════════════════════════════════════════ */
const SIN_CABLEAR = new Set<ModuloPagina["kind"]>(["video-pagina", "slider-completo", "slider", "mapa"]);

/* ── Medidas → CSS ───────────────────────────────────────────────────────── */

const css = (m: MedidaKb | null | undefined): string | null =>
  !m || m.valor === null || m.valor === undefined ? null : m.unidad === "pct" ? `${m.valor}%` : `${m.valor}px`;

const cssMovil = (m: MedidaKb | null | undefined): string | null =>
  !m || m.movilValor === null || m.movilValor === undefined
    ? null
    : m.movilUnidad === "pct"
      ? `${m.movilValor}%`
      : `${m.movilValor}px`;

/** Ver la regla 2 de la cabecera: el prefijo lo pone quien llama y es obligatorio. */
function vars(prefijo: "f33s" | "f33f" | "f33m", pares: Record<string, MedidaKb | null | undefined>): CSSProperties {
  const s: Record<string, string> = {};
  for (const [k, m] of Object.entries(pares)) {
    const v = css(m);
    const mv = cssMovil(m);
    if (v !== null) s[`--${prefijo}-${k}`] = v;
    if (mv !== null) s[`--${prefijo}-${k}-movil`] = mv;
  }
  return s as CSSProperties;
}

/**
 * La PIEL de un titular → variables. Una propiedad ausente **no se emite**.
 * `lh` va en RAZÓN y sin unidad, que es como está medido y como Divi lo
 * escribe: `1.25` sobre `fs` 44 da 55 y sobre 35 da 43.75, que es lo que el
 * original hace al apilar. En px daría el mismo número a los dos anchos, que es
 * un **defecto de rango** invisible a 1440.
 */
function varsPiel(prefijo: string, p: PielKb | null | undefined): Record<string, string> {
  const s: Record<string, string> = {};
  if (!p) return s;
  if (p.fs !== null && p.fs !== undefined) s[`${prefijo}-fs`] = `${p.fs}px`;
  if (p.lh !== null && p.lh !== undefined) s[`${prefijo}-lh`] = `${p.lh}`;
  if (p.fw !== null && p.fw !== undefined) s[`${prefijo}-fw`] = `${p.fw}`;
  if (p.color) s[`${prefijo}-color`] = p.color;
  if (p.align) s[`${prefijo}-align`] = p.align;
  if (p.movilFs !== null && p.movilFs !== undefined) s[`${prefijo}-movil-fs`] = `${p.movilFs}px`;
  return s;
}

/* ── El módulo ───────────────────────────────────────────────────────────── */

/** ¿lleva ancho de módulo? Decide la clase que activa el centrado. */
const conAncho = (m: ModuloPagina) => m.anchoPct !== undefined && m.anchoPct !== null && m.anchoPct !== 100;

function estiloModulo(m: ModuloPagina): CSSProperties {
  const s: Record<string, string> = {
    ...(vars("f33m", { mt: m.ritmo?.mt, mb: m.ritmo?.mb, pb: m.ritmo?.pb }) as Record<string, string>),
  };
  /* `anchoPct` se emite en % y no en px: la razón se conserva a los dos anchos.
   * Y con él va el centrado, que lo aplica `.f33-ancho` y no un número. */
  if (conAncho(m)) s["--f33m-w"] = `${m.anchoPct}%`;
  return s as CSSProperties;
}

function Modulo({ m }: { m: ModuloPagina }) {
  const style = estiloModulo(m);
  const ancho = conAncho(m) ? " f33-ancho" : "";

  switch (m.kind) {
    /**
     * `texto-pagina` — **151 instancias en 29 de 32 páginas**, el tipo
     * mayoritario. Va CRUDO porque es la frontera declarada de este proyecto:
     * *a partir del contenedor de contenido, el contenido lleva su propia
     * estructura dentro y se declara RICO*. El censo lo respalda: 94/151 traen
     * encabezado, 27/151 `<a href>` y 3/151 un `<img>` DENTRO del texto.
     */
    case "texto-pagina":
      return (
        <div
          className={`f33-modulo f33-texto${ancho}`}
          style={{
            ...style,
            ...(m.titulares ?? []).reduce<Record<string, string>>(
              (acc, t) => ({ ...acc, ...varsPiel(`--f33h-${t.nivel}`, t) }),
              {},
            ),
          }}
          dangerouslySetInnerHTML={{ __html: m.html }}
        />
      );

    /**
     * `imagen-pagina` — **71 instancias**. `src` y `srcExterno` son
     * EXCLUYENTES y lo impone el esquema (`validaOrigenImagen`): 70 local · 1
     * externo. D2 (98.ª) decidió dejar absoluto el de `upload.wikimedia.org`,
     * así que aquí **no se normaliza**: se emite lo que el dato traiga.
     */
    case "imagen-pagina": {
      const src = m.src ?? m.srcExterno ?? null;
      /* Un módulo de imagen sin origen no es «una imagen vacía»: es un dato que
       * el esquema no debería haber dejado pasar. Se dice, no se pinta un hueco. */
      if (!src) throw new Error(`CuerpoPagina: módulo \`imagen-pagina\` sin \`src\` ni \`srcExterno\`.`);
      const img = <img src={src} alt={m.alt ?? ""} />;
      return (
        <div className={`f33-modulo f33-imagen${ancho}`} style={style}>
          {m.href ? (
            <a href={m.href} {...(m.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {img}
            </a>
          ) : (
            img
          )}
        </div>
      );
    }

    /**
     * `boton-pagina` — 13 instancias. `piel` viaja con `conDefecto`, así que
     * **ausente ⇒ `defecto`**: el dato omite lo igual al defecto y aquí se
     * vuelve a leer así. La piel `azul` es `.boton-azul`, que es una clase del
     * tema y no un `button` — el `grep` que la buscó por `button` dio **cero**
     * (§sondas 4 cometida sobre un filtro).
     */
    case "boton-pagina":
      return (
        <div className={`f33-modulo f33-boton${ancho}`} style={style}>
          <a
            className={`et_pb_button${m.piel === "azul" ? " boton-azul" : ""}`}
            href={m.href}
            {...(m.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {m.label}
          </a>
        </div>
      );

    /**
     * `codigo` — 9 instancias en 9 páginas. Es HTML del editor servido tal
     * cual; sus CUATRO ejes de ritmo salieron **SIN ESCRIBIR**, así que aquí no
     * se emite ninguno que el dato no traiga (lo hace `estiloModulo` solo).
     */
    case "codigo":
      return (
        <div
          className={`f33-modulo f33-codigo${ancho}`}
          style={style}
          dangerouslySetInnerHTML={{ __html: m.html }}
        />
      );

    /**
     * `toggle` — 10 instancias en 5 páginas. `nivel` viaja con `conDefecto` a
     * **5** (`et_pb_toggle_title` sirve `h5` en 10/10), así que ausente ⇒ 5.
     *
     * ⚠ **Se emite CERRADO, que es como el original lo sirve** — y es
     * justamente por eso que los 30 `video-pagina` de dentro no tienen caja que
     * medir. Abrirlo por defecto «para que se vea» sería inventar un estado que
     * el original no sirve.
     */
    case "toggle": {
      const H = `h${m.nivel ?? 5}` as "h2" | "h3" | "h4" | "h5" | "h6";
      /* Clases LEÍDAS del corpus servido, no recordadas
       * (`hubs-kb/centro-de-ayuda/kunak-air/index.html`):
       *   et_pb_module et_pb_toggle et_pb_toggle_<n> et_pb_toggle_item  et_pb_toggle_close
       *   et_pb_toggle_title · et_pb_toggle_content clearfix
       * El índice `et_pb_toggle_<n>` se omite: es el contador de Divi y sólo lo
       * necesita el CSS compilado por página, que el clon no reproduce. */
      return (
        <div
          className={`f33-modulo f33-toggle et_pb_module et_pb_toggle et_pb_toggle_item et_pb_toggle_close${ancho}`}
          style={style}
        >
          <H className="et_pb_toggle_title">{m.titulo}</H>
          <div className="et_pb_toggle_content clearfix" dangerouslySetInnerHTML={{ __html: m.cuerpo }} />
        </div>
      );
    }

    /**
     * `blurb` — 22 instancias en 3 páginas. **Se CONSUME de `MODULOS_KB`**, no
     * se re-declara (clase C7), así que su forma es la misma que ya renderiza
     * KB y su piel es un GRUPO y no un array por nivel: Divi da **un** control
     * aquí, y compila contra `.et_pb_module_header` — que es lo que hizo que un
     * censo diera «0 overrides de titular en blurb» buscando `h[1-6]`.
     */
    case "blurb": {
      const H = `h${m.nivel ?? 4}` as "h2" | "h3" | "h4" | "h5" | "h6";
      return (
        <div
          className={`f33-modulo f33-blurb${m.alineacion === "center" ? " f33-blurb-center" : ""}${ancho}`}
          style={{ ...style, ...varsPiel("--f33blurb", m.piel) }}
        >
          {m.imagen ? (
            <span className="et_pb_main_blurb_image">
              <img src={m.imagen} alt={m.alt ?? ""} />
            </span>
          ) : null}
          <div className="et_pb_blurb_container">
            <H className="et_pb_module_header">{m.titulo}</H>
            {m.descripcion ? (
              <div className="et_pb_blurb_description" dangerouslySetInnerHTML={{ __html: m.descripcion }} />
            ) : null}
          </div>
        </div>
      );
    }

    /**
     * `icono` — 3 instancias en **1 página** (`/es/soporte/`). Se pinta el
     * CARÁCTER servido tal cual, que es lo que el original emite. **No es una
     * decisión de modelo**: con n = 1 página, enum cerrado / carácter libre /
     * subida de imagen producirían un render idéntico —**cero instancias
     * separadoras**— y por eso es una transcripción a la espera de la segunda
     * página (ficha `F3-3-ICONO-DATO`).
     *
     * Se pinta, a diferencia de los cuatro de arriba, porque **no hace falta
     * inventar ningún valor**: el dato trae el carácter y sus tres ejes de
     * ritmo salieron SIN ESCRIBIR, o sea que no se emite ninguno.
     */
    case "icono":
      return (
        <div className={`f33-modulo f33-icono${ancho}`} style={style}>
          <span className="et_pb_icon" aria-hidden="true">
            {m.icono}
          </span>
          {m.texto ? <span className="f33-icono-texto">{m.texto}</span> : null}
        </div>
      );

    /* ── LOS CUATRO QUE NO SE PINTAN — ver la cabecera ─────────────────────
     * `null` DECLARADO y no `undefined` colado: la diferencia es que éste sale
     * en `data-f33-sin-cablear` y se puede contar. */
    case "video-pagina":
    case "slider-completo":
    case "slider":
    case "mapa":
      return null;

    /**
     * ⚠⚠ **EL `default` QUE TIRA, Y NO ES PARANOIA: EL HUECO YA SE COBRÓ SEIS
     * PÁGINAS.** En React `undefined` es un valor de retorno **legal** que
     * renderiza NADA, así que un `switch` sin `default` borra contenido en
     * silencio y el silencio llega hasta el HTML servido **con un 200**.
     *
     * Pasó exactamente aquí al lado: el discriminador que llega al render se
     * llama `kind` y el componente de KB miraba `blockType`. Las 6 páginas se
     * sirvieron con sus filas, sus columnas y **cero módulos**, con `npm run
     * check`, `qa:slugs`, `qa:manifiesto` y el `prerender-manifest` **los
     * cuatro en verde**.
     *
     * Mejor una página que revienta que once que mienten — el defecto se pone
     * en la dirección que GRITA (§sondas 6).
     */
    default: {
      const desconocido = m as { kind?: string };
      throw new Error(
        `CuerpoPagina: módulo con \`kind\` desconocido ("${desconocido.kind}"). Los once de la unión son ` +
          `texto-pagina · imagen-pagina · boton-pagina · codigo · toggle · video-pagina · blurb · ` +
          `slider-completo · slider · mapa · icono. Ojo: el discriminador del RENDER es \`kind\` ` +
          `(lo pone la VUELTA), no el \`blockType\` que guarda Payload.`,
      );
    }
  }
}

/* ── Columna · fila · sección ────────────────────────────────────────────── */

/**
 * ⚠⚠ **LO QUE ESTA COLUMNA NO PUEDE DECIRLE A LA HOJA, Y POR QUÉ NO SE INVENTA
 * (CMS-5, `ESQUEMA §2j.8`).**
 *
 * El default de `mb` de un módulo **depende del ANCHO DE LA FILA**, no del tipo
 * de columna — medido en dos arquetipos: un `1_2` de **585.13** en fila de
 * 1238.39 lleva **34.0469**, y un `2_3` de **591.11** —casi el mismo ancho de
 * columna— en fila de 911.75 lleva **25.0625**. O sea que la hoja necesita el
 * ancho de FILA para resolverlo.
 *
 * Y ese ancho **lo decide el RÉGIMEN** (`B-` ⇒ 1238.39 · `BT` ⇒ 911.75), que
 * **este documento no lleva**: derivado, ningún campo separa `BT` de `B-`
 * (**52 pares indistinguibles**) y la ruta queda **refutada** por 2 separadoras.
 *
 * **La primera versión de este componente emitía `data-fila-ancho` derivándolo
 * del REPARTO DE COLUMNAS** —`4_4` sola ⇒ «completa», si no «repartida»—. Eso
 * es exactamente **la variable equivocada**: es *tipo de columna* disfrazado de
 * *ancho de fila*, que es el par que `CLAUDE.md` documenta como el caso donde
 * dos variables confundidas dan la regla al revés. Se retira: **mientras CMS-5
 * no se decida, la hoja NO puede resolver el default y el componente no le
 * miente diciéndoselo.**
 */
function Columna({ c }: { c: ColumnaPagina }) {
  const modulos = c.modulos ?? [];
  /* Los kinds que esta tanda no pinta, NOMBRADOS en el marcado para que el
   * hueco sea contable. Marcador de sonda, no estilo. */
  const sinCablear = [...new Set(modulos.filter((m) => SIN_CABLEAR.has(m.kind)).map((m) => m.kind))];
  return (
    <div
      className={`f33-columna f33-col-${c.ancho}`}
      data-columna={c.ancho}
      {...(sinCablear.length ? { "data-f33-sin-cablear": sinCablear.join(" ") } : {})}
    >
      {modulos.map((m, i) => (
        <Modulo key={i} m={m} />
      ))}
    </div>
  );
}

/**
 * La FILA. `data-fila` es el marcador que permite identificarla desde una
 * sonda: el original la nombra con `.et_pb_row` y el clon no tenía equivalente,
 * así que un heurístico *«bloque centrado más estrecho que su sección»* bajaba
 * a las diapositivas de un slider y fabricaba un Δ que no existía.
 */
function Fila({ f }: { f: FilaPagina }) {
  return (
    <div className="f33-fila" data-fila="" style={vars("f33f", { pt: f.pt, pb: f.pb, mt: f.mt, mb: f.mb })}>
      {f.columnas.map((c, i) => (
        <Columna key={i} c={c} />
      ))}
    </div>
  );
}

function Seccion({ s }: { s: SeccionPagina }) {
  return (
    <section className="f33-seccion" style={vars("f33s", { pt: s.pt, pb: s.pb })}>
      {/* Los *fullwidth* que cuelgan de la sección SIN fila — 2 medidos, los dos
          `slider-completo`, o sea que hoy los dos caen en SIN_CABLEAR. La rama
          existe igual: si sólo hubiera filas, esas 2 instancias no se podrían
          expresar y el fallo sería silencioso. */}
      {(s.modulosSueltos ?? []).map((m, i) => (
        <Modulo key={`suelto-${i}`} m={m} />
      ))}
      {(s.filas ?? []).map((f, i) => (
        <Fila key={i} f={f} />
      ))}
    </section>
  );
}

/**
 * El cuerpo entero. Recibe **los dos canales** porque el arquetipo tiene dos y
 * son excluyentes en el dato medido:
 *
 *   · `bloques` — el builder, 30 de 31;
 *   · `cuerpoClasico` — el régimen `--`, **1 de 31**
 *     (`/es/politica-de-seguridad-de-la-informacion/`).
 *
 * ⚠ **Que no venga NINGUNO no es «una página vacía»: es un dato que no se puede
 * servir**, y se dice en voz alta. Un documento sin ninguno de los dos se
 * emitiría con cabecera, pie y nada en medio, respondiendo **200** — que es
 * exactamente §*una ruta que responde 200 no prueba que sirva CONTENIDO*, el
 * modo de fallo que costó las seis páginas de KB.
 */
export function CuerpoPagina({
  bloques,
  cuerpoClasico,
  ruta,
}: {
  bloques?: SeccionPagina[] | null;
  cuerpoClasico?: string | null;
  ruta: string;
}): ReactNode {
  const secciones = bloques ?? [];
  if (!secciones.length && !cuerpoClasico)
    throw new Error(
      `CuerpoPagina: «${ruta}» no trae NI \`bloques\` NI \`cuerpoClasico\`. Los dos son opcionales por ` +
        `separado (S2, §2j.3c) y eso permite que falte UNO, no los dos: sin ninguno la página se serviría ` +
        `con 200 y sin contenido.`,
    );

  if (cuerpoClasico && !secciones.length)
    /* El régimen `--`: HTML clásico de WordPress en `entry-content`. Mismo
     * `campoHtml` y mismo `validaHtmlCorpus` que las otras cuatro colecciones,
     * con su contrato medido en 209/209 documentos. */
    return <div className="f33-clasico entry-content" dangerouslySetInnerHTML={{ __html: cuerpoClasico }} />;

  return (
    <>
      {secciones.map((s, i) => (
        <Seccion key={i} s={s} />
      ))}
    </>
  );
}
