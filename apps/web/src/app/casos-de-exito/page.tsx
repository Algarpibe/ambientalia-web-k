import type { Metadata } from "next";

import { BandaFiltros, BotonSector } from "@/components/listados/BandaFiltros";
import { PaginaTema } from "@/components/listados/PaginaTema";
import { TarjetaCaso } from "@/components/listados/TarjetaCaso";
import { rutaDe } from "@/lib/casos";
import { casosDelIndice } from "@/lib/cms/casos";
import { getTermino, hrefTermino } from "@/lib/taxonomia-sectores";

/**
 * `L5` — `/casos-de-exito`, el ÍNDICE de la colección `casos`.
 *
 * Spec: `docs/research/listados-hubs/components/indice-casos.spec.md`.
 * Cascarón compartido con `L3`: `components/listados/PaginaTema.tsx`.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LAS CUATRO COSAS QUE DECIDEN ESTA PÁGINA, Y LAS CUATRO ESTÁN MEDIDAS
 *
 * **1 · NO PAGINA.** Sirve **las 57 tarjetas en UNA página** y no pinta
 * paginador (`presente: false`, sin `<link rel=next>`). `/casos-de-exito/page/2`
 * **no es una ruta**: es `D2.4·duplicado`, con canonical a la primera, y **no se
 * construye**. Rebanar aquí sería inventar un comportamiento que el original no
 * tiene, y se vería en `nTarjetas` y en `docH` a la vez.
 *
 * **2 · EL ORDEN es `fechaPublicacion` DESC** — `casosDelIndice()`. Es la
 * decisión `CMS-ORDEN-L2` (§7g), medida contra el orden SERVIDO: **57/57** con
 * **56 posiciones separadoras** frente a tres rivales. Cruzado además contra la
 * DB en la 82.ª: los 57 slugs en el orden del canal **sin recortar**.
 *
 * **3 · NO LLEVA EXTRACTO.** Medido dos veces y por dos canales (114 instancias
 * del corpus + el original vivo). La tarjeta de caso es foto · taxonomías ·
 * cliente · titular, y nada más. Ponerle uno por simetría con `L3` —que sí lo
 * tiene— sería inventar contenido.
 *
 * **4 · LA BANDA DE FILTROS ENTRA INERTE, y es una desviación DECLARADA.** Los
 * 12 botones son **geometría obligatoria** (210.6 px entre el `h1` y el
 * listado); lo que no se construye es el **filtrado**, que consume la relación
 * `caso → sector` como criterio de visibilidad y se decide en **F3-4**
 * (§LH-C6-FILTRO-L5). *«Sin FILTRADO»* y *«sin BANDA»* son dos cosas: omitir la
 * banda sería un defecto de 264.6 px con una desviación por coartada.
 *
 * ── ⚠ LA 4.ª SECCIÓN DE PIE NO SE COMPONE AQUÍ ───────────────────────────
 * `L5` sirve **CUATRO** secciones de pie y las otras cuatro formas de listado
 * TRES — varianza en el cascarón, que es justo donde el arquetipo A midió cero.
 * La 4.ª es la banda CTA de la **familia CASOS**, y ya la emite
 * `<Footer tipo="caso">`, que es lo que `PaginaTema` pasa con `variante="casos"`.
 * Por eso esta página **no** compone ninguna banda: la varianza del pie ya está
 * construida y verificada en el singular del caso.
 *
 * ── ⚠ LA BASE BAJA AL ESTRECHAR, y es la única forma que lo hace ──────────
 * `458.09` @1440 → `473.08` @390 (`BANDA.indiceCasos`). En `L3` va 225 → 136.58.
 * No es una anomalía a corregir: su `header.et-l--header` lleva una TERCERA fila
 * exclusiva del índice, y esa fila **crece** al estrechar porque su texto
 * envuelve. **Calibrarla contra la base de las otras formas la rompe a 390.**
 */
export const metadata: Metadata = {
  /* Verbatim de Yoast en el original. El `<title>` NO repite «Kunak» al final,
     al revés que `L3` — se transcribe lo servido. */
  title: "Proyectos de monitorización ambiental con sensores Kunak AIR",
  description:
    "Descubre los proyectos de monitorización ambiental y control de la contaminación llevados a cabo con la tecnología de Kunak.",
  alternates: { canonical: "/casos-de-exito" },
};

/**
 * EL ORDEN DE LOS 12 BOTONES — **transcrito, y aquí está por qué**.
 *
 * ⚠⚠ **No es el de `TERMINOS_SECTOR`**, que va por frecuencia y acierta **3 de
 * 11**. Y tampoco se puede decir cuál de sus derivaciones es: contados los
 * candidatos, **tres** aciertan **11/11** —`nombre` ascendente en locale `es`,
 * `nombre` ascendente por punto de código y `slug` ascendente— y entre los tres
 * hay **0 posiciones SEPARADORAS**. Los tres son funciones distintas (difieren
 * en cuanto haya un acento o una `ñ` en juego), pero **este dominio no las
 * distingue**: elegir una sería escribirla, no elegirla
 * (§*dos modelos que predicen lo mismo en todo tu dominio son uno solo*).
 *
 * Así que se transcribe el orden MEDIDO, que es el dato y no puede estar mal, y
 * la indeterminación se declara en vez de resolverse a ojo. Con **n = 1** —y n=1
 * aquí es **la población, no la muestra**— no hay segunda instancia que separe.
 *
 * Fuente: el canal SIN RECORTAR, `corpus/fase-3/listados/casos-de-exito/index.html`.
 */
const ORDEN_BOTONES = [
  "edar",
  "industria",
  "investigacion-consultoria",
  "metalurgia",
  "mineria",
  "obras",
  "oil-gas-es",
  "olores",
  "puertos",
  "sports",
  "urbano",
] as const;

export default async function IndiceCasosPage() {
  const casos = await casosDelIndice();

  return (
    <PaginaTema
      variante="casos"
      miga={[{ label: "Inicio", href: "/" }, { label: "Casos de éxito" }]}
      /* ⚠ `p.sobretitulo` va **EN FLUJO** y sí empuja al `h1`; el `span.tax-tap`
         de `L3` es absoluto y no. Mismo hueco, dos marcados y dos geometrías. */
      sobretitulo={<p className="sobretitulo">Kunak</p>}
      titulo="Casos de éxito"
      filtros={
        <BandaFiltros variante="casos" titulo="Sectores">
          {/* «Ver todos» es el primero y arranca `is-checked`. Su `data-filter`
              es `*`, no un slug: es el que no filtra. */}
          <BotonSector filtro="*" activo>
            Ver todos
          </BotonSector>
          {ORDEN_BOTONES.map((slug) => (
            <BotonSector key={slug} filtro={`.sector-${slug}`} activo={false}>
              {getTermino(slug).nombre}
            </BotonSector>
          ))}
        </BandaFiltros>
      }
      listado={
        <div className="case-list-content">
          {casos.map((c) => (
            <TarjetaCaso
              key={`${c.prefijo ?? "casos-de-exito"}/${c.slug}`}
              caso={c}
              /* ruta local: las 57 están clonadas, 53 bajo `/casos-de-exito` y
                 4 bajo `/case-studies`. `rutaDe` lo deriva del prefijo. */
              href={rutaDe(c)}
              /* ⚠ El chip de sector apunta AL ORIGINAL a propósito: su destino es
                 el archivo de taxonomía `/es/sector/<slug>/`, que es del grupo B
                 y **no está clonado**. No se sustituye por la página de sector
                 aunque exista — son dos páginas distintas, y cambiarlo sería
                 inventar enrutado. */
              hrefSector={(slug) => hrefTermino(getTermino(slug))}
            />
          ))}
        </div>
      }
    />
  );
}
