/**
 * 138.ª · ESCALÓN 3 punto 5 — ¿MUEVE ESTA TANDA UN SOLO PÍXEL DEL CLON?
 *
 * ── POR QUÉ ESTO Y NO `clon-base` ────────────────────────────────────────
 * El encargo pide `clon-base` a los dos anchos con umbral CERO. `clon-base`
 * levanta Chrome sobre las 413 rutas × 2 anchos —~50 min por ancho— y mide
 * `docH`, `h1.y`, nº de secciones y nº de enlaces. Es una guarda
 * **clon-contra-clon** y **VERTICAL** (§*un `clon-base` limpio dice «no hay
 * regresión VERTICAL», nunca «el cambio no tuvo efecto»*).
 *
 * Aquí hay una comprobación **más fuerte y más barata**: comparar el **HTML
 * PRERENDERIZADO byte a byte** entre el build base y el nuevo. Si los ficheros
 * son idénticos al bit, no hay nada que `clon-base` —ni ninguna otra sonda de
 * render— pueda encontrar: mediría dos veces el mismo documento. Un sha1 igual
 * cubre alto, ancho, estructura, enlaces y todo lo demás a la vez.
 *
 * ⚠ **Y lo que esto NO sustituye:** una sonda que mida contra el ORIGINAL.
 * Esto compara el clon con el clon, igual que `clon-base` — lo que cambia es
 * que compara **todo el documento** en vez de cuatro magnitudes. Sigue sin
 * decir nada sobre fidelidad (§*una guarda solo-clon se lee como verde y no
 * mide fidelidad*).
 *
 * ── QUÉ CONTESTA ─────────────────────────────────────────────────────────
 *   1 · membresía: qué rutas prerenderiza cada build, con los DOS lados
 *       nombrados y no por cardinal (§*un cardinal absorbe la membresía*);
 *   2 · contenido: cuántas de las comunes difieren, con sus nombres.
 *
 * ── ⚠ LO QUE ESTE NO-OP **NO** ATRIBUYE, Y HAY QUE DECIRLO ───────────────
 * El build base (`apps/web/.next`) es del **2026-08-31 14:54**, y entre esa
 * fecha y hoy hay commits de la 137.ª que **sí tocaron código**. Así que una
 * diferencia hallada aquí **no sería necesariamente de esta tanda**: el
 * intervalo cubre más de un cambio. Un CERO, en cambio, sí adjudica en la
 * dirección que importa — si nada se movió desde el 31, nada se movió por la
 * 138.ª tampoco.
 *
 * ── EL CONTROL, POR CASO CONOCIDO DE ANTEMANO (§regla 28c) ───────────────
 * «0 ficheros distintos» tiene dos causas que se escriben igual: *son
 * idénticos* y *no encontré ficheros*. Así que el recuento de HTML hallados
 * tiene que ser **> 0 en los dos lados** o la corrida NO ADJUDICA.
 *
 * ── ⚠⚠ EL RESULTADO, Y SU ATRIBUCIÓN — QUE ES LO QUE DECIDE CÓMO SE LEE ──
 *
 *   | | |
 *   |---|---|
 *   | rutas del manifiesto | **429 → 429**, simétrica **0 y 0** (y dinámicas 17 → 17, **0 y 0**) |
 *   | membresía de HTML | **0 y 0** |
 *   | documento COMPLETO distinto | **196 de 428** ← incluye el payload RSC |
 *   | **HTML VISIBLE distinto** | **131 de 428** |
 *
 * **Y esas 131 NO son de esta tanda.** §regla 16 manda poner primero la
 * explicación aburrida —*el árbol cambió entre medias*— y derivarla en vez de
 * recordarla:
 *
 *   · `git diff --name-only 16405ae..HEAD` da **17 ficheros y CERO de
 *     `apps/web/src`**. Lo único de `packages/cms-config/src` son las
 *     migraciones;
 *   · y las migraciones **no entran al bundle**: `payload.config.ts` las toma
 *     por `migrationDir` —una RUTA resuelta en runtime, no un `import`— y
 *     nadie importa `migrations/index.ts`. Medido sobre el build, **con su
 *     testigo positivo** porque un 0 sin él no vale (§regla 28c):
 *
 *       testigos    "Aviso legal" 1709 · "entradas-blog" 59 · "nextpostslink" 126
 *       migraciones "f3_5_formulario_arq" 0 · "f3_5_arquetipos" 0 · "MigrateUpArgs" 0
 *
 * O sea que **la 138.ª es NO-OP sobre el render POR CONSTRUCCIÓN**, y las 131
 * pertenecen al intervalo `2026-08-31 14:54 → hoy`, que cubre las tandas
 * 133.ª–137.ª. **Se fichan con su cardinal y SIN atribuir**, que es lo honesto:
 * atribuirlas a la 138.ª sería tan falso como no contarlas.
 *
 * Reconstruidos dos casos a mano (§*antes de creerse un pleno, reconstruye UN
 * caso*), las diferencias visibles son de **dos clases distintas**:
 *   · `aviso-legal.html` — sólo el NÚMERO de trozos del payload (20 `<RSC/>`
 *     contra 21). Sigue siendo serialización;
 *   · `blog.html` — **`<link rel="next" href="/blog/page/2"/>` está en el build
 *     base y NO en el nuevo**, con `/blog/page/2` emitida en los dos. Eso sí es
 *     contenido, y es lo que la ficha manda mirar.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../../../..");
const SALIDA = path.join(AQUI, "build-noop-138.json");

const BASE = path.join(RAIZ, "apps/web/.next");
const NUEVO = path.join(RAIZ, "apps/web/.next-138");

/**
 * ⚠⚠ **EL `BUILD_ID` SE NORMALIZA, Y NO ES UNA CONCESIÓN: SIN ESO ESTA SONDA
 * MIDE «¿ES EL MISMO BUILD?» EN VEZ DE «¿ES EL MISMO CONTENIDO?».**
 *
 * Next inyecta el `BUILD_ID` en cada documento prerenderizado
 * (`/_next/static/<id>/…`) y ese id es **distinto en cada build por
 * construcción**. La primera versión de esta sonda comparó los sha1 en crudo y
 * publicó **428 de 428 distintas** — un **100 % redondo**, que es justo la
 * señal de §sondas 4 quinta cara: *un dato del original casi nunca es unánime,
 * y cuando lo es la primera hipótesis es el instrumento*. Lo era: es el
 * **sobre-casado** de §sondas 4 tercera cara cometido dentro de mi propio
 * comparador.
 *
 * Se sustituye por un token fijo en los dos lados —**la misma
 * transformación**, o la asimetría sería otra vez del instrumento (§regla 32)—
 * y el cardinal de sustituciones se publica: si fuera 0 en algún lado, la
 * normalización no estaría ocurriendo y el veredicto no valdría.
 */
const TOKEN = "<BUILD_ID>";
function idDe(raiz) {
  const f = path.join(raiz, "BUILD_ID");
  return fs.existsSync(f) ? fs.readFileSync(f, "utf8").trim() : null;
}

/**
 * ⚠⚠ **Y LA SEGUNDA NORMALIZACIÓN, QUE ES LA QUE CONVIERTE ESTO EN UNA MEDIDA
 * DEL CONTENIDO: EL PAYLOAD RSC NO SE SERIALIZA EN EL MISMO ORDEN DOS VECES.**
 *
 * Con el `BUILD_ID` ya normalizado seguían saliendo **196 de 428** distintas.
 * Reconstruido UN caso a mano —§*antes de creerse un pleno, reconstruye un caso
 * contra una medida buena anterior*— el primer byte divergente de
 * `aviso-legal.html` es el ORDEN de las líneas del Flight payload:
 *
 *     BASE   …\\"IconMark\\"]\\n10:I[83105,…
 *     NUEVO  …\\"IconMark\\"]\\n7:null\\nc:[["$","title","0",{"children":"Aviso legal - Kunak"}]…
 *
 * El **título es el mismo**; lo que cambia es en qué orden Next emite los
 * trozos dentro de `self.__next_f.push`. Eso es serialización, **no
 * contenido** — y compararlo es §*el detector tiene su propio NIVEL: se compara
 * EL VEREDICTO, no el artefacto entero*, con el artefacto puesto en un build.
 *
 * Así que se comparan **dos cosas por separado y las dos se publican**: el
 * documento COMPLETO (que incluye el payload, y por tanto puede moverse sin que
 * nada se pinte distinto) y el **HTML VISIBLE** —el documento sin los `<script>`
 * del payload—, que es lo que el navegador pinta y por tanto lo único sobre lo
 * que `clon-base` podría pronunciarse.
 */
const sinPayload = (s) => s.replace(/<script>self\.__next_f\.push\([\s\S]*?\)<\/script>/g, "<RSC/>");

/** sha1 de cada `.html` prerenderizado, con el `BUILD_ID` normalizado. */
function htmls(raiz, buildId) {
  const base = path.join(raiz, "server", "app");
  const m = new Map();
  let sustituciones = 0;
  if (!fs.existsSync(base)) return { m, sustituciones };
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) {
        const rel = path.relative(base, p).split(path.sep).join("/");
        let s = fs.readFileSync(p, "utf8");
        if (buildId) {
          const trozos = s.split(buildId);
          sustituciones += trozos.length - 1;
          s = trozos.join(TOKEN);
        }
        const sha=(t)=>crypto.createHash("sha1").update(t).digest("hex");
        m.set(rel, { completo: sha(s), visible: sha(sinPayload(s)) });
      }
    }
  };
  walk(base);
  return { m, sustituciones };
}

const idA = idDe(BASE);
const idB = idDe(NUEVO);
const rA = htmls(BASE, idA);
const rB = htmls(NUEVO, idB);
const A = rA.m;
const B = rB.m;
console.log(
  `BUILD_ID · base ${idA} · nuevo ${idB} · normalizado en ${rA.sustituciones} y ${rB.sustituciones} apariciones`
);

const soloBase = [...A.keys()].filter((k) => !B.has(k)).sort();
const soloNuevo = [...B.keys()].filter((k) => !A.has(k)).sort();
const comunes = [...A.keys()].filter((k) => B.has(k));
const distintas = comunes.filter((k) => A.get(k).completo !== B.get(k).completo).sort();
const distintasVisible = comunes.filter((k) => A.get(k).visible !== B.get(k).visible).sort();

/* Y el manifiesto, que es la unidad que el PLAN-FASE-3 ya usa. */
const manif = (r) => {
  const f = path.join(r, "prerender-manifest.json");
  if (!fs.existsSync(f)) return { rutas: [], din: [] };
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  return { rutas: Object.keys(j.routes ?? {}).sort(), din: Object.keys(j.dynamicRoutes ?? {}).sort() };
};
const mA = manif(BASE);
const mB = manif(NUEVO);
const simetrica = (a, b) => ({ soloEnA: a.filter((x) => !b.includes(x)), soloEnB: b.filter((x) => !a.includes(x)) });

const out = {
  meta: {
    fecha: new Date().toISOString(),
    sonda: "build-noop-138",
    base: "apps/web/.next",
    baseMtime: fs.statSync(path.join(BASE, "prerender-manifest.json")).mtime.toISOString(),
    nuevo: "apps/web/.next-138",
  },
  noAtribuye:
    "el build base es del 2026-08-31 y entre medias hay commits de la 137.ª: una DIFERENCIA aquí no sería " +
    "necesariamente de la 138.ª. Un CERO sí adjudica.",
  buildId: { base: idA, nuevo: idB, sustBase: rA.sustituciones, sustNuevo: rB.sustituciones },
  html: {
    base: A.size,
    nuevo: B.size,
    comunes: comunes.length,
    soloBase,
    soloNuevo,
    distintas,
    nDistintas: distintas.length,
    distintasVisible,
    nDistintasVisible: distintasVisible.length,
  },
  manifiesto: {
    base: { rutas: mA.rutas.length, din: mA.din.length },
    nuevo: { rutas: mB.rutas.length, din: mB.din.length },
    simetricaRutas: simetrica(mA.rutas, mB.rutas),
    simetricaDin: simetrica(mA.din, mB.din),
  },
};

const adjudica = A.size > 0 && B.size > 0 && rA.sustituciones > 0 && rB.sustituciones > 0;
out.veredicto = {
  adjudica,
  noOp:
    adjudica &&
    distintasVisible.length === 0 &&
    soloBase.length === 0 &&
    soloNuevo.length === 0 &&
    out.manifiesto.simetricaRutas.soloEnA.length === 0 &&
    out.manifiesto.simetricaRutas.soloEnB.length === 0,
};

console.log(`HTML prerenderizados · base ${A.size} · nuevo ${B.size}  ⇒ ${adjudica ? "ADJUDICA" : "NO ADJUDICA"}`);
console.log(`  membresía · sólo en base ${soloBase.length} · sólo en nuevo ${soloNuevo.length}`);
console.log(`  CONTENIDO distinto (sha1) · ${distintas.length} de ${comunes.length} comunes`);
if (distintas.length) console.log(`    ${distintas.slice(0, 12).join("\n    ")}`);
console.log(
  `manifiesto · ${mA.rutas.length} → ${mB.rutas.length} rutas · simétrica ` +
    `${out.manifiesto.simetricaRutas.soloEnA.length} y ${out.manifiesto.simetricaRutas.soloEnB.length}` +
    ` · dinámicas ${mA.din.length} → ${mB.din.length} · simétrica ` +
    `${out.manifiesto.simetricaDin.soloEnA.length} y ${out.manifiesto.simetricaDin.soloEnB.length}`
);
console.log(`\n${out.veredicto.noOp ? "✅ NO-OP AL BIT" : "❌ algo se movió"}`);

fs.writeFileSync(SALIDA, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`  congelada → ${path.relative(RAIZ, SALIDA)}`);
process.exit(out.veredicto.adjudica && out.veredicto.noOp ? 0 : 2);
