import puppeteer from "puppeteer-core";
import { mkdirSync, rmSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SITE = "/Volumes/SSD EXTERNO/FREELAS/Enquanto Vivo/Conceito 3/site";
const HTML = `file://${SITE}/downloads/logo-animado.html`;
const FRAMES = 103, SIZE = 640, HOLD = 16;
const variants = process.argv.slice(2);
if (!variants.length) variants.push("branco", "escuro");

const OUT = "/private/tmp/claude-501/-Volumes-SSD-EXTERNO-FREELAS-Enquanto-Vivo-Conceito-3-site/20f6f441-21c6-4442-90e5-92fcfb632864/scratchpad/frames";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "shell",
  args: ["--disable-gpu", "--force-color-profile=srgb", "--hide-scrollbars"],
});

for (const v of variants) {
  const page = await browser.newPage();
  await page.setViewport({ width: SIZE, height: SIZE, deviceScaleFactor: 1 });
  // transparent screenshots
  await page.goto(`${HTML}?v=${v}&bg=none&capture=1`, { waitUntil: "networkidle0" });
  await page.waitForFunction("typeof window.__seek === 'function'", { timeout: 8000 });
  await page.evaluate(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  });
  const t0 = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    await page.evaluate((p) => window.__seek(p), i / (FRAMES - 1));
    await new Promise((r) => setTimeout(r, 16));
    await page.screenshot({
      path: `${OUT}/${v}_${String(i).padStart(4, "0")}.png`,
      omitBackground: true,
    });
  }
  // hold last frame
  for (let k = FRAMES; k < FRAMES + HOLD; k++) {
    await page.screenshot({
      path: `${OUT}/${v}_${String(k).padStart(4, "0")}.png`,
      omitBackground: true,
    });
  }
  console.log(`${v}: ${FRAMES + HOLD} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await page.close();
}
await browser.close();
console.log("frames ->", OUT);
