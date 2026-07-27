import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = path.join(root, "public/assets/photography/salto-na-montanha.jpg");
const logoPath = path.join(root, "public/assets/brand/logos/branca completa.svg");
const outputPath = path.join(root, "public/og-enquanto-vivo-2026.png");

const logo = await sharp(await readFile(logoPath))
  .resize({ width: 350, fit: "inside" })
  .png()
  .toBuffer();

const treatment = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#080808" stop-opacity=".34"/>
        <stop offset=".48" stop-color="#080808" stop-opacity=".46"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".78"/>
      </linearGradient>
      <radialGradient id="vignette" cx=".48" cy=".46" r=".72">
        <stop offset="0" stop-color="#080808" stop-opacity=".04"/>
        <stop offset="1" stop-color="#080808" stop-opacity=".54"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#shade)"/>
    <rect width="1200" height="630" fill="url(#vignette)"/>
    <path d="M60 72H1140" stroke="#FFFFFF" stroke-opacity=".34"/>
    <path d="M60 558H1140" stroke="#FFFFFF" stroke-opacity=".34"/>
    <text x="60" y="116" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="17" font-weight="600" letter-spacing="6">CENTRAL DE MARCA</text>
    <text x="60" y="535" fill="#FFFFFF" fill-opacity=".82" font-family="Arial, sans-serif" font-size="14" letter-spacing="3">DIRETRIZES · APLICAÇÕES · ARQUIVOS OFICIAIS</text>
  </svg>
`);

await sharp(sourcePath)
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .modulate({ saturation: 0.52, brightness: 0.82 })
  .composite([
    { input: treatment, left: 0, top: 0 },
    { input: logo, left: 770, top: 145 },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPath);

console.log(outputPath);
