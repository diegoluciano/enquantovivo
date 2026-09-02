import { readFileSync, writeFileSync } from "node:fs";
import opentype from "opentype.js";

const SCR = "/private/tmp/claude-501/-Volumes-SSD-EXTERNO-FREELAS-Enquanto-Vivo-Conceito-3-site/20f6f441-21c6-4442-90e5-92fcfb632864/scratchpad";
const SITE = "/Volumes/SSD EXTERNO/FREELAS/Enquanto Vivo/Conceito 3/site";
const font = opentype.parse(readFileSync(`${SCR}/archivo-black.ttf`));

const COLORS = { branco: "#FFFFFF", claro: "#D8DDB8", escuro: "#0D160E" };

// ---- geometry (arbitrary units, symbol height = 100) ----
const SYM_VB = [832.12, 852.94];
const SYM_H = 100;
const sc = SYM_H / SYM_VB[1];
const SYM_W = SYM_VB[0] * sc;
const GAP = 20;
const PAD = 5;
const FS = 42;                 // wordmark font size
const LINE_GAP = 13;           // extra space between the two baselines beyond cap height

// build one line as a single path string, letters placed with tracking
function line(text, size, tracking, x0, baseline) {
  let x = x0, d = "";
  for (const ch of text) {
    const p = font.getPath(ch, x, baseline, size);
    d += p.toPathData(3) + " ";
    x += font.getAdvanceWidth(ch, size) + tracking;
  }
  return { d: d.trim(), width: x - tracking - x0 };
}
function measure(text, size, tracking) {
  let w = 0;
  for (const ch of text) w += font.getAdvanceWidth(ch, size) + tracking;
  return w - tracking;
}

const capTop = font.getPath("E", 0, 0, FS).getBoundingBox().y1;   // negative
const CAP = -capTop;

// two baselines, block optically centred on the symbol (nudge up slightly)
const blockH = CAP + LINE_GAP + CAP;
const top = (SYM_H - blockH) / 2 - 1;
const base1 = top + CAP;
const base2 = base1 + CAP + LINE_GAP;

const wx = SYM_W + GAP;
const track1 = FS * 0.03;
const track2 = FS * 0.09;      // VIVO a touch more open, left-aligned (not justified)

const L1 = line("ENQUANTO", FS, track1, wx, base1);
const L2 = line("VIVO", FS, track2, wx, base2);
const wordW = Math.max(L1.width, L2.width);

const VB_W = SYM_W + GAP + wordW + PAD * 2;
const VB_H = SYM_H + PAD * 2;

// extract inner drawing of a simbolo svg, recolour to `fill`
function symbolInner(variant, fill) {
  const raw = readFileSync(`${SITE}/assets/svg/simbolo-${variant}.svg`, "utf8");
  const inner = raw.match(/<g id="Camada_1-2"[\s\S]*?<\/g>\s*<\/g>/)[0];
  return inner
    .replace(/class="cls-1"/g, `fill="${fill}"`)
    .replace(/<g id="Camada_1-2"[^>]*>/, "<g>");
}

for (const [variant, fill] of Object.entries(COLORS)) {
  const svg =
`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W.toFixed(2)} ${VB_H.toFixed(2)}" role="img" aria-label="Enquanto Vivo">
  <g transform="translate(${PAD} ${PAD})">
    <g transform="scale(${sc.toFixed(5)})">${symbolInner(variant, fill)}</g>
    <path fill="${fill}" d="${L1.d}"/>
    <path fill="${fill}" d="${L2.d}"/>
  </g>
</svg>
`;
  for (const dir of ["assets/svg", "downloads"]) {
    writeFileSync(`${SITE}/${dir}/assinatura-simplificada-${variant}.svg`, svg);
  }
  console.log(`assinatura-simplificada-${variant}.svg  ${VB_W.toFixed(0)}x${VB_H.toFixed(0)}  track2=${track2.toFixed(2)}`);
}
