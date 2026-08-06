/**
 * LA PRUEBA DE OPERACIÓN — abrir en el admin y GUARDAR SIN CAMBIOS.
 *
 * Uso:  npm run qa:admin-operacion
 *       (exige el admin servido; ver PRECONDICIONES abajo)
 *
 * ══════════════════════════════════════════════════════════════════════════
 * QUÉ PREGUNTA CONTESTA, Y POR QUÉ NO VALE UN `update` PROGRAMÁTICO
 *
 * La pregunta es: **¿el editor DEGRADA el dato al guardarlo?** Un save que
 * reordena claves, normaliza HTML o «arregla» un campo rico **mueve el render
 * sin que nadie haya editado nada** — y eso es lo que convierte un CMS en una
 * fuente de regresiones silenciosas.
 *
 * Y esa normalización vive en el camino del **admin**: los hooks de campo, el
 * serializador del editor, el `beforeValidate` que Payload monta para el
 * formulario. Un `payload.update(...)` por Local API **se salta ese camino
 * entero**, así que su verde contesta otra pregunta —«¿la DB acepta lo que ya
 * tenía?»— y se lee como si contestara ésta. Es §sondas 8a con nombre: **un
 * instrumento que no ejercita la guarda no puede probarla.**
 *
 * Por eso esto abre un navegador de verdad contra `/admin`, con la disciplina
 * de §Notas de método: `puppeteer-core` sobre el Chrome del sistema, **perfil
 * nuevo**, y el servidor **matado por puerto** y no por PID de padre.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * EL ALCANCE, DECLARADO — «cada colección» NO es «las 24 de la config»
 *
 * El criterio del PLAN dice *«al menos una instancia de CADA colección»*, y sin
 * acotarlo es inaplicable: la config tiene 24 slugs y la mayoría son **blocks**
 * (`cta`, `slider`, `table`…), que no son colecciones editables sueltas.
 *
 * Los SUJETOS son las colecciones **cuya instancia llega al render**, derivadas
 * (regla 9) de `grep -rn "leeColeccion<" apps/web/src` + `cms/faqs.ts`. Si el
 * dato de una colección no llega a ninguna página, un save suyo **no puede**
 * mover el HTML, así que incluirla daría un verde por vacío.
 *
 * Y las que quedan FUERA van con su razón, que es la mitad que impide que
 * «fuera» signifique «no lo miré»:
 *
 * | fuera | por qué |
 * |---|---|
 * | `productos` | su familia de ruta **no está migrada**: las páginas siguen leyendo `src/lib`. Un save no puede mover un render que no lee esa colección. Entra el día que se migre |
 * | `articulos-kb` | 0 filas y sin lado medido (§2d.1) |
 * | `media` | no es un catálogo: se deriva de los `upload` de los demás |
 * | `slugs` | lo escriben los hooks, no una persona |
 * | `usuarios` | infraestructura (CMS-0f). **Se EJERCITA como precondición** —hay que crear el primero para entrar— pero no es sujeto: ningún usuario llega al render |
 *
 * ⚠ **`usuarios` NO se cuenta como «pasada» por tener 0 filas.** Se declara
 * fuera del criterio con la razón de arriba, que es distinto — y su camino de
 * alta **sí** queda probado, porque sin él no hay prueba.
 */
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { CHROME, Evaluadas, hoy, w } from "./lib.mjs";

const ADMIN = process.env.ADMIN ?? "http://127.0.0.1:3001";
const CORREO = process.env.ADMIN_EMAIL ?? "qa@kunak.local";
const CLAVE = process.env.ADMIN_PASS ?? "kunak-qa-2026";

/**
 * Los SUJETOS. `orden` no es estético: se guardan primero las taxonomías, que
 * son las que otros documentos embeben — si el editor degradara un término, se
 * vería también en quien lo referencia, y guardarlo después mezclaría las dos
 * causas.
 */
const SUJETOS = [
  "categorias",
  "etiquetas",
  "categorias-recursos",
  "categorias-cientificas",
  "taxonomia-sectores",
  "faqs",
  "casos",
  "sectores",
  "monograficos",
  "entradas-blog",
  "terminos-kunakpedia",
  "documentos-cientificos",
];

const FUERA = {
  productos: "su familia de ruta NO está migrada: las páginas leen `src/lib`, así que un save no puede mover su render",
  "articulos-kb": "0 filas y sin lado medido (§2d.1)",
  media: "no es un catálogo: se deriva de los campos `upload` de los demás",
  slugs: "lo escriben los hooks del plano (§4), no una persona",
  usuarios: "infraestructura (CMS-0f); EJERCITADA como precondición (create-first-user) pero ningún usuario llega al render",
};

if (!existsSync(CHROME)) {
  console.error(`\n❌ SIN CHROME — no existe ${CHROME}. Sin navegador no hay camino de admin que probar.`);
  process.exit(2);
}

/* ── PRECONDICIÓN · el admin tiene que estar SERVIDO ────────────────────────
 * Y se comprueba antes de abrir nada: un navegador contra un puerto vacío da
 * una página de error que se deja «guardar» sin guardar nada, o sea el verde
 * por vacío otra vez (regla 4bis, el caso `clon-base` con el puerto muerto). */
try {
  const r = await fetch(`${ADMIN}/admin`, { redirect: "manual" });
  if (r.status >= 500) throw new Error(`HTTP ${r.status}`);
} catch (e) {
  console.error(
    `\n❌ EL ADMIN NO RESPONDE en ${ADMIN} (${e.message}).\n` +
      `   Arráncalo antes:  npm run build -w cms && npm run start -w cms\n` +
      `   Una corrida contra un puerto vacío no mide: da la misma salida que «nada se movió».`,
  );
  process.exit(2);
}

const ev = new Evaluadas({ nombre: "admin-operacion", unidad: "colecciones guardadas", minimo: SUJETOS.length });

const puppeteer = await import("puppeteer-core");
const perfil = mkdtempSync(join(tmpdir(), "kunak-admin-"));
const navegador = await puppeteer.default.launch({
  executablePath: CHROME,
  headless: "new",
  userDataDir: perfil, // perfil NUEVO: §Notas de método
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--window-size=1440,900"],
});

const salida = { meta: { fecha: hoy(), admin: ADMIN, sujetos: SUJETOS, fuera: FUERA }, pasos: [], guardados: [] };
const paso = (que, detalle) => {
  salida.pasos.push({ que, detalle });
  console.log(`  · ${que}${detalle ? ` — ${detalle}` : ""}`);
};

try {
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 1440, height: 900 });

  /* ── 1 · EL USUARIO. Es parte de la prueba, no un preparativo: `usuarios`
   *      tiene 0 filas y `cms:reset` se lleva el que crees, así que el orden
   *      real de operación es sembrar → crear usuario → probar. ───────────── */
  await pagina.goto(`${ADMIN}/admin`, { waitUntil: "networkidle2", timeout: 90_000 });
  const url = pagina.url();
  paso("abro /admin", url.replace(ADMIN, ""));

  if (url.includes("create-first-user")) {
    await pagina.type("#field-email", CORREO);
    await pagina.type("#field-password", CLAVE);
    const confirmar = await pagina.$("#field-confirm-password");
    if (confirmar) await confirmar.type(CLAVE);
    await Promise.all([
      pagina.waitForNavigation({ waitUntil: "networkidle2", timeout: 90_000 }).catch(() => {}),
      pagina.click('button[type="submit"]'),
    ]);
    paso("create-first-user", `${CORREO} → ${pagina.url().replace(ADMIN, "")}`);
  } else if (url.includes("login")) {
    await pagina.type("#field-email", CORREO);
    await pagina.type("#field-password", CLAVE);
    await Promise.all([
      pagina.waitForNavigation({ waitUntil: "networkidle2", timeout: 90_000 }).catch(() => {}),
      pagina.click('button[type="submit"]'),
    ]);
    paso("login", pagina.url().replace(ADMIN, ""));
  }

  if (/login|create-first-user/.test(pagina.url())) {
    throw new Error(`no se pudo entrar al admin: sigo en ${pagina.url()}`);
  }

  /* ── 2 · UNA INSTANCIA DE CADA SUJETO, guardada SIN CAMBIOS ────────────── */
  for (const col of SUJETOS) {
    try {
      await pagina.goto(`${ADMIN}/admin/collections/${col}?limit=1`, { waitUntil: "networkidle2", timeout: 90_000 });
      /* El primer enlace a un documento de la lista. Se deriva del DOM en vez
       * de construir la URL con un id: los ids los pone la DB y adivinarlos
       * sería cablear el estado de un seed concreto. */
      const href = await pagina.evaluate(
        (c) =>
          [...document.querySelectorAll("a")]
            .map((a) => a.getAttribute("href") || "")
            .find((h) => new RegExp(`/admin/collections/${c}/[^/?#]+$`).test(h) && !/\/create$/.test(h)) ?? null,
        col,
      );
      if (!href) {
        ev.fallo(col, "la lista no trae ningún documento");
        salida.guardados.push({ coleccion: col, ok: false, motivo: "0 documentos en la lista" });
        continue;
      }
      await pagina.goto(`${ADMIN}${href}`, { waitUntil: "networkidle2", timeout: 90_000 });
      const id = href.split("/").pop();

      /* ══════════════════════════════════════════════════════════════════════
       * ⚠ **«GUARDAR SIN CAMBIOS» NO ES EJECUTABLE TAL CUAL, y el protocolo lo
       * daba por hecho.** Medido: en un documento recién abierto el botón sale
       * `disabled: true` —`#action-save`, `btn--disabled`— porque Payload
       * deshabilita el guardado en un formulario intacto. Un `.click()` sobre
       * él no da error: **no hace nada**, y la primera versión de esta sonda
       * sacó `0 de 12` con «guardé y el admin no confirmó», que es un rojo
       * correcto por el motivo equivocado.
       *
       * La adaptación **conserva la pregunta**: se ensucia el formulario por un
       * campo de TEXTO SIMPLE (una tecla y un borrado) y **se comprueba que su
       * valor queda idéntico**. El campo rico NO se toca, que es lo que importa:
       * si se tecleara en él, cualquier diferencia posterior sería atribuible al
       * tecleo y no a la normalización.
       *
       * Y sigue midiendo lo que tiene que medir porque **el formulario serializa
       * TODOS los campos al guardar**: el rico pasa por el serializador del
       * editor aunque nadie lo haya tocado. Que es exactamente la degradación
       * que un `payload.update()` no puede provocar.
       * ═════════════════════════════════════════════════════════════════════ */
      const campo = await pagina.evaluate(() => {
        for (const sel of ["#field-nombre", "#field-titulo", "#field-slug"]) {
          const e = document.querySelector(sel);
          if (e && !e.disabled && !e.readOnly) return sel;
        }
        const e = [...document.querySelectorAll('input[type="text"]')].find((x) => !x.disabled && !x.readOnly && x.id);
        return e ? `#${e.id}` : null;
      });
      if (!campo) {
        ev.fallo(col, "no hay campo de texto simple con el que ensuciar el formulario");
        salida.guardados.push({ coleccion: col, ok: false, motivo: "sin campo para ensuciar" });
        continue;
      }
      const valorAntes = await pagina.$eval(campo, (e) => e.value);
      await pagina.click(campo);
      await pagina.keyboard.type("X");
      await pagina.keyboard.press("Backspace");
      const valorDespues = await pagina.$eval(campo, (e) => e.value);
      if (valorAntes !== valorDespues) {
        /* Regla 6: si el campo NO volvió a su valor, esto ya no es «guardar sin
         * cambios» y su verde no valdría. Se rechaza, no se sigue. */
        ev.fallo(col, `el campo ${campo} no volvió a su valor: la prueba dejaría de ser sin-cambios`);
        salida.guardados.push({ coleccion: col, ok: false, motivo: "el campo no volvió a su valor" });
        continue;
      }

      const habilitado = await pagina.evaluate(() => {
        const b = document.querySelector("#action-save");
        return b ? !b.disabled : null;
      });
      if (!habilitado) {
        ev.fallo(col, `el botón de guardar sigue ${habilitado === null ? "ausente" : "deshabilitado"}`);
        salida.guardados.push({ coleccion: col, ok: false, motivo: "Save deshabilitado tras ensuciar" });
        continue;
      }

      /* ── LA CONFIRMACIÓN es `updatedAt` DE LA API, no un toast ──────────────
       * §El principio: se verifica contra la salida servida, no contra el texto
       * que la interfaz dice de sí misma. Un toast puede aparecer, desaparecer
       * antes de que lo leas o estar traducido; `updatedAt` prueba que el save
       * **llegó a la DB**. Sin esto, «no encontré el toast» y «el save no
       * ocurrió» dan la misma salida — que es justo lo que pasó a la primera. */
      const antes = await pagina.evaluate(async (c, i) => (await (await fetch(`/api/${c}/${i}`)).json())?.updatedAt ?? null, col, id);
      await pagina.click("#action-save");
      const cambio = await pagina
        .waitForFunction(
          async (c, i, prev) => {
            const r = await fetch(`/api/${c}/${i}`);
            const j = await r.json();
            return j?.updatedAt && j.updatedAt !== prev;
          },
          { timeout: 45_000, polling: 1000 },
          col,
          id,
          antes,
        )
        .then(() => true)
        .catch(() => false);
      const despues = await pagina.evaluate(async (c, i) => (await (await fetch(`/api/${c}/${i}`)).json())?.updatedAt ?? null, col, id);

      salida.guardados.push({
        coleccion: col,
        ok: cambio,
        doc: href,
        campoEnsuciado: campo,
        valorIntacto: valorAntes === valorDespues,
        updatedAt: { antes, despues },
      });
      if (cambio) {
        ev.ok();
        paso(`guardado ${col}`, `${id} · ${campo} · updatedAt ${antes} → ${despues}`);
      } else {
        ev.fallo(col, `el save no llegó a la DB: updatedAt sigue en ${antes}`);
      }
    } catch (e) {
      ev.fallo(col, e.message);
      salida.guardados.push({ coleccion: col, ok: false, motivo: String(e.message).slice(0, 140) });
    }
  }
} finally {
  await navegador.close().catch(() => {});
  try {
    rmSync(perfil, { recursive: true, force: true });
  } catch {
    /* el perfil es temporal; que no se pueda borrar no invalida la medida */
  }
}

const ok = salida.guardados.filter((g) => g.ok).length;
console.log(`\n═══ PRUEBA DE OPERACIÓN ════════════════════════════════════════`);
console.log(`  sujetos (colecciones que LLEGAN al render) ... ${String(SUJETOS.length).padStart(3)}`);
console.log(`  guardados sin cambios y confirmados .......... ${String(ok).padStart(3)}`);
for (const g of salida.guardados.filter((x) => !x.ok)) console.log(`     ✗ ${g.coleccion} — ${g.motivo ?? g.confirmacion}`);
console.log(`\n  FUERA del criterio, con su razón:`);
for (const [c, por] of Object.entries(FUERA)) console.log(`     · ${c.padEnd(14)} ${por}`);
console.log(
  `\n  ⚠ ESTO NO ES EL VEREDICTO. Guardar es la MITAD de la prueba; la otra es\n` +
    `    reconstruir y comparar contra medidas/html-operacion-antes.json con\n` +
    `    \`qa:html-cmp\`. Sin ese paso, «12 guardados» no dice nada del render.`,
);

w("medidas/admin-operacion.json", salida);

ev.informe();
/* `exitCode`, no `exit()`: esta sonda hace `fetch` (§F2-3-EXIT-FETCH). */
process.exitCode = ok === SUJETOS.length ? 0 : 1;
