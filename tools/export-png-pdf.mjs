import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { basename } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SITE = "/Volumes/SSD EXTERNO/FREELAS/Enquanto Vivo/Conceito 3/site";
const SVG_DIR = `${SITE}/assets/svg`;
const OUT = `${SITE}/exports`;
const TMP = "/private/tmp/claude-501/-Volumes-SSD-EXTERNO-FREELAS-Enquanto-Vivo-Conceito-3-site/20f6f441-21c6-4442-90e5-92fcfb632864/scratchpad/_x";

const files = [
  "logo-branco","logo-claro","logo-escuro",
  "simbolo-branco","simbolo-claro","simbolo-escuro",
  "avatar1","avatar2",
];
const PNG_SIZES = { "1x": 512, "2x": 1024, "4x": 2048 };
const PDF_MM = 120;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/png`, { recursive: true });
mkdirSync(`${OUT}/pdf`, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const chrome = (args) =>
  execFileSync(CHROME, ["--headless=new","--disable-gpu","--hide-scrollbars",
    "--force-color-profile=srgb","--default-background-color=00000000", ...args],
    { stdio: "pipe" });

for (const name of files) {
  const raw = readFileSync(`${SVG_DIR}/${name}.svg`, "utf8");
  const vb = raw.match(/viewBox="([\d.\s-]+)"/)[1].trim().split(/\s+/).map(Number);
  const [, , vw, vh] = vb;
  const ratio = vw / vh;

  // ---------- PNG (transparent) ----------
  for (const [tag, longest] of Object.entries(PNG_SIZES)) {
    const w = ratio >= 1 ? longest : Math.round(longest * ratio);
    const h = ratio >= 1 ? Math.round(longest / ratio) : longest;
    const svg = raw.replace(/<svg /, `<svg width="${w}" height="${h}" `);
    const html = `<!doctype html><meta charset=utf8><style>*{margin:0}html,body{background:transparent}svg{display:block}</style>${svg}`;
    const hp = `${TMP}/${name}-${tag}.html`;
    writeFileSync(hp, html);
    chrome([`--screenshot=${OUT}/png/enquantovivo-${name}@${tag}.png`,
            `--window-size=${w},${h}`, `--screenshot-format=png`, hp]);
  }

  // ---------- PDF (vector) ----------
  const wmm = ratio >= 1 ? PDF_MM : (PDF_MM * ratio);
  const hmm = ratio >= 1 ? (PDF_MM / ratio) : PDF_MM;
  const svgFull = raw.replace(/<svg /, `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" `);
  const html = `<!doctype html><meta charset=utf8><style>@page{size:${wmm.toFixed(2)}mm ${hmm.toFixed(2)}mm;margin:0}
*{margin:0}html,body{width:100%;height:100%;background:transparent}svg{display:block;width:100%;height:100%}</style>${svgFull}`;
  const hp = `${TMP}/${name}-pdf.html`;
  writeFileSync(hp, html);
  chrome([`--print-to-pdf=${OUT}/pdf/enquantovivo-${name}.pdf`,
          "--no-pdf-header-footer", "--print-to-pdf-no-header", hp]);
  console.log("done", name);
}

// ---------- zip packs ----------
execFileSync("zip", ["-jqr", `${SITE}/downloads/enquantovivo-png.zip`, `${OUT}/png`]);
execFileSync("zip", ["-jqr", `${SITE}/downloads/enquantovivo-pdf.zip`, `${OUT}/pdf`]);
console.log("zips written to downloads/");
