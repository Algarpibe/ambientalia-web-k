import type { FirmaA } from "@/types/kunak";

/**
 * LA FICHA DE AUTOR — 117.ª · ESCALÓN 3.
 *
 * El original la sirve en **152 de 152** entradas de blog y el clon **no la
 * pintaba**: `ficha-autor-revisor` aparecía en **0 de 155** ficheros de código.
 * Lo que había era `CascaronA.AUTORIA`, una **constante** de texto plano — sin
 * caja, sin foto y sin enlace.
 *
 * ── POR QUÉ LA CONSTANTE ERA UN CAMPO ────────────────────────────────────
 * Su comentario decía: *«idéntica en las 11 instancias que la llevan, así que
 * es plantilla, no campo»*. El discriminador es el correcto para el régimen
 * plantillado —varianza cero entre instancias ⇒ plantilla— **y el dominio no
 * podía contestarlo**: las 11 transcritas a mano las firma TODAS `kunak`.
 * Barridas las 152: **8 proemios y 5 firmantes**, la constante acierta en
 * **141** y falla en **11**. §*una regla derivada sobre un dominio donde el
 * caso NO SE DA está SIN PROBAR para ese caso*.
 *
 * ── DOS EMPLAZAMIENTOS, NO UNO — y es MEDIDO ─────────────────────────────
 * El documento trae **dos** `.ficha-autor-revisor` con el MISMO HTML, y a cada
 * ancho **una está `display:none`**:
 *
 *   · a **1440** se pinta la de la columna LATERAL (`et_pb_text_5_tb_body`),
 *     caja **258.5 × 136**;
 *   · a **390** la de la PRINCIPAL (`et_pb_text_4_tb_body`), caja **335.39 × 115**.
 *
 * `CascaronA.AutoriaA` ya reproducía ese reparto para el texto plano; aquí se
 * conserva, porque el ritmo de cada columna depende de cuál esté viva.
 *
 * ── LOS VALORES SON `getComputedStyle` SOBRE EL ORIGINAL, NO `grep` ───────
 * §El principio: *el veredicto lo da `getComputedStyle` sobre el original, no
 * `grep` sobre las hojas* — la pregunta no es si una regla existe, es CUÁL
 * GANA. Medidos con `qa:ficha-cmp`, congelados en `medidas/ficha-cmp.json`.
 *
 * ⚠⚠ **Y HUBO QUE ASENTAR ANTES DE MEDIR, o el número no era estable.** La
 * hoja declara `transition: all .3s` sobre el `<img>`, así que
 * `getComputedStyle` devuelve **un fotograma de la animación**: tres corridas
 * del mismo nodo a 1440 dieron `border-radius` **0%**, **50%** y **17.3042%**.
 * Con `settle()` en los DOS lados, dos corridas independientes dan **50% y 3px
 * idénticos**. Un valor que cambia entre corridas del mismo código no es un
 * dato del original: es el instrumento midiendo a destiempo.
 *
 * Valores asentados (idénticos a los dos anchos salvo la caja):
 *   contenedor  `padding: 10px 13px 14px` · `border-radius: 10px` ·
 *               `background: #ecedf0` (`--gris-claro`)
 *   `.revisor`  `display:flex` · `align-items:center` · `margin-inline-start:-23px`
 *   `.revisor a` `margin-top:-23px`
 *   `img`       64×64 con `min-width:64px` · `border-radius:50%` ·
 *               `border:3px solid transparent` · `display:block`
 *   `.revisor p` `margin-inline-start:8px`
 *   `.autor`    `margin-inline-start:3px` · `margin-top:7px` (sin foto)
 *   `p`         `14px / 1.5` ⇒ **21px** de interlínea
 *   `a`         `font-weight:bold`, y en hover `#0075C9` (`--azul`)
 *
 * ⚠ El `line-height` va en el `<p>`, que **es el bloque que genera el strut**.
 * Ponerlo sólo en el `<a>` —que computa `display:inline`— daría los ejes de
 * tipografía a Δ0 y el ALTO mal: es el defecto que costó **+197.65** en una
 * barra de menú (§*un valor bien leído puede estar escrito en el elemento que
 * no manda*).
 */

/** `--gris-claro` y `--azul` del tema, leídos de la hoja servida. */
const GRIS_CLARO = "#ecedf0";
const AZUL = "#0075C9";

/**
 * El hueco de la foto **conserva su caja aunque no haya bytes**.
 *
 * Las 5 fotos de la ficha están **0 capturadas** (§PASO 0b), y traerlas es RED
 * —una campaña con su encargo—. Las dos salidas malas serían: quitar el hueco
 * (mueve la maquetación por una razón que no es del original) o enlazar
 * `kunakair.com` en caliente (`CLAUDE.md`: *nunca se enlaza en caliente*).
 * Se reserva la caja exacta y se declara el hueco.
 */
function Retrato({ firma }: { firma: FirmaA }) {
  const clases =
    "block h-[64px] w-[64px] min-w-[64px] rounded-full border-[3px] border-transparent transition-all duration-300 hover:border-[color:var(--ficha-azul)]";
  if (firma.autor.foto?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={firma.autor.foto.src} alt={firma.autor.foto.alt ?? firma.autor.nombre} className={clases} />
    );
  }
  return (
    <span
      aria-hidden="true"
      data-foto-pendiente={firma.autor.fotoOrigen ?? ""}
      className={`${clases} bg-transparent`}
    />
  );
}

/** Un firmante: su retrato (sólo en el hueco `revisor`) y su proemio. */
function Papel({ firma, hueco }: { firma: FirmaA; hueco: "revisor" | "autor" }) {
  /* `/author/*` NO se emite, así que el `href` se queda apuntando al ORIGINAL
     (§Regla de rutas locales) y por tanto es externo. Medido: 612 absolutos y
     0 locales en las 152 del original. */
  const href = `https://kunakair.com/es/author/${firma.autor.slug}/`;
  const enlace = (contenido: React.ReactNode) => (
    <a
      href={href}
      title={firma.autor.nombre}
      target="_blank"
      rel="noreferrer"
      className="font-bold hover:text-[color:var(--ficha-azul)]"
    >
      {contenido}
    </a>
  );

  /* El proemio se sirve con `‹NOMBRE›` donde va el enlace. Se parte por ese
     marcador en vez de reconstruir la frase: así el texto es VERBATIM y el
     enlace cae exactamente donde el original lo pone. */
  const partes = (firma.proemio ?? "‹NOMBRE›").split("‹NOMBRE›");

  if (hueco === "revisor") {
    return (
      <div className="flex items-center ms-[-23px]">
        <a href={href} title={firma.autor.nombre} target="_blank" rel="noreferrer" className="mt-[-23px] font-bold">
          <Retrato firma={firma} />
        </a>
        <p className="ms-[8px] text-[14px] leading-[1.5]">
          {partes[0]}
          {enlace(firma.autor.nombre)}
          {partes[1] ?? ""}
        </p>
      </div>
    );
  }
  return (
    <div className="ms-[3px] mt-[7px]">
      <p className="text-[14px] leading-[1.5]">
        {partes[0]}
        {enlace(firma.autor.nombre)}
        {partes[1] ?? ""}
      </p>
    </div>
  );
}

/**
 * La ficha entera. `donde` reproduce el reparto del original: `principal` es la
 * que se ve a 390 y `lateral` la que se ve a 1440 — cada una escondida al otro
 * ancho, igual que el original las esconde.
 */
export function FichaAutorA({ firmas, donde }: { firmas: FirmaA[]; donde: "principal" | "lateral" }) {
  if (!firmas?.length) return null;
  const visibilidad =
    donde === "principal"
      ? "mb-[30px] min-[981px]:hidden"
      : "hidden min-[981px]:mb-[34.05px] min-[981px]:block";
  return (
    <div
      className={`ficha-autor-revisor rounded-[10px] pt-[10px] pe-[13px] pb-[14px] ps-[13px] text-[#333] ${visibilidad}`}
      style={{ backgroundColor: GRIS_CLARO, ["--ficha-azul" as string]: AZUL }}
    >
      {firmas.map((f, i) => (
        <Papel key={`${f.autor.slug}-${i}`} firma={f} hueco={i === 0 ? "revisor" : "autor"} />
      ))}
    </div>
  );
}
