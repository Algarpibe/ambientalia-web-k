import type { CasoDeExito } from "@/types/kunak";
import { hrefTermino } from "@/lib/taxonomia-sectores";

/**
 * `section.case-detalles` — «Detalles del proyecto»: la ficha de datos a la
 * izquierda y el mapa de un punto a la derecha.
 *
 * Medido (`scripts/qa/medidas/c-cascaron-{1440,390}.json`, varianza cero en 6
 * instancias):
 *   sección  `mt 85/65 · mb 50 · pt 30 · pb 55`
 *   h2       37px/37 w300 ls −0.5
 *   texto    16px/30.6
 *   anchos   texto 368.63 · mapa 581.78 dentro del contenedor de 1152 (a 390
 *            apilan a 312)
 *   mapa     **330 de alto a 1440 y 290 a 390** — es P-C3-6, y cuadra
 *
 * ── Los seis rótulos son PLANTILLA; dos de las filas son PROYECCIONES ──────
 * «Cliente · Usuario · Ubicación · Sector · Año · Parámetros» tienen un solo
 * valor en 57/57. Y **«Cliente» y «Sector» no son campos de `detalles`**: se
 * proyectan de `caso.cliente` y `caso.sectores`, que es de donde también sale
 * el chip de arriba. Medido: igualdad 57/57 y 53/53, y ausencia conjunta 4/4.
 *
 * El singular/plural de `Sector:` / `Sectores:` **se deriva** del número de
 * términos — tampoco es dato (singular en 49, plural en 4).
 *
 * ── La fila vacía del sector, que parece un descuido y es estructura ───────
 * Cuando el caso no tiene términos, el original **igualmente emite el `<p>`**,
 * vacío, entre «Ubicación» y «Año». Se reproduce: quitarlo sería quitar una
 * caja de línea que el original sí ocupa.
 */
export function CasoDetalles({ caso }: { caso: CasoDeExito }) {
  const terminos = caso.sectores ?? [];
  const { usuario, ubicacion, anyo, parametros } = caso.detalles;

  return (
    <section className="case-detalles mb-[50px] mt-[65px] pb-[55px] pt-[30px] md:mt-[85px]">
      <div className="mx-auto w-[80%] max-w-[1152px]">
        <h2 className="case-detalles-title titulo-puntos text-[37px] font-light leading-[37px] tracking-[-0.5px] text-[#333]">
          Detalles del proyecto
        </h2>

        <div className="case-detalles-content mt-[30px] md:flex md:justify-between">
          <div className="case-detalles-txt text-[16px] leading-[30.6px] text-[#333] md:w-[32%]">
            <Fila rotulo="Cliente:">{caso.cliente}</Fila>
            <Fila rotulo="Usuario:">{usuario}</Fila>
            <Fila rotulo="Ubicación:">{ubicacion}</Fila>
            {/* La fila del sector: con términos, enlazados; sin ellos, el `<p>`
                vacío que el original emite igual. */}
            {terminos.length ? (
              <Fila rotulo={terminos.length > 1 ? "Sectores:" : "Sector:"}>
                {terminos.map((t, i) => (
                  <span key={t.slug}>
                    {i > 0 ? ", " : ""}
                    <a href={hrefTermino(t)} rel="tag" className="hover:underline">
                      {t.nombre}
                    </a>
                  </span>
                ))}
              </Fila>
            ) : (
              <p aria-hidden />
            )}
            <Fila rotulo="Año:">{anyo}</Fila>
            {parametros ? (
              <div>
                <p>
                  <span className="font-bold">Parámetros:</span>
                  <br />
                </p>
                {/* Rico: trae `ul li sub b p`. Y su HTML de origen es inválido
                    —`<ul>` dentro de `<p>`—, así que la lista es HERMANA del
                    párrafo del rótulo, no hija: se pinta aquí, fuera del `<p>`,
                    que es exactamente donde el navegador la coloca. */}
                <div
                  className="[&_li]:list-disc [&_ul]:my-0 [&_ul]:pl-[1.25em]"
                  dangerouslySetInnerHTML={{ __html: parametros }}
                />
              </div>
            ) : null}
          </div>

          <div className="case-detalles-mapa mt-[30px] md:mt-0 md:w-[50.5%]">
            {caso.ubicacionMapa ? <MapaPunto punto={caso.ubicacionMapa} /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Fila({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <p>
      <span className="font-bold">{rotulo}</span> {children}
    </p>
  );
}

/**
 * El mapa de un punto.
 *
 * ⚠️ **DESVIACIÓN DELIBERADA, dicha en voz alta** (no heredada en silencio de
 * S3): igual que `MapaProyectos` de SECTOR, el mapa real del original carga la
 * Maps JavaScript API con la clave del sitio, y replicarlo exigiría una clave
 * propia (coste y alta en GCP) o incrustar la ajena. **Este es otro
 * componente** —un punto, no 41 pines— y se decide lo mismo, pero se decide,
 * no se hereda: razón y coste en `docs/PENDIENTES-QA.md` (S3-C).
 *
 * Lo que sí se conserva es **el contenedor a su tamaño medido (330/290)** y
 * **las coordenadas en el dato**, que es lo que importa al content type: el
 * modelo guarda `{lat, lng}` exista o no el render. Cambiar el placeholder por
 * un mapa real el día que haya clave es tocar este fichero y ninguno más.
 */
function MapaPunto({ punto }: { punto: { lat: number; lng: number } }) {
  return (
    <div className="acf-map flex h-[290px] items-center justify-center bg-[#e9eef2] md:h-[330px]">
      {/* El marcador replica la estructura del original —`.acf-map > .marker`
          con `data-lat`/`data-lng`— y no las coordenadas sueltas en el padre.
          No es cosmética: es el gancho por el que el mapa real se inicializa el
          día que haya clave, y es lo que una sonda va a contar. La primera
          versión las colgaba del `.acf-map` y `qa:c-cmp` leyó **0 marcadores**
          en el clon con 1 en el original. */}
      <div className="marker" data-lat={punto.lat} data-lng={punto.lng}>
        <span className="text-[13px] text-[#666]">
          {punto.lat.toFixed(4)}, {punto.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
