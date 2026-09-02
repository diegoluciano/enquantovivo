# tools/ — geradores de derivados

Rodados fora do fluxo do site (precisam de Node + headless Chrome + ffmpeg).
Ajuste os caminhos absolutos no topo de cada script se mover o projeto.

- `export-png-pdf.mjs`            → PNG (transparente @1x/@2x/@4x) + PDF vetorial dos 8 SVGs → `exports/` + zips em `downloads/`
- `build-assinatura-simplificada.mjs` → assinatura simplificada (símbolo + logotipo em contornos, Archivo Black provisória)
- `build-logo-animado.sh`        → captura frames de `downloads/logo-animado.html` e monta MP4 / GIF / MOV(alpha) / APNG
- `ArchivoBlack-Regular.ttf`     → fonte provisória do logotipo (trocar pela Nexa Rust oficial)

`npm i opentype.js` antes de rodar o script da assinatura.
