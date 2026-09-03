// Captura o downloads/logo-bumper.html e gera o pacote "selo de vídeo":
//   • ProRes 4444 (.mov) com canal alpha — branco + escuro
//   • sequência PNG (.zip) com transparência — branco + escuro
//   • um MP4 de prévia (selo sobre foto real) pra vitrine da seção 07
//   • enquantovivo-selo-video.zip com tudo + LEIA-ME
// Pré-requisito: node tools/build-selo-video-html.mjs  (gera o HTML)
// puppeteer-core precisa estar acessível via NODE_PATH ou node_modules local.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HTML = `file://${SITE.replace(/ /g, "%20")}/downloads/logo-bumper.html`;
const OUTDIR = join(SITE, "downloads/selo-video");
const TMP = join(SITE, "downloads/.selo-frames");
const PREVIEW_PHOTO = join(SITE, "assets/img/slope-goldenhour.jpg");
const W = 1920, H = 1080, FPS = 24, SCRIM = 0.2;

rmSync(OUTDIR, { recursive: true, force: true }); mkdirSync(OUTDIR, { recursive: true });
rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "shell", pipe: true, timeout: 90000,
  args: ["--force-color-profile=srgb", "--hide-scrollbars"],
});

for (const v of ["branco", "escuro"]) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(`${HTML}?v=${v}&scrim=${SCRIM}&capture=1`, { waitUntil: "networkidle0" });
  await page.waitForFunction("typeof window.__seek === 'function'", { timeout: 8000 });
  const total = await page.evaluate(() => window.__TOTAL);
  const N = Math.round(total * FPS) + 1;
  const dir = join(TMP, v); mkdirSync(dir, { recursive: true });
  for (let i = 0; i < N; i++) {
    await page.evaluate((p) => window.__seek(p), i / (N - 1));
    await new Promise((r) => setTimeout(r, 12));
    await page.screenshot({ path: join(dir, `f_${String(i).padStart(4, "0")}.png`), omitBackground: true });
  }
  console.log(`${v}: ${N} frames (${total.toFixed(2)}s)`);
  await page.close();

  execFileSync("ffmpeg", ["-y", "-framerate", String(FPS), "-i", join(dir, "f_%04d.png"),
    "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-qscale:v", "6",
    "-vendor", "apl0", "-metadata:s:v:0", `title=Enquanto Vivo selo de video (${v})`,
    join(OUTDIR, `enquantovivo-selo-video-${v}-prores4444.mov`)], { stdio: "pipe" });
  execFileSync("bash", ["-c",
    `cd "${dir}" && zip -qr "${join(OUTDIR, `enquantovivo-selo-video-${v}-png-sequence.zip`)}" . -x '.*'`]);
}

// prévia: selo branco sobre foto real, H.264
execFileSync("ffmpeg", ["-y", "-loop", "1", "-i", PREVIEW_PHOTO,
  "-framerate", String(FPS), "-i", join(TMP, "branco", "f_%04d.png"),
  "-filter_complex",
  "[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1[bg];[bg][1:v]overlay=shortest=1[v]",
  "-map", "[v]", "-r", String(FPS), "-c:v", "libx264", "-profile:v", "high",
  "-pix_fmt", "yuv420p", "-crf", "19", "-movflags", "+faststart",
  join(OUTDIR, "enquantovivo-selo-video-preview.mp4")], { stdio: "pipe" });

writeFileSync(join(OUTDIR, "LEIA-ME.txt"),
`SELO DE VÍDEO — Enquanto Vivo
=============================
Clipe pronto pra edição: o fundo escuro (20%) entra, o selo monta
(símbolo -> anel letra por letra -> sol), segura, desmonta ao contrário,
e o fundo sai. Tudo sobre TRANSPARENTE — é só jogar por cima da imagem.

  *-prores4444.mov       ProRes 4444, alpha 10-bit, 1920x1080 @24fps.
                         Padrão pra Premiere / DaVinci / FCP / After Effects.
  *-png-sequence.zip     PNGs numerados com transparência (qualidade máxima,
                         qualquer software). Importar como sequência a 24fps.

branco  = pra imagem escura   ·   escuro = pra imagem clara

enquantovivo-selo-video-preview.mp4 = só demonstração (selo sobre uma imagem
real, com o fundo a 20%). Não usar na edição — é opaco.

Obs.: WebM VP9 com alpha não foi gerado — o ffmpeg desta máquina não exporta
alpha em VP9. O ProRes 4444 cobre a edição profissional; a sequência PNG
cobre qualquer outro caso.
`);

await browser.close();
execFileSync("bash", ["-c",
  `cd "${OUTDIR}" && rm -f ../enquantovivo-selo-video.zip && zip -qr ../enquantovivo-selo-video.zip . -x '.*'`]);
rmSync(TMP, { recursive: true, force: true });
for (const v of ["branco", "escuro"]) {
  console.log(v, "ProRes:", execFileSync("ffprobe", ["-v", "error", "-select_streams", "v",
    "-show_entries", "stream=codec_name,pix_fmt", "-of", "csv=p=0",
    join(OUTDIR, `enquantovivo-selo-video-${v}-prores4444.mov`)], { encoding: "utf8" }).trim());
}
console.log("bundle:", execFileSync("du", ["-h", join(SITE, "downloads/enquantovivo-selo-video.zip")], { encoding: "utf8" }).split("\t")[0]);
