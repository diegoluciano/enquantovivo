#!/bin/bash
# Rebuild logo animado. Requer: Node, puppeteer-core (npm i --no-save puppeteer-core),
# Google Chrome instalado, ffmpeg.  Ajuste os caminhos no topo dos .mjs se mover o projeto.
set -e
here="$(cd "$(dirname "$0")" && pwd)"
SITE="$(cd "$here/.." && pwd)"
FR="$here/_frames"; OUT="$SITE/downloads/logo-animado"
FPS=20; SIZE=640
declare -A BG=( [branco]=0D160E [escuro]=F4F3EB )

node "$here/build-logo-animado-html.mjs"          # (re)gera downloads/logo-animado.html
node "$here/capture-frames.mjs"                   # frames PNG transparentes -> scratchpad/frames
FR="$(node -e "console.log(require('node:path').join(require('node:os').tmpdir()))" 2>/dev/null || true)"
# capture-frames.mjs escreve num caminho fixo; ver a última linha que ele imprime:
FRAMES_DIR="$(node "$here/capture-frames.mjs" 2>&1 | tail -1 | sed 's/^frames -> //')"

rm -rf "$OUT"; mkdir -p "$OUT"
for v in branco escuro; do
  bg=${BG[$v]}
  ffmpeg -y -framerate $FPS -i "$FRAMES_DIR/${v}_%04d.png" -filter_complex \
    "color=c=${bg}:s=${SIZE}x${SIZE}:d=8[b];[0:v]scale=$SIZE:-1:flags=lanczos[f];[b][f]overlay=shortest=1,format=yuv420p" \
    -c:v libx264 -crf 20 -preset veryfast -movflags +faststart -an "$OUT/enquantovivo-logo-animado-${v}.mp4" -loglevel error
  ffmpeg -y -framerate $FPS -i "$FRAMES_DIR/${v}_%04d.png" -filter_complex \
    "color=c=${bg}:s=${SIZE}x${SIZE}:d=8[b];[0:v]scale=$SIZE:-1[f];[b][f]overlay=shortest=1,scale=440:-1:flags=lanczos,split[a][c];[a]palettegen=stats_mode=diff[p];[c][p]paletteuse=dither=bayer" \
    -loop 0 "$OUT/enquantovivo-logo-animado-${v}.gif" -loglevel error
  ffmpeg -y -framerate $FPS -i "$FRAMES_DIR/${v}_%04d.png" -vf "scale=$SIZE:-1:flags=lanczos" -c:v qtrle -an "$OUT/enquantovivo-logo-animado-${v}-alpha.mov" -loglevel error
  ffmpeg -y -framerate $FPS -i "$FRAMES_DIR/${v}_%04d.png" -vf "scale=460:-1:flags=lanczos" -f apng -plays 0 "$OUT/enquantovivo-logo-animado-${v}-alpha.png" -loglevel error
done
cp "$SITE/downloads/logo-animado.html" "$OUT/preview.html"
find "$OUT" -name '._*' -delete
( cd "$OUT" && rm -f "$SITE/downloads/enquantovivo-logo-animado.zip" && zip -qr "$SITE/downloads/enquantovivo-logo-animado.zip" . -x '.*' )
ls -la "$OUT"
