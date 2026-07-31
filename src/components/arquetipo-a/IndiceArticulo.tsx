import type { CampoRico } from "@/types/kunak";

import { titularesDe } from "./CuerpoRicoA";

/**
 * ÍNDICE DEL ARTÍCULO — **no es un campo, es una proyección** (`ESQUEMA-CMS.md`
 * §2.2). Se calcula de los `h2` del cuerpo, y renombrar un `h2` mueve su ancla:
 * eso es comportamiento del generador, no dato que migrar (§T6, A-SP9 cerrada).
 *
 * Medido en el original (`a-cascaron-*-2026-07-31-4.json`):
 *
 * | | @1440 | @390 |
 * |---|---|---|
 * | caja | 258.5 de ancho, en la lateral | dentro de la principal, `mt 16 · mb 30 · pt 48` |
 * | rótulo | `<p>` **22 / 30.6 / 300**, `mb 11.2` | igual |
 * | lista | `ul#indice` 14 / 16.8 | **14.4 / 20.16** |
 * | ítem | `li` con `padding 5.6` | `li` con `margin 11.2` |
 *
 * El original lo sirve **dos veces** —uno por columna— y esconde el que no
 * toca, igual que la autoría. Se reproduce igual: el ritmo de cada columna
 * depende de cuál esté vivo.
 *
 * ⚠ **SIN PROBAR (A-SP14).** En la misma página el índice de escritorio trae
 * **21 ítems** y el móvil **16**. No es un error de lectura: son los dos
 * módulos de la misma página, medidos en la misma corrida. Qué los diferencia
 * —¿el de escritorio incluye `h3` y el móvil no?— **no se ha medido**, así que
 * el clon proyecta **solo los `h2` en los dos**, que es lo que §2.2 dice, y la
 * discrepancia queda anotada en vez de cableada.
 */
export function IndiceArticulo({
  cuerpo,
  donde,
}: {
  cuerpo: CampoRico;
  donde: "principal" | "lateral";
}) {
  const titulares = titularesDe(cuerpo);
  if (titulares.length === 0) return null;

  const caja =
    donde === "principal"
      ? "mt-[16px] mb-[30px] pt-[48px] min-[981px]:hidden"
      : "hidden min-[981px]:block min-[981px]:pl-[30px]";

  return (
    <div className={caja}>
      <section className="widget_text widget widget_custom_html resources-sidebar">
        <p className="widgettitle mb-[11.2px] text-[22px] font-light leading-[30.6px] text-[#333]">
          Índice del artículo
        </p>
        <div className="textwidget custom-html-widget">
          <ul
            id="indice"
            className="text-[14.4px] leading-[20.16px] text-[#333] min-[981px]:text-[14px] min-[981px]:leading-[16.8px]"
          >
            {titulares.map((t) => (
              <li
                key={t.id}
                data-target={t.id}
                className="my-[11.2px] min-[981px]:my-0 min-[981px]:py-[5.6px]"
              >
                <a href={`#${t.id}`} className="hover:text-[#0075C9]">
                  {t.texto}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
