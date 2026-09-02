import { readFileSync, writeFileSync } from "node:fs";
const SITE = "/Volumes/SSD EXTERNO/FREELAS/Enquanto Vivo/Conceito 3/site";
const rd = v => readFileSync(`${SITE}/assets/svg/logo-${v}.svg`, "utf8")
  .replace(/<\?xml[^>]*\?>\s*/, "").trim();

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Enquanto Vivo — logo animado</title>
<style>
  html,body{margin:0;height:100%;background:transparent}
  body{display:grid;place-items:center}
  body.preview{background:#0D160E}
  #wrap{width:min(72vmin,560px);aspect-ratio:1/1}
  #wrap svg{width:100%;height:100%;overflow:visible;display:block}
  #wrap svg path,#wrap svg circle{transform-box:fill-box;transform-origin:50% 50%}
</style>
</head>
<body>
  <div id="wrap"></div>
  <script type="text/plain" id="svg-branco">${rd("branco")}</script>
  <script type="text/plain" id="svg-claro">${rd("claro")}</script>
  <script type="text/plain" id="svg-escuro">${rd("escuro")}</script>

<script src="../assets/js/vendor/gsap.min.js"></script>
<script>
(function () {
  var q = new URLSearchParams(location.search);
  var variant = q.get("v") || "branco";
  if (q.get("bg") !== "none") document.body.classList.add("preview");

  var wrap = document.getElementById("wrap");
  wrap.innerHTML = (document.getElementById("svg-" + variant) || document.getElementById("svg-branco")).textContent;
  var svg = wrap.querySelector("svg");

  var paths   = Array.prototype.slice.call(svg.querySelectorAll("path"));
  var circles = Array.prototype.slice.call(svg.querySelectorAll("circle"));
  var symbol   = paths[0];
  var sun      = paths[1];
  var enquanto = paths.slice(2, 10);
  var vivo     = paths.slice(10, 14);
  var letters  = enquanto.concat([circles[0]]).concat(vivo).concat([circles[1]]).filter(Boolean);

  // viewBox centre — used to give each ring glyph a tiny radial "settle"
  var vb = (svg.getAttribute("viewBox") || "0 0 1322.98 1336.65").split(/\s+/).map(Number);
  var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2;
  var RADIAL = 26;                       // how far in (user units) each glyph starts
  var offset = letters.map(function (el) {
    var b = el.getBBox ? el.getBBox() : { x: cx, y: cy, width: 0, height: 0 };
    var gx = b.x + b.width / 2, gy = b.y + b.height / 2;
    var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy) || 1;
    return { x: -(dx / d) * RADIAL, y: -(dy / d) * RADIAL };
  });

  var tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  // hidden from the first frame — sun sits just ABOVE its final spot (never crosses the line-art)
  tl.set(sun, { opacity: 0, y: -22 }, 0);
  letters.forEach(function (el, i) {
    tl.set(el, { opacity: 0, x: offset[i].x, y: offset[i].y }, 0);
  });

  // 1 — symbol appears (no writing, no sun)
  tl.from(symbol, { opacity: 0, scale: 0.94, duration: 1.0, ease: "expo.out" }, 0);

  // 2 — ring text settles in, glyph by glyph: fade + short radial drift, expo ease,
  //     tight cascade that eases its own rhythm
  var START = 0.85, LDUR = 0.75;
  letters.forEach(function (el, i) {
    tl.to(el, { opacity: 1, x: 0, y: 0, duration: LDUR, ease: "expo.out" },
          START + i * 0.052);
  });
  var lettersEnd = START + (letters.length - 1) * 0.052 + LDUR;

  // 3 — sun fades in slightly high, then eases gently down into place
  tl.to(sun, { opacity: 1, duration: 0.55, ease: "power2.out" }, lettersEnd - 0.35)
    .to(sun, { y: 0, duration: 1.15, ease: "power3.out" }, lettersEnd - 0.35);

  tl.to({}, { duration: 0.9 });

  window.__TOTAL = tl.duration();
  window.__seek = function (p) { tl.progress(Math.max(0, Math.min(1, p))); };

  var seek = q.get("seek");
  if (seek !== null) tl.progress(Math.max(0, Math.min(1, parseFloat(seek))));
  else if (q.get("capture") !== null) tl.progress(0);
  else tl.repeat(-1).repeatDelay(0.9).play(0);
})();
</script>
</body>
</html>
`;
writeFileSync(`${SITE}/downloads/logo-animado.html`, html);
console.log("wrote logo-animado.html", html.length, "bytes");
