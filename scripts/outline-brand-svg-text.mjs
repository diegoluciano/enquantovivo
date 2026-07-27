import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as fontkit from "fontkit";

const root = process.cwd();
const fontCollection = fontkit.openSync("/System/Library/Fonts/Supplemental/GillSans.ttc");
const font = fontCollection.fonts.find((candidate) => candidate.postscriptName === "GillSans");

if (!font) {
  throw new Error("Gill Sans regular não encontrada.");
}

const files = [
  "public/assets/brand/logos/avatar branco.svg",
  "public/assets/brand/logos/avatar preto.svg",
  "public/assets/brand/logos/branca completa.svg",
  "public/assets/brand/logos/preta completa.svg",
  "public/assets/brand/logos/simplificada branca.svg",
  "public/assets/brand/logos/simplificada preta.svg",
];

function attribute(source, name) {
  return source.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "";
}

function classProperty(svg, className, property) {
  const blocks = [...svg.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
  for (const [, selectors, declarations] of blocks) {
    const classNames = selectors.match(/\.([\w-]+)/g)?.map((selector) => selector.slice(1)) ?? [];
    if (!classNames.includes(className)) continue;
    const value = declarations.match(new RegExp(`${property}:\\s*([^;]+)`))?.[1]?.trim();
    if (value) return value;
  }
  return "";
}

function numberValue(value) {
  return Number.parseFloat(value) || 0;
}

function outlineRun(text, x, y, fontSize, letterSpacing) {
  const run = font.layout(text);
  const scale = fontSize / font.unitsPerEm;
  let cursor = 0;

  return run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const glyphX = x + cursor + position.xOffset * scale;
    const glyphY = y - position.yOffset * scale;
    cursor += position.xAdvance * scale + letterSpacing;
    if (!glyph.path.commands.length) return "";
    return `<path d="${glyph.path.toSVG()}" transform="translate(${glyphX.toFixed(4)} ${glyphY.toFixed(4)}) scale(${scale.toFixed(8)} ${(-scale).toFixed(8)})"/>`;
  }).join("");
}

function outlineText(svg, attributes, content) {
  const className = attribute(attributes, "class");
  const transform = attribute(attributes, "transform");
  const fontSize = numberValue(classProperty(svg, className, "font-size"));

  if (!fontSize) {
    throw new Error(`Tamanho de fonte não encontrado para .${className}.`);
  }

  const paths = [...content.matchAll(/<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g)].map((match) => {
    const tspanAttributes = match[1];
    const tspanClass = attribute(tspanAttributes, "class");
    const text = match[2];
    const x = numberValue(attribute(tspanAttributes, "x"));
    const y = numberValue(attribute(tspanAttributes, "y"));
    const letterSpacingValue = classProperty(svg, tspanClass, "letter-spacing");
    const letterSpacing = letterSpacingValue.endsWith("em")
      ? numberValue(letterSpacingValue) * fontSize
      : numberValue(letterSpacingValue);
    return outlineRun(text, x, y, fontSize, letterSpacing);
  }).join("");

  const classAttribute = className ? ` class="${className}"` : "";
  const transformAttribute = transform ? ` transform="${transform}"` : "";
  return `<g${classAttribute}${transformAttribute}>${paths}</g>`;
}

for (const relativePath of files) {
  const filePath = path.join(root, relativePath);
  const original = await readFile(filePath, "utf8");
  const outlined = original
    .replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (_, attributes, content) => outlineText(original, attributes, content))
    .replace(/\s*font-family:\s*[^;]+;/g, "")
    .replace(/\s*font-size:\s*[^;]+;/g, "")
    .replace(/\s*letter-spacing:\s*[^;]+;/g, "");

  await writeFile(filePath, outlined);
  console.log(relativePath);
}
