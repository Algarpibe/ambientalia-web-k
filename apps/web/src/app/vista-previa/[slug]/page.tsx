import { notFound } from "next/navigation";

import PaginaPlana from "../../[slug]/page";
import { getPaginaPlanaCms } from "@/lib/cms/arquetipo-a";
import { cms } from "@/lib/cms/local";

/**
 * LA VISTA PREVIA DE BORRADORES — F2-4, y **la única grieta declarada** en la
 * consecuencia 1 de CMS-0c (*«la app NO necesita Postgres en runtime»*).
 *
 * `PLAN-FASE-2.md` §F2-4 · `ESQUEMA-CMS.md` CMS-0c.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 1 · QUÉ ROMPE Y QUÉ NO — la grieta, acotada por escrito
 * ══════════════════════════════════════════════════════════════════════════
 *
 * | | antes de F2-4 | ahora |
 * |---|---|---|
 * | las 31 rutas del sitio | HTML estático, sin DB detrás | **igual, sin tocar** |
 * | `/vista-previa/<slug>` | no existía | **lee Postgres en cada petición** |
 *
 * Y las tres cosas que la acotan, que son las que hacen que la consecuencia 1
 * se **conserve** en vez de caerse:
 *
 *   1 · **no aparece en el `prerender-manifest`.** `dynamic = "force-dynamic"`
 *       la deja fuera del build, así que `qa:manifiesto`, `qa:slugs`,
 *       `qa:clon-base` y `qa:enlaces` —todas derivan sus rutas de ahí— siguen
 *       midiendo exactamente las 31 de siempre. **La grieta no entra en el
 *       conjunto medido**;
 *   2 · **si Postgres no está, cae ESTA ruta y sólo ésta.** Las demás son
 *       ficheros ya escritos: el servidor los sigue sirviendo con la DB apagada;
 *   3 · **sin credencial no lee nada.** La comprobación va **antes** de la
 *       primera consulta, no después: un 401 que ya ha leído el borrador es un
 *       borrador leído.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 2 · QUÉ PUEDE LEER — dicho en positivo, y es menos de lo que parece
 * ══════════════════════════════════════════════════════════════════════════
 *
 * **Sólo el plano de raíz `/[slug]`**: entrada de blog y término de Kunakpedia
 * — las dos formas del arquetipo A, que son **186 de las 209** páginas de esa
 * familia. Con credencial válida devuelve el documento **esté publicado o no**.
 *
 * **NO cubre** sector, monográfico, caso, FAQ, producto ni documento
 * científico. Y eso se declara en vez de arreglarse a medias porque la
 * alternativa —una preview que renderiza *algo parecido* para las familias que
 * no sabe montar— es peor que no tenerla: enseña una página que el sitio no va
 * a servir. Añadir una familia es **una entrada más en el despacho de abajo**,
 * no un diseño nuevo.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * 3 · POR QUÉ REUSA `PaginaPlana` EN VEZ DE MAQUETAR
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Una preview que copia el árbol de la página es una FAMILIA DE CALIBRACIÓN con
 * otro nombre: dos implementaciones del mismo arquetipo, una medida y otra no,
 * y la divergencia aparece el día que alguien toca una sola de las dos. Aquí se
 * importa **el mismo componente** que sirve la ruta estática, con
 * `conBorradores` puesto; lo que se ve en la preview es, por construcción, lo
 * que se va a servir.
 */
export const dynamic = "force-dynamic";

/**
 * ⚠ **Sin defecto, y el módulo TIRA si falta** — como `PAYLOAD_SECRET` y como
 * `PUBLICAR_SECRETO`. Un defecto aquí publicaría todos los borradores del sitio
 * a quien conociera el nombre de la variable, que es decir a cualquiera.
 */
function secreto(): string {
  const s = process.env.PREVIEW_SECRETO;
  if (!s)
    throw new Error(
      "PREVIEW_SECRETO no está definido y la vista previa sirve BORRADORES.\n" +
        "  Sin secreto no hay control de acceso, y un defecto sería una clave en el repo.",
    );
  return s;
}

export default async function VistaPrevia({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, q] = await Promise.all([params, searchParams]);

  /* ── LA PUERTA, y está ANTES de la primera consulta ────────────────────
   * `notFound()` y no un 401 con texto: una respuesta que distingue «existe
   * pero no puedes» de «no existe» **enumera los borradores** de quien pruebe
   * slugs. Lo que se le devuelve a quien no tiene credencial es exactamente lo
   * mismo que devuelve una ruta inventada. */
  const token = Array.isArray(q.token) ? q.token[0] : q.token;
  /* ⚠ Punto de sabotaje de `qa:programada-neg` (`preview-abierta`), declarado y
   * ruidoso. Es la ÚNICA puerta de la grieta de runtime, así que tiene que
   * existir un falsador que la quite y una sonda que lo note. */
  const abierta = process.env.PROGRAMADA_SABOTAJE === "preview-abierta";
  if (abierta) console.error("⚠⚠ PROGRAMADA_SABOTAJE=preview-abierta: la preview NO pide token");
  if (!abierta && token !== secreto()) notFound();

  const p = await getPaginaPlanaCms(slug, { conBorradores: true });
  if (!p) notFound();

  /**
   * ⚠ **`estado` NO viene en `p.datos`, y es correcto que no venga.** El
   * proyector devuelve la forma MEDIDA y `estado` está marcado
   * `custom.infraestructura` justo para quedarse fuera de ella (si entrara,
   * `qa:cms-roundtrip` fallaría en las 63 filas). Así que para rotular la cinta
   * hay que preguntárselo a la DB, y se pregunta — no se deduce.
   */
  const payload = await cms();
  const { docs } = await payload.find({
    collection: p.forma === "blog" ? "entradas-blog" : "terminos-kunakpedia",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const estado = (docs[0] as { estado?: string } | undefined)?.estado;
  if (!estado)
    /* Regla 6: el documento existe pero no sabemos si está publicado. Rotularlo
     * «borrador» por defecto sería inventar; rotularlo «publicado» sería peor. */
    throw new Error(`VISTA PREVIA: '${slug}' no devolvió \`estado\`. No se rotula lo que no se sabe.`);

  return (
    <>
      {/* La cinta. Existe porque una preview que no se distingue de la página
          servida es una trampa: alguien la comparte, y el receptor cree estar
          viendo el sitio. No lleva `position: fixed` a propósito — empuja el
          documento, así que **nada de lo de abajo cae donde caería en la
          página buena**, y eso es una señal, no un defecto. */}
      <div className="bg-[#111] px-4 py-2 text-center text-[14px] leading-[22px] text-white">
        VISTA PREVIA · <strong>{estado}</strong>
        {" · "}esta página {estado === "publicado" ? "ya está" : "NO está"} en el sitio
      </div>
      <PaginaPlana params={Promise.resolve({ slug })} conBorradores />
    </>
  );
}
