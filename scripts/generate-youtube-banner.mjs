import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public/assets/photography/salto-na-montanha.jpg");
const logoPath = path.join(root, "public/assets/brand/logos/branca completa.svg");
const outputPath = path.join(root, "public/assets/mockups/enquanto-vivo-youtube-banner-2560x1440.png");

const logo = await sharp(await readFile(logoPath))
  .resize({ width: 520, fit: "inside" })
  .png()
  .toBuffer();

const treatment = Buffer.from(`
  <svg width="2560" height="1440" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#080808" stop-opacity=".24"/>
        <stop offset=".52" stop-color="#080808" stop-opacity=".18"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".64"/>
      </linearGradient>
      <linearGradient id="logoShade" x1="0" y1="0" x2="1" y2="0">
        <stop offset=".38" stop-color="#080808" stop-opacity="0"/>
        <stop offset=".7" stop-color="#080808" stop-opacity=".2"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".42"/>
      </linearGradient>
      <radialGradient id="focus" cx=".44" cy=".47" r=".68">
        <stop offset="0" stop-color="#080808" stop-opacity="0"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".34"/>
      </radialGradient>
    </defs>
    <rect width="2560" height="1440" fill="url(#shade)"/>
    <rect width="2560" height="1440" fill="url(#logoShade)"/>
    <rect width="2560" height="1440" fill="url(#focus)"/>
  </svg>
`);

await sharp(sourcePath)
  .resize(2560, 1440, { fit: "cover", position: "centre" })
  .modulate({ saturation: 0.62, brightness: 0.86 })
  .composite([
    { input: treatment, left: 0, top: 0 },
    { input: logo, left: 1480, top: 450 },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPath);

console.log(outputPath);
