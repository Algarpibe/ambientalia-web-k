import { BLOQUE_RELACIONADOS } from "@/lib/arquetipo-a";
import type { EntradaBlog } from "@/types/kunak";

import { FilaA } from "./CascaronA";

/**
 * `section#2` — «También te puede interesar». La lleva **83 de las 149**
 * entradas de blog y ninguna otra forma; es la única variación intra-forma que
 * el censo encontró, y **no se sabe qué la decide** (A-SP1/A-SP2).
 *
 * ── Por qué NO es una variante de `UltimosArticulos` ──────────────────────
 * `UltimosArticulos` es un componente compartido por las 17 rutas ya
 * verificadas, con cuatro variantes que codifican **geometrías de sección y
 * fila distintas por página**. La de aquí es una quinta, medida y distinta:
 * sección `pt 57.59`, fila `pt 28.8 · pb 14.39`, rótulo de 65 con `mb 34.05`,
 * y una segunda fila con `pb 72` y columnas **367.38 + 802.88**.
 *
 * Añadirle una quinta variante habría puesto en riesgo 17 rutas verdes a cambio
 * de no repetir un `<section>`. La regla del proyecto —extraer cuando un
 * componente **se reutiliza**— no aplica: esto no es el mismo componente con
 * otro contenido, es otra maquetación.
 *
 * ── El rótulo y el botón vienen en TRES idiomas, y dos están ocultos ──────
 * Medido: `text#7` (en) y `text#8` (ar) dan **w 0 · h 0** a los dos anchos, y
 * lo mismo `button#0` y `button#2`. El clon emite solo el español. Desviación
 * deliberada, en `PENDIENTES-QA.md`: reproducir dos módulos invisibles no mueve
 * un píxel y sí mete texto inglés y árabe en una página española.
 *
 * ── ⚠ SIN PROBAR (A-SP15): la geometría de las tarjetas ───────────────────
 * El módulo `blog#0` mide **458.52 de alto a 1440** y eso es lo único medido de
 * él. El interior de la tarjeta —retícula, imagen, fecha, tipografía— **no se
 * ha medido**, entre otras cosas porque el original **sortea los 3 posts en
 * cada carga** (P4) y ésa es justo la región de ruido de hasta 81 px que
 * `CLAUDE.md` documenta. No se da por verificado: se anota.
 *
 * Y la consulta tampoco puede ser fiel hoy: el original elige entre **149**
 * entradas y el clon tiene **7**. La lista real llega con el extractor de F2-2.
 */
/**
 * ⚠ **`catalogo` LLEGA POR PROP, y el componente SIGUE SIENDO SÍNCRONO. No es
 * estilo: es §F2-3-ASYNC-HIJO, un mecanismo medido.**
 *
 * Al migrar `/[slug]` la primera vez se hizo `async` este componente para que
 * leyera el CMS. `qa:html-cmp` marcó **6** rutas en vez de 4: las 6 con
 * `relacionados: true`, y **dos de ellas sin una sola diferencia de dato** —
 * `/contador-…` con **Δ 0 bytes** y el marcado distinto.
 *
 *   > **Abrir un límite asíncrono dentro del árbol cambia el HTML servido
 *   > aunque el dato sea idéntico.** Y `clon-base` no lo caza: mide geometría, y
 *   > la geometría no se movió.
 *
 * Volverlo síncrono devolvió esas 2 a Δ0 (`html-f23-slug-REVERTIDA-1-async.json`
 * → `-2-t4a.json`, 6 → 4). Así que el dato se espera **en la página**, que ya es
 * asíncrona, y baja por prop. Un `await` aquí dentro es un cambio de maquetación
 * disfrazado de refactor.
 */
export function RelacionadosA({ excluir, catalogo }: { excluir: string; catalogo: EntradaBlog[] }) {
  const posts = catalogo.filter((e) => e.slug !== excluir).slice(0, 3);

  return (
    <section className="w-full bg-white pt-[50px] min-[981px]:pt-[57.59px]">
      <FilaA className="pt-[30px] pb-[3.89px] min-[981px]:pt-[28.8px] min-[981px]:pb-[14.39px]">
        <p className="mb-[30px] text-[15px] font-extrabold leading-[30.6px] tracking-[0.1px] text-[#0075C9] min-[981px]:mb-[34.05px]">
          {BLOQUE_RELACIONADOS.titulo}
        </p>

        <div className="grid gap-[30px] min-[981px]:grid-cols-3">
          {posts.map((p) => (
            <a key={p.slug} href={`/${p.slug}`} className="group block">
              {p.imagenDestacada && (
                <span className="block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imagenDestacada.src}
                    alt={p.imagenDestacada.alt ?? ""}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-110"
                  />
                </span>
              )}
              <span className="mt-[15px] block text-[18px] leading-[30.6px] text-[#333] group-hover:text-[#0075C9]">
                {p.titulo}
              </span>
              <span className="block text-[14px] leading-[30.6px] text-[#7F8798]">
                {p.fechaPublicacion}
              </span>
            </a>
          ))}
        </div>
      </FilaA>

      <FilaA className="pb-[72px]">
        <div className="min-[981px]:flex">
          <div className="min-[981px]:w-[29.66%]" />
          <div className="min-[981px]:w-[64.84%] min-[981px]:pl-[5.5%]">
            {/* `mt 25 · mb 34.05` del módulo; el `<a>` de dentro va a
                `padding: 7.5px 22.5px 9px 40.5px`, 15/25.5 peso 700. */}
            <div className="mt-[25px] text-right min-[981px]:mb-[34.05px]">
              <a
                href={BLOQUE_RELACIONADOS.boton.href}
                className="inline-block rounded-[3px] bg-[#0075C9] pt-[7.5px] pr-[22.5px] pb-[9px] pl-[40.5px] text-[15px] font-bold leading-[25.5px] text-white transition-opacity hover:opacity-80"
              >
                {BLOQUE_RELACIONADOS.boton.label}
              </a>
            </div>
          </div>
        </div>
      </FilaA>
    </section>
  );
}
