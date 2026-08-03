# `apps/cms` — la app de admin de Payload

**Vacía a propósito.** CMS-0f decidió **dos apps en monorepo**; la conversión
(primer bloque de F2-1) crea la estructura, y **la instalación de Payload es el
bloque siguiente** — deliberadamente separada:

> Si la conversión y la instalación van en la misma tanda y el Δ0 se rompe, **no
> se sabe cuál de las dos fue**.

Cuando se instale, esta app lleva **el admin y solo el admin**. Las colecciones,
los tipos generados y los defaults viven en `packages/cms-config`, que es lo que
consume el build de `apps/web` por **Local API, sin HTTP** (§CMS-0f).
