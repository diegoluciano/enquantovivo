import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SITE = "/Volumes/SSD EXTERNO/FREELAS/Enquanto Vivo/Conceito 3/site";
const SCR = "/private/tmp/claude-501/-Volumes-SSD-EXTERNO-FREELAS-Enquanto-Vivo-Conceito-3-site/20f6f441-21c6-4442-90e5-92fcfb632864/scratchpad";

const GS = `'Google Sans','Google Sans Text','Product Sans',-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`;
const NAME = "Fábio Mendonça";
const ROLE = "Viajante · Canal Enquanto Vivo";

// sizes in the same unit space as a 100-unit-tall seal
const S_NAME = 25.5, W_NAME = 600, TR_NAME = 0.002;
const S_ROLE = 10,  W_ROLE = 600, TR_ROLE = 0.16;   // uppercased, tracked
const LEAD   = 20;                                   // baseline1 -> baseline2

// ---- measure text widths + cap height with headless Chrome (fallback metrics ~ Google Sans) ----
const measHtml = `<!doctype html><meta charset=utf8><body style="margin:0">
<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="400">
 <text id="n" x="0" y="120" font-family="${GS}" font-weight="${W_NAME}" font-size="${S_NAME}" letter-spacing="${S_NAME*TR_NAME}">${NAME}</text>
 <text id="r" x="0" y="220" font-family="${GS}" font-weight="${W_ROLE}" font-size="${S_ROLE}" letter-spacing="${S_ROLE*TR_ROLE}" style="text-transform:uppercase">${ROLE.toUpperCase()}</text>
 <text id="cap" x="0" y="320" font-family="${GS}" font-weight="${W_NAME}" font-size="${S_NAME}">H</text>
</svg>
<script>
 const g=id=>document.getElementById(id).getBBox();
 document.title = JSON.stringify({n:g('n').width, r:g('r').width, capTop:g('cap').y, capH:g('cap').height});
</script>`;
writeFileSync(`${SCR}/_meas.html`, measHtml);
const out = execFileSync(CHROME, ["--headless=new","--disable-gpu","--dump-dom",
  "--virtual-time-budget=1500", `file://${SCR}/_meas.html`], { encoding: "utf8" });
const m = JSON.parse(out.match(/<title>(.*?)<\/title>/)[1].replace(/&quot;/g,'"'));
const nameW = m.n, roleW = m.r, capH = m.capH;
console.log("measured:", JSON.stringify(m));

// ---- geometry ----
const SEAL_VB = [1322.98, 1336.65];
const SEAL_H = 100;
const sc = SEAL_H / SEAL_VB[1];
const SEAL_W = SEAL_VB[0] * sc;
const GAP = 30;
const PAD = 5;

const tx = SEAL_W + GAP;
const blockTop = (capH);               // top of name caps
const blockBot = blockTop + LEAD + capH * 0.0 + S_ROLE * 0.72; // approx bottom of role caps
const blockH = LEAD + capH;             // name capTop -> role baseline-ish
const top = (SEAL_H - blockH) / 2;
const base1 = top + capH;
const base2 = base1 + LEAD;

const textW = Math.max(nameW, roleW);
const VB_W = SEAL_W + GAP + textW + PAD * 2;
const VB_H = SEAL_H + PAD * 2;

function sealInner(variant, fill) {
  const raw = readFileSync(`${SITE}/assets/svg/logo-${variant}.svg`, "utf8");
  const inner = raw.match(/<g id="Camada_1-2"[^>]*>([\s\S]*)<\/g>\s*<\/svg>/)[1];
  return `<g fill="${fill}">` + inner.replace(/class="cls-1"/g, "") + `</g>`;
}

const COLORS = { branco:"#FFFFFF", claro:"#D8DDB8", escuro:"#0D160E" };
for (const [variant, fill] of Object.entries(COLORS)) {
  const svg =
`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W.toFixed(2)} ${VB_H.toFixed(2)}" role="img" aria-label="${NAME} — ${ROLE}">
  <g transform="translate(${PAD} ${PAD})">
    <g transform="scale(${sc.toFixed(5)})">${sealInner(variant, fill)}</g>
    <text x="${tx.toFixed(2)}" y="${base1.toFixed(2)}" fill="${fill}"
      font-family="${GS}" font-weight="${W_NAME}" font-size="${S_NAME}" letter-spacing="${(S_NAME*TR_NAME).toFixed(3)}">${NAME}</text>
    <text x="${tx.toFixed(2)}" y="${base2.toFixed(2)}" fill="${fill}" opacity="0.85"
      font-family="${GS}" font-weight="${W_ROLE}" font-size="${S_ROLE}" letter-spacing="${(S_ROLE*TR_ROLE).toFixed(3)}">${ROLE.toUpperCase()}</text>
  </g>
</svg>
`;
  for (const dir of ["assets/svg", "downloads"])
    writeFileSync(`${SITE}/${dir}/assinatura-autor-${variant}.svg`, svg);
  console.log(`assinatura-autor-${variant}.svg  ${VB_W.toFixed(0)}x${VB_H.toFixed(0)}`);
}
