/**
 * Los cabos sueltos del recon del MONOGRÁFICO, medidos en la salida servida:
 *   · el kicker de la cabecera (es texto plano en un `.et_pb_text`, no un heading)
 *   · los módulos del hero uno a uno — el monográfico mete TRES donde SECTOR mete dos
 *   · la piel del shortcode `calls` (¿"foto" o "fondo"?)
 *   · el `<h4>` de la serie: su `padding-left: 40px` y si lleva marcador `::before`
 *   · el mapa de punteados: en qué columnas del cuerpo aparece y en cuáles no
 *
 * Uso: node mono-detalle.mjs [ancho]
 * Salida congelada: scripts/qa/medidas/mono-detalle-<ancho>.json
 */
import { Evaluadas, launch, openPage, settle, w } from "./lib.mjs";

const PAGINAS = [
  ["edar", "monitorizacion-ambiental-y-control-de-olores-en-edar"],
  ["petroleo", "monitorizacion-de-emisiones-en-petroleo-y-gas"],
  ["urbano", "calidad-del-aire-en-las-ciudades"],
  ["industria", "control-de-emisiones-industriales"],
];

const width = Number(process.argv[2] || 1440);
const mobile = width <= 500;
const { browser } = await launch();
const todo = {};

/* Contrato de `Evaluadas` (lib.mjs): la sonda DECLARA su mínimo de unidades y,
 * por debajo, el veredicto es NO SE PUDO EVALUAR con código ≠ 0 — nunca verde.
 * Las páginas las cuenta `openPage`, así que aquí no hay ningún `ok()` que se
 * pueda olvidar. */
const ev = new Evaluadas({ nombre: "mono-detalle", unidad: "páginas", minimo: PAGINAS.length, porPaginas: true });

for (const [nombre, slug] of PAGINAS) {
  try {
    const { page } = await openPage(
      browser,
      `https://kunakair.com/es/sectores/${slug}/`,
      { width, height: mobile ? 844 : 900, mobile },
    );
    await settle(page);
    todo[nombre] = await page.evaluate(() => {
      const r = (n) => Math.round(n * 100) / 100;
      const t = (el, n = 70) => (el?.textContent || "").replace(/\s+/g, " ").trim().slice(0, n);
      const tipo = (el) => {
        if (!el) return null;
        const s = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          fs: s.fontSize, lh: s.lineHeight, fw: s.fontWeight, color: s.color,
          pad: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          mt: s.marginTop, mb: s.marginBottom,
          h: r(el.getBoundingClientRect().height),
          txt: t(el, 46),
        };
      };
      const esq = (el) => [...el.querySelectorAll("h1,h2,h3,h4,h5,p,ul,ol,li,table,img,a.et_pb_button,span[style*=color]")]
        .map((n) => n.tagName === "A" ? "btn" : n.tagName === "SPAN" ? "span·" + getComputedStyle(n).color : n.tagName.toLowerCase())
        .join(" ");

      const secs = [...document.querySelectorAll(".et_pb_section")];
      const sinEsp = (el) => (el.textContent || "").replace(/\s+/g, "");
      const iMigas = secs.findIndex((s) => sinEsp(s).startsWith("InicioSectores"));
      const secCab = secs.slice(0, iMigas).find((s) => s.querySelector("h1"));
      const secHero = secs[iMigas + 1];
      const iSlider = secs.findIndex((s) => s.classList.contains("et_pb_fullwidth_section"));
      const cuerpo = secs.slice(iMigas + 2, iSlider);

      // ── cabecera: todos sus módulos ──────────────────────────────────────
      const cabMods = [...(secCab?.querySelectorAll(".et_pb_module") || [])].map((m) => {
        const inner = m.querySelector(".et_pb_text_inner") || m;
        const s = getComputedStyle(m);
        return {
          clases: [...m.classList].filter((c) => /^et_pb_(text|image|button)/.test(c)).join(" "),
          h: r(m.getBoundingClientRect().height),
          mt: s.marginTop, mb: s.marginBottom,
          inner: { h: r(inner.getBoundingClientRect().height), ...tipo(inner) },
          txt: t(m, 46),
        };
      });

      // ── hero: cada módulo con su esqueleto y el tipo de su primer heading ──
      const heroCols = [...(secHero?.querySelectorAll(".et_pb_row > .et_pb_column") || [])];
      const hero = heroCols.map((c) => ({
        clases: [...c.classList].filter((x) => /column_\d_\d/.test(x)).join(" "),
        w: r(c.getBoundingClientRect().width),
        mods: [...c.querySelectorAll(":scope > .et_pb_module")].map((m) => ({
          clases: [...m.classList].filter((x) => /^et_pb_(text|image|button|code)/.test(x)).join(" "),
          esq: esq(m),
          h: r(m.getBoundingClientRect().height),
          mb: getComputedStyle(m).marginBottom,
          primero: tipo(m.querySelector("h1,h2,h3,h4,p")),
          txt: t(m, 54),
        })),
      }));

      // ── el shortcode `calls` (CTA de descarga) ────────────────────────────
      const calls = [...document.querySelectorAll(".calls")].map((c) => {
        const s = getComputedStyle(c);
        return {
          clases: [...c.classList].join(" "),
          pad: `${s.paddingTop} ${s.paddingRight} ${s.paddingBottom} ${s.paddingLeft}`,
          bg: s.backgroundImage.slice(0, 90),
          h: r(c.getBoundingClientRect().height),
          w: r(c.getBoundingClientRect().width),
          img: c.querySelector("img")?.currentSrc || null,
          inner: (() => {
            const i = c.querySelector(".calls-text, .calls-contenido, div");
            if (!i) return null;
            const si = getComputedStyle(i);
            return { cls: i.className, w: r(i.getBoundingClientRect().width), pl: si.paddingLeft, pad: si.padding };
          })(),
          txt: t(c, 60),
        };
      });

      // ── el h4 de la serie: ¿lleva marcador? ───────────────────────────────
      const h4s = [...document.querySelectorAll(".et_pb_text_inner h4")].map((h) => {
        const before = getComputedStyle(h, "::before");
        return {
          ...tipo(h),
          before: { content: before.content, bg: before.backgroundImage.slice(0, 70), w: before.width, h: before.height, pos: before.position, left: before.left },
          sig: h.nextElementSibling?.tagName || null,
          sigTipo: tipo(h.nextElementSibling),
        };
      });

      // ── mapa de punteados por columna del cuerpo ──────────────────────────
      const puntMapa = cuerpo.flatMap((s, i) =>
        [...s.querySelectorAll(".et_pb_row")].flatMap((f, j) =>
          [...f.querySelectorAll(":scope > .et_pb_column")].map((c, k) => {
            const prim = c.querySelector(":scope > .et_pb_module");
            const esPunt = !!prim?.querySelector('img[src*="punteado"]');
            return `S${i}F${j}C${k}:${esPunt ? "punt" : "—"}(${t(c, 24)})`;
          }),
        ),
      );

      // ── h5 dentro de th ───────────────────────────────────────────────────
      const h5 = document.querySelector("table th h5");

      return { cabMods, hero, calls, h4s: h4s.slice(0, 3), nH4: h4s.length, puntMapa, h5: tipo(h5) };
    });
    await page.close();
  } catch (e) {
    todo[nombre] = { error: String(e).slice(0, 200) };
  }
}

w(`medidas/mono-detalle-${width}.json`, todo);

for (const [n, d] of Object.entries(todo)) {
  console.log(`\n═══ ${n} @${width}`);
  if (d.error) { console.log("  ", d.error); continue; }
  console.log("— cabecera");
  d.cabMods.forEach((m) => console.log(`   ${m.clases.padEnd(28)} h${String(m.h).padStart(7)} mt ${m.mt} mb ${m.mb}  inner ${m.inner.tag} ${m.inner.fs}/${m.inner.lh} fw${m.inner.fw} h${m.inner.h}  "${m.txt}"`));
  console.log("— hero");
  d.hero.forEach((c, i) => {
    console.log(`   col${i} ${c.clases} w${c.w}`);
    c.mods.forEach((m) => console.log(`     · ${m.clases.padEnd(22)} h${String(m.h).padStart(7)} mb ${m.mb.padStart(9)}  esq[${m.esq}]  1º:${m.primero ? m.primero.tag + " " + m.primero.fs + "/" + m.primero.lh + " " + m.primero.color : "—"}  "${m.txt}"`));
  });
  console.log("— calls");
  d.calls.forEach((c) => console.log(`   ${c.clases}\n     pad ${c.pad}  ${c.w}×${c.h}  img ${c.img}\n     bg ${c.bg}\n     inner ${JSON.stringify(c.inner)}`));
  console.log(`— h4 (${d.nH4})`);
  d.h4s.forEach((h) => console.log(`   ${h.fs}/${h.lh} fw${h.fw} pad[${h.pad}] before ${JSON.stringify(h.before)} sig ${h.sig} "${h.txt}"`));
  console.log("— h5 en th:", JSON.stringify(d.h5));
  console.log("— punteados:", d.puntMapa.join("  "));
}

await browser.close();
