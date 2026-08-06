/**
 * LOS CATÁLOGOS DEL GRUPO A, LEÍDOS DEL CMS — F2-3, con el proyector genérico.
 *
 * ── Por qué esto no se parece a `cms/faqs.ts` ─────────────────────────────
 * El canario listaba sus cuatro campos a mano. Aquí **no hay lista**: una
 * llamada a `leeColeccion`, que pasa el walker de `mapeo.mjs` —el mismo que
 * escribió el seed— sobre la config. `qa:lectura-forma` midió por qué: estas
 * colecciones traen `upload` y `relationship`, y `documentos-cientificos` son 21
 * hojas. Copiar la forma del canario habría sido re-implementar el walker.
 *
 * Lo único que se declara aquí es **el TIPO medido que se espera de vuelta**, y
 * eso sí es útil: si el esquema dejara de expresar un campo de
 * `DocumentoCientifico`, el error es de compilación y no un hueco en la página.
 *
 * ── Lo que garantiza que estos datos son los de `src/lib` ─────────────────
 * `qa:cms-roundtrip` (63/63) + `qa:cms-lectura` (63/63, negativo 4/4) +
 * el Δ0 de esta familia: `qa:clon-base` a dos anchos y `qa:html-cmp` byte a byte
 * contra el HTML anterior a la migración.
 */
import type { DocumentoCientifico } from "@/types/kunak";
import { leeColeccion } from "./proyector";

export async function documentosCientificos(): Promise<DocumentoCientifico[]> {
  return leeColeccion<DocumentoCientifico>("documentos-cientificos");
}
