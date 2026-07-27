import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public/assets/mockups/horizonte-vivo-horizontal.png");
const logoPath = path.join(root, "public/assets/brand/logos/branca completa.svg");
const outputPath = path.join(root, "public/assets/mockups/enquanto-vivo-youtube-banner-2560x1440.png");

const logo = await sharp(await readFile(logoPath))
  .resize({ width: 540, fit: "inside" })
  .png()
  .toBuffer();

const treatment = Buffer.from(`
  <svg width="2560" height="1440" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#080808" stop-opacity=".12"/>
        <stop offset=".52" stop-color="#080808" stop-opacity=".18"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".58"/>
      </linearGradient>
      <radialGradient id="focus" cx=".5" cy=".48" r=".54">
        <stop offset="0" stop-color="#080808" stop-opacity=".08"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".36"/>
      </radialGradient>
    </defs>
    <rect width="2560" height="1440" fill="url(#shade)"/>
    <rect width="2560" height="1440" fill="url(#focus)"/>
  </svg>
`);

await sharp(sourcePath)
  .resize(2560, 1440, { fit: "cover", position: "centre" })
  .composite([
    { input: treatment, left: 0, top: 0 },
    { input: logo, gravity: "centre" },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPath);

console.log(outputPath);
