# Plan de clonado por etapas — kunakair.com/es

Objetivo: clonar https://kunakair.com/es/ por fases, con control manual y cambio de
modelo en las etapas más críticas (razonamiento) vs. las mecánicas.

## Regla de modelo por fase

| Fase | Modelo | Motivo |
|------|--------|--------|
| 1. Reconocimiento        | **Fable 5** 🔴 | Clasificar interacción (scroll/click/tiempo) = razonamiento crítico |
| 2. Fundación             | Opus 4.7       | Mecánico (fuentes, tokens, descarga de assets) |
| 3a. Extracción de specs  | **Fable 5** 🔴 | getComputedStyle + estados + comportamiento = lo difícil |
| 3b. Construcción         | Opus 4.7       | Montar componentes = mecánico |
| 4. Ensamblaje            | Opus 4.7       | Mecánico salvo comportamientos de página complejos |
| 5. QA visual             | **Fable 5** 🔴 | Comparación visual fina = razonamiento |

Cambio de modelo: comando `/model` entre fases. Si Fable 5 no aparece en la lista,
usar Opus 4.7 en todo.

## Flujo por etapas (una página a la vez — empezar por la home)

### Fase 1 — Reconocimiento  [Modelo: Fable 5]
Prompt al agente:
> Lee el skill clone-website y ejecuta SOLO la Fase 1 (Reconocimiento) para
> https://kunakair.com/es/. Toma capturas desktop (1440px) y móvil (390px), haz el
> barrido de interacciones (scroll lento observando cambios automáticos, hover, y
> click en cada elemento interactivo), y genera BEHAVIORS.md y PAGE_TOPOLOGY.md en
> docs/research/. NO construyas código todavía. Detente al terminar y dame un resumen
> de la topología y el modelo de interacción de cada sección.

### Fase 2 — Fundación  [Modelo: Opus 4.7]
> Continúa con la Fase 2 (Fundación): actualiza layout.tsx con las fuentes reales,
> globals.css con los tokens de color/espaciado/keyframes exactos, crea los tipos en
> src/types, extrae los iconos SVG a src/components/icons.tsx, y escribe+ejecuta
> scripts/download-assets.mjs para descargar todos los assets a public/. Verifica que
> `npm run build` pasa. Detente al terminar.

### Fase 3 — Specs + construcción  [Fable 5 para specs, Opus para construir]
Por cada sección (de arriba a abajo):
> Extrae la sección "<nombre>" de kunakair.com/es: captura aislada, getComputedStyle
> de cada elemento, TODOS los estados (tabs/carruseles/scroll), texto verbatim y
> dependencias de assets. Escribe docs/research/components/<nombre>.spec.md. NO
> construyas aún — solo el spec.

(cambiar a Opus 4.7)
> Con el spec de "<nombre>" ya escrito, construye los componentes. Verifica
> `npx tsc --noEmit` y luego `npm run build`.

### Fase 4 — Ensamblaje  [Modelo: Opus 4.7]
> Fase 4: cablea todas las secciones en src/app/page.tsx con el layout de página,
> scroll snap, sticky, z-index y smooth scroll. Verifica `npm run build`.

### Fase 5 — QA visual  [Modelo: Fable 5]
> Fase 5: compara original vs. clon lado a lado en desktop y móvil, de arriba a abajo.
> Prueba scroll, click y hover. Por cada discrepancia: revisa el spec, re-extrae si
> hace falta, y corrige el componente. Dame un informe de diferencias restantes.

## Notas
- El agente principal (el que razona: recon, specs, QA) corre en el modelo que fijes
  con /model. Los builders mecánicos pueden quedarse en Opus.
- Cambiar de modelo invalida la caché de prompt (costo pequeño) — no es problema.
- Turnos de minutos en Fable 5 son normales; dejarlo trabajar.
- Hacer una página completa antes de pasar a la siguiente.
