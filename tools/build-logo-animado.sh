#!/bin/bash
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SITE="/Volumes/SSD EXTERNO/FREELAS/Enquanto Vivo/Conceito 3/site"
H="file://$SITE/downloads/logo-animado.html"
W="/private/tmp/claude-501/-Volumes-SSD-EXTERNO-FREELAS-Enquanto-Vivo-Conceito-3-site/20f6f441-21c6-4442-90e5-92fcfb632864/scratchpad/anim"
FPS=25 ; FRAMES=78 ; CAP=800 ; SIZE=640
OUT="$SITE/downloads/logo-animado"
mkdir -p "$W" "$OUT"

shoot(){ local v=$1 i=$2
  local seek=$(awk "BEGIN{printf \"%.5f\",$i/($FRAMES-1)}")
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-color-profile=srgb \
    --default-background-color=00000000 --virtual-time-budget=1300 --window-size=$CAP,$CAP \
    --screenshot="$W/${v}_$(printf '%03d' $i).png" "$H?v=$v&bg=none&seek=$seek" >/dev/null 2>&1; }
export -f shoot; export CHROME H W FPS FRAMES CAP

# capture escuro (branco frames already exist from the earlier run)
echo "capturing escuro..."
seq 0 $((FRAMES-1)) | xargs -P 4 -I{} bash -c 'shoot escuro {}'
for v in branco escuro; do
  last=$(printf '%03d' $((FRAMES-1)))
  for k in $(seq $FRAMES $((FRAMES+14))); do cp "$W/${v}_${last}.png" "$W/${v}_$(printf '%03d' $k).png" 2>/dev/null || true; done
done

for v in branco escuro; do
  echo "encoding $v..."
  # transparent WebM (VP9 alpha)
  ffmpeg -y -framerate $FPS -i "$W/${v}_%03d.png" -vf "scale=$SIZE:-1:flags=lanczos" \
    -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 30 -an \
    "$OUT/enquantovivo-logo-animado-${v}-alpha.webm" -loglevel error
  # MP4 on brand dark
  ffmpeg -y -framerate $FPS -i "$W/${v}_%03d.png" -filter_complex \
    "color=c=0D160E:s=${SIZE}x${SIZE}:d=6[bg];[0:v]scale=$SIZE:-1:flags=lanczos[fg];[bg][fg]overlay=shortest=1,format=yuv420p" \
    -c:v libx264 -crf 20 -preset veryfast -movflags +faststart -an \
    "$OUT/enquantovivo-logo-animado-${v}.mp4" -loglevel error
  # GIF on brand dark, 420px
  ffmpeg -y -framerate $FPS -i "$W/${v}_%03d.png" -filter_complex \
    "color=c=0D160E:s=${SIZE}x${SIZE}:d=6[bg];[0:v]scale=$SIZE:-1[fg];[bg][fg]overlay=shortest=1,scale=420:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
    -loop 0 "$OUT/enquantovivo-logo-animado-${v}.gif" -loglevel error
done

cp "$SITE/downloads/logo-animado.html" "$OUT/preview.html"
( cd "$OUT" && zip -qr "$SITE/downloads/enquantovivo-logo-animado.zip" . -x '.*' )
find "$OUT" -name '._*' -delete
ls -la "$OUT"; du -sh "$OUT"/*
