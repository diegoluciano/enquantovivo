#!/bin/bash
# Capa de canal do YouTube: foto (grade da marca) + selo branco, 2560x1440,
# + recorte da área segura mobile 1546x423. Requer ffmpeg.
set -e
here="$(cd "$(dirname "$0")" && pwd)"; SITE="$(cd "$here/.." && pwd)"; DL="$SITE/downloads"
PHOTO="$SITE/assets/img/channel-cover.jpg"
BADGE="$SITE/exports/png/enquantovivo-logo-branco@4x.png"
BW=360; X=1600   # selo dentro da área segura (x 507..2053)
ffmpeg -y -i "$PHOTO" -i "$BADGE" -filter_complex "\
[0:v]scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,\
eq=saturation=0.5:brightness=-0.06:contrast=1.06,format=rgb24[bg];\
[1:v]scale=${BW}:-1[mk];[bg][mk]overlay=x=${X}:y=(main_h-overlay_h)/2" \
-q:v 2 "$DL/enquantovivo-youtube-capa-2560x1440.jpg" -loglevel error
ffmpeg -y -i "$DL/enquantovivo-youtube-capa-2560x1440.jpg" \
-vf "crop=2400:660:80:250" -q:v 3 \
"$DL/enquantovivo-youtube-capa-mobile.jpg" -loglevel error
echo "ok"
