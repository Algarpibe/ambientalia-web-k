import { HeaderNav } from "@/components/HeaderNav";
import { BANDA, BandaCabecera } from "@/components/BandaCabecera";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CtaBannerSlider } from "@/components/CtaBannerSlider";
import { ProductosTabs } from "@/components/ProductosTabs";

import { CasoCabecera } from "./CasoCabecera";
import { CasoBloque } from "./CasoBloque";
import { CasoGaleria } from "./CasoGaleria";
import { CasoDetalles } from "./CasoDetalles";

import type { CasoDeExito } from "@/types/kunak";
import { getProductos } from "@/lib/products";
import { CASO_CTA_PIE } from "@/lib/grupo-c-plantilla";

/**
 * ARQUETIPO **CASO DE ÉXITO** — el cuerpo entero de una instancia.
 *
 * Recon `docs/research/grupo-C/` · decisiones C-2 en su `DECISIONES.md` ·
 * modelo en `MODELO.md` · medición de entrada en `MEDICION.md` · Payload en
 * `docs/ESQUEMA-CMS.md` §2b/§2b.1.
 *
 * ── Por qué un componente y no dos `page.tsx` ──────────────────────────────
 * D2 dice que los 57 son **una colección** con el prefijo como campo, así que
 * `/casos-de-exito/[slug]` y `/case-studies/[slug]` tienen que servir
 * exactamente la misma página: si divergieran, el prefijo habría dejado de ser
 * un campo y sería una distinción de contenido por la puerta de atrás. Las dos
 * rutas de `app/` son cascarones de tres líneas sobre esto.
 *
 * (No se hizo con una sola ruta `[prefijo]/[slug]` a propósito: capturaría
 * cualquier primer segmento y convertiría al arquetipo en el comodín del sitio.
 * Dos rutas explícitas emiten **solo** los dos prefijos que existen.)
 *
 * ── El orden de las secciones, medido en el original ───────────────────────
 * migas · `.container`(cabecera + **Necesidad**) · galería · `.container`
 * (**Solución** | **Resultados**, dos columnas) · detalles + mapa ·
 * soluciones · **CTA de pie** · pie estándar de 3 secciones.
 *
 * El reparto de la retícula está medido y sale con varianza cero en 6
 * instancias: contenedor 1152 (80 %), Solución y Resultados **541.44 cada una**
 * dentro de él (hueco 69.12 = 6 %), apiladas a 390 con `mb 48` en Solución.
 *
 * ── Lo que NO se monta cuando el dato no está ──────────────────────────────
 * Galería (48/57), soluciones (53/57) y mapa (56/57) son **opcionales de
 * verdad**: sin dato no hay sección, y eso es un estado normal del arquetipo,
 * no un caso degradado. Los cuatro casos poblados incluyen uno de cada
 * ausencia justamente para que esto se ejercite.
 */
export function CasoPagina({ caso }: { caso: CasoDeExito }) {
  const soluciones = caso.soluciones?.length ? getProductos(caso.soluciones) : null;

  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* La banda que ocupa el hueco de la cabecera (C-QA1). En el original
            la cabecera está EN FLUJO y mide 387; aquí `HeaderNav` es absoluto y
            no ocupa nada, así que sin esto el `h1` caía a −391.6. Mismo patrón
            que los 6 sectores, extraído a componente al usarlo la segunda
            página — la regla de `CLAUDE.md` §Arquitectura. */}
        <BandaCabecera {...BANDA.caso} foto={caso.imagenCabecera} />

        {/* Migas — sección propia del arquetipo, fila al 86 % con `py 12`.
            C-SP8: `Inicio > Casos de éxito > <título>`, y el índice es el
            ESPAÑOL incluso para los 4 del prefijo inglés. Ninguno de los dos
            destinos está clonado, así que apuntan al original.

            `variante="caso"`: interlínea 30.6 y último truncado a 350 con
            elipsis. Las dos medidas, y las dos SOLO de esta plantilla — ver la
            cabecera de `Breadcrumb`. */}
        <Breadcrumb
          variante="caso"
          items={[
            // ruta local: la home ya está clonada — original: https://kunakair.com/es/
            { label: "Inicio", href: "/" },
            // el índice /es/casos-de-exito/ NO está clonado (es una consulta,
            // no un content type: D4). Sigue apuntando al original.
            { label: "Casos de éxito", href: "https://kunakair.com/es/casos-de-exito/" },
            { label: caso.titulo },
          ]}
          rowClassName="mx-auto w-[86%] max-w-[1380px]"
        />

        <article>
          <div className="container mx-auto w-[80%] max-w-[1152px] pt-[33px] md:pt-[60px]">
            <CasoCabecera caso={caso} />
            <CasoBloque
              titulo="Necesidad"
              html={caso.necesidad}
              destacado={caso.destacado}
              className="entry-content-need"
            />
          </div>

          {caso.galeria?.length ? <CasoGaleria imagenes={caso.galeria} /> : null}

          <div className="container mx-auto w-[80%] max-w-[1152px]">
            {/* Dos columnas de 541.44 dentro de 1152 → 47 % y 47 % con el 6 %
                de hueco. A 390 apilan y Solución lleva `mb 48`. */}
            <div className="case-solution-results md:flex md:justify-between">
              <CasoBloque
                titulo="Solución"
                html={caso.solucion}
                className="entry-content-solution mb-[48px] md:mb-0 md:w-[47%]"
              />
              <CasoBloque
                titulo="Resultados"
                html={caso.resultados}
                className="entry-content-results md:w-[47%]"
              />
            </div>
          </div>

          <CasoDetalles caso={caso} />

          {soluciones ? (
            <section className="case-soluciones mb-[30px] mt-[45px] md:mt-[75px]">
              <div className="mx-auto w-[80%] max-w-[1152px]">
                <h2 className="titulo-puntos text-[37px] font-light leading-[37px] tracking-[-0.5px] text-[#333]">
                  Soluciones
                </h2>
                {/* P-C3-4: el caso guarda los `data-id`; **la ficha se proyecta
                    del producto**. `ProductosTabs` es el mismo shortcode
                    `#lista-soluciones` que ya sirven la home y los sectores —
                    se reutiliza tal cual, con `sinTitulo` porque aquí el
                    titular va en su propia fila, como en el sector. */}
                <div className="mt-[30px]">
                  <ProductosTabs items={soluciones} sinTitulo />
                </div>
              </div>
            </section>
          ) : null}
        </article>

        {/* La 4ª sección del pie. P-C3-1: idéntica en los 6 pares → plantilla,
            cero campos (D5). Una sola diapositiva: las otras tres del original
            son los otros idiomas, ocultos por clase en la rama /es/. */}
        <CtaBannerSlider slides={CASO_CTA_PIE} label="Kunak para tu proyecto" />
      </main>

      <Footer tipo="caso" />
      <ScrollToTop />
    </>
  );
}
