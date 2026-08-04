/**
 * EL REGISTRO DE SLUGS DEL PLANO — §4, la mitad de ENTRADA de la unicidad.
 *
 * ── Qué problema resuelve, y está medido tres veces ────────────────────────
 * `ESQUEMA-CMS.md` §4, del andamio de `ENRUTADO.md` §2: una colisión de slug
 * **no da error**. El build compila, emite la ruta por las dos vías y **sirve la
 * página equivocada con HTTP 200**. Es el peor modo de fallo del proyecto:
 * silencioso y con aspecto de correcto.
 *
 * Y el cambio de modelo que lo obliga: **en WordPress cada CPT garantiza
 * unicidad dentro de sí, y eso NO basta.** El conflicto es blog × término ×
 * `page` × `solutions` — **202 slugs compartiendo un plano**. La unicidad que
 * hay que imponer es **ENTRE familias**.
 *
 * ── Por qué una colección-registro y no «consultar las demás» ──────────────
 * §4 deja las dos formas: *«un hook `beforeValidate` que consulte las demás
 * familias planas (o una colección-índice de slugs)»*. Se elige la segunda, y no
 * por gusto:
 *
 *   · consultar N colecciones es **N consultas que hay que acordarse de añadir**
 *     cuando entre la familia N+1 — o sea una lista a mano, que es el modo de
 *     fallo que este proyecto ya tiene catalogado;
 *   · un registro con `unique: true` deja que **la restricción la imponga
 *     Postgres**, no mi código. Un `UNIQUE` no se puede olvidar de mirar, y no
 *     tiene condiciones de carrera entre el `find` y el `create`.
 *
 * ── ⚠ EL ALCANCE, declarado — y es EL MISMO que el de `qa:slugs` ───────────
 * **Sólo el plano de UN segmento de `/es/`.** Las familias prefijadas —casos,
 * FAQ, sectores, monográficos, documentos científicos, taxonomías— tienen
 * unicidad *por colección*, que es nativa, y **no entran**.
 *
 * Que coincida con el alcance de la sonda **no es una coincidencia, es un
 * requisito**: dos definiciones distintas de «lo mismo» son la clase C7 de este
 * repo (emparejar con definiciones que no coinciden), y aquí produciría el peor
 * resultado posible — un hook que rechaza altas que la guarda de build considera
 * legítimas, o al revés. Si una familia baja al plano, se añade **en los dos
 * sitios**: `FAMILIAS` de `scripts/qa/slugs.mjs` y `EN_EL_PLANO` de aquí.
 *
 * ── Y son COMPLEMENTARIAS, no alternativas (§4, literal) ───────────────────
 * *«el hook avisa a quien edita, la guarda caza lo que entre por cualquier otra
 * vía»*. Ésta es la mitad de entrada: falla en el **alta**. `qa:slugs` es la de
 * salida: falla en el **build**, y ve cosas que el hook no puede ver —una ruta
 * estática del clon que sombree un slug del catálogo, o una huérfana—.
 */
import type { CollectionConfig } from "payload";

export const slugs: CollectionConfig = {
  slug: "slugs",
  admin: {
    useAsTitle: "slug",
    group: "Sistema",
    description:
      "Registro del plano de /es/ — un segmento. Lo escriben los hooks de las colecciones " +
      "de contenido; no se edita a mano. La unicidad ENTRE familias vive aquí (§4).",
    defaultColumns: ["slug", "familia", "documento"],
  },
  fields: [
    /**
     * **La restricción entera está en este `unique`.** Todo lo demás de este
     * fichero es contabilidad para poder decir QUIÉN lo reclamó cuando falle.
     */
    { name: "slug", type: "text", required: true, unique: true, index: true },
    /** La colección que lo reclama. Texto y no `select`: una colección nueva no debe exigir migración del enum. */
    { name: "familia", type: "text", required: true, index: true },
    /**
     * El `id` del documento dueño. **Opcional a propósito, y nada depende de
     * él**: soltar un slug se hace por `slug` + `familia`, que se conocen
     * siempre. Aquí sólo sirve para poder decir *quién* lo reclamó al depurar.
     *
     * ⚠ Y es opcional en vez de llevar un relleno tipo `"(pendiente)"` porque en
     * `beforeValidate` de un ALTA **el id todavía no existe** —lo asigna el
     * `INSERT`—, así que un relleno sería justo lo que la regla 6 prohíbe:
     * traducir una ausencia real («el alta está en curso») a un valor benigno.
     * Lo rellena `afterChange`, cuando el id ya es un hecho.
     */
    { name: "documento", type: "text", index: true },
  ],
};
