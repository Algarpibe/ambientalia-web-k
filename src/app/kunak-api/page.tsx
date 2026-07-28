import type { Metadata } from "next";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CtaBanner } from "@/components/CtaBanner";
import { UltimosArticulos } from "@/components/UltimosArticulos";
import { FaqAcordeon } from "@/components/monitor/FaqAcordeon";
import { HeroApi } from "@/components/api/HeroApi";
import { InfoProductoApi } from "@/components/api/InfoProductoApi";
import { BeneficiosApi } from "@/components/api/BeneficiosApi";
import { API_ARTICLES, BREADCRUMB, CTA } from "@/lib/api";

export const metadata: Metadata = {
  title: "Kunak API | Integración de datos de calidad del aire",
  description:
    "Kunak API: interfaz REST en formato JSON para extraer los datos de Kunak AIR Cloud e integrarlos en tu propio software, sistema de gestión o plataforma de terceros.",
};

/**
 * /kunak-api — FICHA DE PRODUCTO CORTA (CPT solutions).
 * Topología: docs/research/kunak-api/PAGE_TOPOLOGY.md
 * Comportamientos: docs/research/kunak-api/BEHAVIORS.md
 * Specs de bloque: docs/research/kunak-api/components/*.spec.md
 *
 * No es un arquetipo nuevo: es la **variante mínima** del de /software (5421 de
 * alto frente a 11705 a 1440). Mismo hero, misma fila de "Información del
 * producto", mismos blurbs de icono, mismos artículos, mismo FAQ y mismo CTA —
 * pero SIN carrusel, SIN rejilla de capturas, SIN columna de anclas, SIN casos
 * de éxito y SIN vídeo.
 *
 * ⚠️ El arquetipo "API / desarrollador" NO existe aquí: cero `<pre>`, cero
 * `<code>`, cero tablas de parámetros, cero tabs de lenguaje y ningún enlace a
 * un portal de docs / Swagger / Postman. Lo más "de desarrollador" es la foto
 * `kunak-api.jpg`. Ver PAGE_TOPOLOGY §"El arquetipo no existe".
 *
 * Reutiliza sin tocar: HeaderNav · Footer template="tb" · ScrollToTop ·
 * FaqAcordeon (19/19 preguntas idénticas a las otras tres páginas) · CtaBanner
 * (cero props nuevas) · UltimosArticulos (variante de espaciado "api") ·
 * BlueButton · BlurbsIconos (compartido con /software).
 *
 * Ojo con el ORDEN: el CTA de ancho completo va **al final**, después del FAQ —
 * no entre el hero y el contenido como en /software.
 */
export default function KunakApiPage() {
  return (
    <>
      <HeaderNav />

      <main className="flex flex-1 flex-col">
        {/* Cabecera TB: franja foto tras el header transparente. El recon
            capturó `cabecera-urbana.jpg`; la imagen VARÍA entre visitas —
            no re-investigar (nota de PENDIENTES-QA, P2). */}
        <div
          aria-hidden
          className="h-[137px] w-full bg-cover bg-center lg:h-[177px]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(71,71,71,0.17), rgba(71,71,71,0)), url('/images/uploads/2023/10/cabecera-urbana.jpg')",
          }}
        />

        {/* --- S0 · Breadcrumb (3 niveles, el último sin enlace) --- */}
        <nav aria-label="Migas de pan" className="bg-white">
          <div className="mx-auto w-[80%] max-w-[1380px] py-[12px] text-[12px] leading-[26px]">
            <ol className="kunak-breadcrumbs flex flex-wrap items-center gap-1 text-[#0075C9]">
              {BREADCRUMB.map((b, i) => (
                <li key={b.label} className="contents">
                  {i > 0 ? <span aria-hidden>/</span> : null}
                  {b.href ? (
                    <a href={b.href} className="text-[#0075C9] hover:underline">
                      {b.label}
                    </a>
                  ) : (
                    <span aria-current="page">{b.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* --- S1 · hero + información del producto + beneficios ---
            Una sola sección con las 3 filas, watermark K a 0% 50% y
            `padding-top: 4%` (50.58 medido a cw 1264.7). Sin padding inferior:
            lo pone el 5% de las filas 2 y 3. */}
        <section
          className="relative bg-white bg-no-repeat pt-[50px] lg:pt-[4vw]"
          style={{
            backgroundImage: "url('/images/theme/recurso-k-fondo.svg')",
            backgroundPosition: "0% 50%",
          }}
        >
          <HeroApi />
          <InfoProductoApi />
          <BeneficiosApi />
        </section>

        {/* --- S2 · Artículos y Guías (el original sortea los 3 posts) --- */}
        <UltimosArticulos title="Artículos y Guías" posts={API_ARTICLES} variant="api" />

        {/* --- S3 · Preguntas frecuentes (19 toggles, idénticas al monitor) --- */}
        <FaqAcordeon desfaseColumna={10} />

        {/* --- S4 · CTA de ancho completo, AL FINAL ---
            `et_pb_fullwidth_slider` de 1 diapositiva, sin flechas, sin puntos y
            sin autoplay. Medido: fondo `urban-1500.jpg` con rgba(0,0,0,.33) en
            multiply, copy a la IZQUIERDA (pr 31%), caja al 88% con py 5%,
            título 45/58.5 enlazado y botón claro (`et_pb_bg_layout_dark`).
            Es la configuración por defecto de CtaBanner con `body`. */}
        <CtaBanner
          image={CTA.image}
          heading={CTA.heading}
          headingHref={CTA.headingHref}
          body={CTA.body}
          align="left"
          buttonLabel={CTA.buttonLabel}
          buttonHref={CTA.buttonHref}
        />
      </main>

      <Footer template="tb" />
      <ScrollToTop />
    </>
  );
}
