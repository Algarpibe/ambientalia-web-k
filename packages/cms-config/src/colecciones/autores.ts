/**
 * AUTORES — 117.ª · ESCALÓN 2. La entidad que firma las entradas de blog.
 *
 * ── POR QUÉ ES COLECCIÓN Y NO UN CAMPO DE TEXTO ───────────────────────────
 * Porque se midió, no porque convenga. El archivo `/author/<slug>/` del
 * original trae **foto, nombre, cargo, redes y biografía**, y **ninguno de los
 * cinco se deriva de sus miembros**: los 7 ejes de CONTENIDO PROPIO varían
 * entre las 6 instancias (`separadora-author-116.log` §2). Los ejes que SÍ se
 * derivan de los miembros —títulos de listado, nº de tarjetas— se publicaron
 * aparte y **no cuentan**, porque la pregunta era justamente por lo que no se
 * deriva (§regla 40: un refutador alimentado con lo excluido refuta siempre).
 *
 * ── ⚠ COLECCIÓN **SIN ARCHIVO**, y eso NO es media colección ──────────────
 * El archivo `/author/*` **no se emite**. Y no es una renuncia: es lo que dice
 * el dato — `author` está enlazado desde **0 de 35 formas de listado**, y el
 * clon sirve **1 href ABSOLUTO al original y 0 LOCALES**. Así que no emitirlo
 * **no crea ni un enlace roto** (§Regla de rutas locales: si el destino no está
 * clonado, el `href` se queda apuntando al original).
 *
 * ── Y POR ESO **NO** LLAMA A `registroDeSlug` ─────────────────────────────
 * §regla 25: *una guarda cuyo dominio es más ancho que su invariante deja de
 * proteger y pasa a BLOQUEAR — y eso no da error: da un rechazo legítimo*.
 * El registro de slugs impone unicidad **en el plano de un segmento de `/es/`**.
 * Estos 6 términos **no tienen URL en ese plano**, así que reclamarlo sólo
 * podría estorbar: bloquearía 6 slugs de raíz que ninguna URL usa. Medido en
 * esa misma regla con una colección prefijada: reclamaba 6, y **6 de 6** no
 * tenían ruta de raíz.
 *
 * ── LOS OPCIONALES VAN CON SU FRACCIÓN, que es una MEDIDA ─────────────────
 * §*un campo opcional no expresa un caso: sólo PERMITE que falte*. Aquí el
 * caso está **ejercitado por el original**, así que estos caminos de render
 * **no son «sin estrenar»**: hay dato que los prueba.
 *
 *   | campo   | lo traen | lo dejan vacío            |
 *   |---------|----------|---------------------------|
 *   | `foto`  | 4 de 6   | 2 (`admin`, `mar_ramirez`)|
 *   | `cargo` | 4 de 6   | 2 — y con `<p></p>`, vacío de verdad |
 *   | `bio`   | 4 de 6   | 2                         |
 *   | `redes` | 5 de 6   | 1 (`mar_ramirez`)         |
 *
 * ── ⚠ `foto` SE DECLARA Y SE QUEDA VACÍA — con su cardinal (§PASO 0b) ─────
 * Las **5** fotos distintas de la ficha están **0 capturadas** localmente. El
 * canal se enumeró **antes de que matara un seed**, que es lo que
 * §EL INVENTARIO DE MEDIA pide y lo que las tres veces anteriores no se hizo
 * (las tres se descubrieron sembrando). Traer los bytes es RED y es una campaña
 * con su encargo. Hasta entonces: campo declarado, dato vacío, cardinal escrito.
 */
import type { CollectionConfig } from "payload";

import { campoHtml, subida } from "../campos/comunes.ts";

export const autores: CollectionConfig = {
  slug: "autores",
  admin: { useAsTitle: "nombre", group: "Taxonomías" },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },

    /** 6 de 6 distintos — el eje que más claramente es contenido propio. */
    { name: "nombre", type: "text", required: true },

    /**
     * ⚠ **OPCIONAL, y el `null` es un valor MEDIDO, no un hueco de siembra.**
     * 2 de 6 no traen foto propia: sirven `themes/KunakAir/assets/images/user.svg`,
     * que es **el marcador del TEMA**, no una foto del autor. Guardar ese SVG
     * como si fuera la foto de alguien sería transcribir el default del tema
     * como si fuera contenido.
     */
    subida("foto"),

    /**
     * ⚠ **EL ORIGEN DE LA FOTO, que NO es la foto.** `foto` es el `upload` y
     * hoy está **vacío en 5 de 5**: los bytes no están capturados. Este campo
     * guarda **qué URL sirve el original**, que es lo que la campaña de captura
     * necesita para saber cuáles pedir.
     *
     * Sin él, «faltan las fotos» sería una frase; con él es una lista. Es la
     * diferencia que §regla 14 describe: *una limitación sin su número se lee
     * como una nota al pie*.
     */
    { name: "fotoOrigen", type: "text" },

    /**
     * ⚠ **OPCIONAL, y el vacío es literal:** los 2 que no lo traen sirven
     * `<p></p>` — o sea el módulo existe y está vacío, que no es lo mismo que
     * ausente. Se guarda como ausente porque el texto es lo que se pinta.
     */
    { name: "cargo", type: "text" },

    /**
     * Las redes: `hasMany` porque **el conjunto varía** (4 valores distintos en
     * 6 instancias) y una de ellas trae DOS (`linkedin` + `facebook`). Un campo
     * simple sólo expresaría la más común.
     *
     * ⚠ Vuelve **`[]`**, no ausente, cuando no hay ninguna
     * (§F2-5-ESCALON-ETIQUETAS: *la lista vacía vuelve `[]` salvo que el campo
     * declare que el dato medido la omite*). Aquí el dato NO la omite: el
     * bloque de redes existe en la plantilla y simplemente no lleva enlaces.
     */
    {
      name: "redes",
      type: "array",
      fields: [
        { name: "red", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },

    /**
     * ⚠ **RICA, y por lo mismo que la descripción de `etiquetas`:** el cuerpo
     * de la bio del original trae marcado, y guardarlo plano tiraría enlaces y
     * saltos. Opcional: 4 de 6.
     */
    campoHtml("bio"),
  ],
};
