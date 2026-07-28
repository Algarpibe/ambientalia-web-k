# kunak-web-clone

## Qué es esto

Clon fiel de **https://kunakair.com/es/** (WordPress + Divi) reconstruido en
Next.js. El objetivo **no** es tener una copia bonita: es levantar una
**biblioteca de arquetipos de página** que después se traslada a un CMS. Cada
página clonada aporta un arquetipo (HOME, PRODUCTO, CATÁLOGO,
SOFTWARE/PLATAFORMA…) con su plantilla y su modelo de contenido ya separados.

De ahí salen las dos consecuencias que gobiernan todo el repo:

1. **Fidelidad al píxel sobre criterio propio.** Los textos van *verbatim*,
   erratas incluidas (ver la cabecera de `src/lib/software.ts`). Las
   desviaciones deliberadas se anotan en `docs/PENDIENTES-QA.md`, no se
   improvisan.
2. **Estructura y contenido nunca se mezclan.** Es lo que hace que el arquetipo
   sea trasladable a un CMS.

Stack: Next.js 16 (App Router, `output: standalone`), React 19, Tailwind v4,
TypeScript. Node 24 (`.nvmrc`). Swiper para carruseles.

## Arquitectura

| Capa | Dónde | Qué es |
|---|---|---|
| **Estructura** | `src/components/**/*.tsx` | La plantilla del arquetipo. Maquetación, estados, interacción. Sin textos de negocio incrustados. |
| **Contenido** | `src/lib/*.ts` | Los datos de cada página. Es el **content type** del futuro CMS, escrito como constantes tipadas. |
| **Tipos** | `src/types/kunak.ts` | Interfaces compartidas del modelo (`Product`, `BlogPost`, `CaseStudy`, `Benefit`, `AccesorioItem`…). |
| **Ensamblaje** | `src/app/<ruta>/page.tsx` | Importa componentes + datos, define `metadata` y el orden de secciones. |
| **Tokens** | `src/app/globals.css` | Colores, tipografía, espaciado y keyframes extraídos del original. |
| **Assets** | `public/` (`images`, `fonts`, `videos`, `seo`) | Descargados con `scripts/download-assets.mjs`. Nunca se enlaza a kunakair.com en caliente. |

Componentes compartidos en la raíz de `src/components/`; los específicos de una
página en su subcarpeta (`monitor/`, `software/`, `api/`). **Cuando un
componente de página se reutiliza en una segunda página, se extrae a la raíz**
— así se hizo con `BlurbsIconos` (commit `1d79be2`), verificando A/B que la
página original no sufre regresión.

Cada `page.tsx` y cada `src/lib/*.ts` llevan una cabecera que enlaza su recon y
sus specs. Mantén esa costumbre: es lo que hace navegable el trabajo previo.

## Páginas clonadas

| Ruta | Arquetipo | Recon/specs |
|---|---|---|
| `/` | HOME | `docs/research/` (raíz) + `docs/research/components/*.spec.md` |
| `/monitor-calidad-aire` | PRODUCTO | `docs/research/monitor-calidad-aire/` |
| `/accesorios` | CATÁLOGO (CPT `solutions`) | `docs/research/accesorios/` |
| `/software-de-medicion-calidad-del-aire` | SOFTWARE/PLATAFORMA | `docs/research/software/` |
| `/kunak-api` | Variante **corta** del anterior — no es arquetipo nuevo | `docs/research/kunak-api/` |

## Regla de rutas locales

**Si el destino de un enlace ya está clonado, el `href` va a la ruta local; si
no, se deja apuntando al original hasta que se clone.**

- Sin barra final: `trailingSlash` no está activado. `/kunak-api`, no `/kunak-api/`.
- Marca cada uno con el comentario de una línea que ya usa el repo:
  `// ruta local: esta página ya está clonada (src/app/<ruta>)`.
- Al localizar, **deja anotado el href original** en el comentario del bloque,
  con su 301 si lo hay — hace falta para rehacer la comparación A/B contra el
  original. Ejemplo trabajado: la cabecera de `SOFTWARE_PARAGRAPHS` en
  `src/lib/monitor.ts`.
- **`target="_blank"` solo si el destino es externo.** Abrir el propio clon en
  otra pestaña no tiene sentido, aunque el original lo haga. `OutlineButton`
  (`src/components/SectionRow.tsx`) ya lo implementa con la prop `external`.

La aplican `nav.ts`, `footer.ts`, `products.ts`, `api.ts` y `monitor.ts`.

## Flujo de trabajo

Una página completa antes de empezar la siguiente. Por página:

1. **Recon** — Barrido de la página real: topología de secciones, capturas
   desktop y móvil, y clasificación de cada interacción (scroll / click /
   tiempo). Sale `docs/research/<pagina>/PAGE_TOPOLOGY.md` + `BEHAVIORS.md`.
   Aquí se decide **si es un arquetipo nuevo o una variante de uno existente** —
   ver `docs/research/kunak-api/PAGE_TOPOLOGY.md`, que concluyó que el arquetipo
   "API/desarrollador" no existía. No se escribe código en esta fase.
2. **Specs** — Por sección: `getComputedStyle` de cada elemento, todos los
   estados, texto verbatim y dependencias de assets →
   `docs/research/<pagina>/components/<seccion>.spec.md`. Sigue sin escribirse
   código.
3. **Build** — Componentes + `src/lib/<pagina>.ts` + `page.tsx` a partir del
   spec. Verificar con `npm run check` (lint + typecheck + build).
4. **QA visual** — Comparación lado a lado contra el original, desktop y móvil,
   de arriba a abajo. Cada discrepancia: revisar el spec, re-medir si hace
   falta, corregir. Lo que quede sin resolver o se desvíe a propósito va a
   `docs/PENDIENTES-QA.md` con fecha y razón.
5. **Commit** — Mensaje en español, con el ámbito por delante
   (`monitor: …`, `software: …`). Cuerpo explicando el porqué y lo que queda
   pendiente.

`docs/PLAN-CLONADO.md` tiene el detalle de fases y qué modelo conviene en cada
una. `docs/PENDIENTES-QA.md` es el registro vivo de QA — **léelo antes de tocar
una página ya clonada**: incluye objetivos numéricos por sección y hallazgos
cerrados que no hay que reinvestigar.

## Notas de método (medición y capturas)

Estas se pagaron con horas de depuración. No las reinventes:

- **Perfil limpio, siempre.** Se mide con puppeteer-core sobre el Chrome del
  sistema, headless, perfil nuevo y **Cookiebot bloqueado** vía
  `--host-resolver-rules`. En una sesión viva con cookies e historial el
  original renderiza estados distintos y las medidas no valen.
- **Scroll + settle antes de medir.** Divi recalcula alturas de slider por JS
  después del load. Hay que dar un pase de scroll completo y esperar a que se
  asiente; conviene además forzar las imágenes perezosas a `eager`.
- **Móvil solo con `Emulation.setDeviceMetricsOverride`** (390×844). El
  `resize_window` de la extensión de Chrome **no sirve**: informa éxito pero el
  viewport se queda en 1280. Y sin override, Chrome headless fuerza un ancho
  mínimo de 500px, así que el "móvil" que salga será falso.
- **Capturas con `setViewport`, nunca con `fullPage: true`.** `fullPage`
  **reinicia el override de device metrics**. A 1440 la página pasaba a
  maquetar como si el viewport midiera ~800; y con
  `Emulation.setDeviceMetricsOverride` puesto por CDP, el screenshot captura
  **la ventana real (800×600) en vez del viewport emulado**. O sea: la captura
  no es de lo que acabas de medir. Captura por viewport y compón las tiras
  después. (Hallazgo del recon de /kunak-api, 2026-07-27.)
- Anota en el doc de cada medida **viewport, DPR y fecha**. Los deltas solo se
  comparan entre medidas del mismo día y la misma configuración; el original es
  un sitio vivo.
- Ojo con el servidor del clon al comparar: si corre con `next start`, tras
  editar hay que **parar, `npm run build` y relanzar**. Una página sin estilos
  (CSS 500) es un `next start` desincronizado de `.next`.

## Comandos

```bash
npm run dev        # desarrollo
npm run check      # lint + typecheck + build  ← antes de commitear
npm run build
npm run typecheck
```
