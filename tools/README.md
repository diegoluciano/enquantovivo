# tools/ — geradores de derivados

Fora do fluxo do site (precisam de Node + headless Chrome + ffmpeg).
Ajuste os caminhos absolutos no topo de cada script se mover o projeto.

- `export-png-pdf.mjs`          → PNG (transparente @1x/@2x/@4x) + PDF vetorial dos SVGs → `exports/` + zips em `downloads/`
- `build-assinatura-autor.mjs`  → assinatura do autor: selo + "Fábio Mendonça" + título em Google Sans (texto vivo). Edite NAME/ROLE no topo.
- `build-logo-animado-html.mjs` → (re)gera `downloads/logo-animado.html` embutindo os 3 SVGs do selo
- `build-logo-animado.sh`       → captura frames do HTML acima e monta MP4 / GIF / MOV(alpha) / APNG

`npm i opentype.js` só é necessário se voltar a usar assinatura em contornos.
- `build-youtube-capa.sh`       → capa 2560x1440 (foto graduada + selo, selo dentro da área segura) + versão mobile (crop mais aberto, selo dentro do enquadramento)
