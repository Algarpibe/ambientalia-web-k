import { readFileSync } from "node:fs";
const t = readFileSync("CLAUDE.md", "utf8");
const casos = [
  ["KV-01 · 7HQMPD", /^`KV-01 · 7HQMPD`\s*$/gm],
  ["KV-08 · 5ZMCFR", /^`KV-08 · 5ZMCFR`\s*$/gm],
];
for (const [marca, anclado] of casos) {
  let libre = 0, i = 0;
  while ((i = t.indexOf(marca, i)) !== -1) { libre++; i += marca.length; }
  const linea = (t.match(anclado) ?? []).length;
  console.log(`${marca.padEnd(18)} forma completa LIBRE: ${libre}  |  anclada a LINEA COMPLETA: ${linea}`);
}
