// Gera downloads/logo-bumper.html — o "selo de vídeo": scrim escuro entra (~20%) →
// selo monta (símbolo → anel letra por letra → sol) → segura → desmonta ao contrário
// → scrim sai. Tudo sobre transparente. ?v=branco|escuro · ?capture=1 mantém pausado.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const rd = v => readFileSync(join(SITE, `assets/svg/logo-${v}.svg`), "utf8").replace(/<\?xml[^>]*\?>\s*/, "").trim();

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Enquanto Vivo — selo de vídeo</title>
<style>
  html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}
  #scrim{position:fixed;inset:0;background:#0D160E;opacity:0}
  #seal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
  #seal svg{width:auto;height:42vh;max-width:82vw;overflow:visible;display:block}
  #seal svg path,#seal svg circle{transform-box:fill-box;transform-origin:50% 50%}
</style>
</head>
<body>
  <div id="scrim"></div>
  <div id="seal"></div>
  <script type="text/plain" id="svg-branco">${rd("branco")}</script>
  <script type="text/plain" id="svg-claro">${rd("claro")}</script>
  <script type="text/plain" id="svg-escuro">${rd("escuro")}</script>

<script src="../assets/js/vendor/gsap.min.js"></script>
<script>
(function () {
  var q = new URLSearchParams(location.search);
  var variant = q.get("v") || "branco";
  var scrimOpacity = parseFloat(q.get("scrim") || "0.2");

  document.getElementById("seal").innerHTML =
    (document.getElementById("svg-" + variant) || document.getElementById("svg-branco")).textContent;
  var svg = document.querySelector("#seal svg");
  var scrim = document.getElementById("scrim");

  var paths   = Array.prototype.slice.call(svg.querySelectorAll("path"));
  var circles = Array.prototype.slice.call(svg.querySelectorAll("circle"));
  var symbol   = paths[0];
  var sun      = paths[1];
  var letters  = paths.slice(2, 10).concat([circles[0]]).concat(paths.slice(10, 14)).concat([circles[1]]).filter(Boolean);

  var vb = (svg.getAttribute("viewBox") || "0 0 1322.98 1336.65").split(/\\s+/).map(Number);
  var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, RADIAL = 26;
  var off = letters.map(function (el) {
    var b = el.getBBox ? el.getBBox() : { x: cx, y: cy, width: 0, height: 0 };
    var dx = (b.x + b.width / 2) - cx, dy = (b.y + b.height / 2) - cy, d = Math.hypot(dx, dy) || 1;
    return { x: -(dx / d) * RADIAL, y: -(dy / d) * RADIAL };
  });

  var tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  // hidden from frame 0
  tl.set(scrim, { opacity: 0 }, 0)
    .set(symbol, { opacity: 0, scale: 0.94 }, 0)
    .set(sun, { opacity: 0, y: -22 }, 0);
  letters.forEach(function (el, i) { tl.set(el, { opacity: 0, x: off[i].x, y: off[i].y }, 0); });

  // 1 — scrim in
  tl.to(scrim, { opacity: scrimOpacity, duration: 0.5, ease: "power1.out" }, 0);

  // 2 — symbol in
  tl.to(symbol, { opacity: 1, scale: 1, duration: 1.0, ease: "expo.out" }, 0.5);

  // 3 — ring text, letter by letter
  var LIN = 1.1, EACH = 0.05, LDUR = 0.7;
  letters.forEach(function (el, i) {
    tl.to(el, { opacity: 1, x: 0, y: 0, duration: LDUR, ease: "expo.out" }, LIN + i * EACH);
  });
  var lend = LIN + (letters.length - 1) * EACH + LDUR;

  // 4 — sun rises (fades in a touch high, then settles)
  tl.to(sun, { opacity: 1, duration: 0.5, ease: "power2.out" }, lend - 0.35)
    .to(sun, { y: 0, duration: 1.1, ease: "power3.out" }, lend - 0.35);

  var hold = lend + 0.9;

  // 5 — DISASSEMBLE (reverse): sun out -> letters out -> symbol out
  tl.to(sun, { opacity: 0, y: -20, duration: 0.5, ease: "power2.in" }, hold);
  var LOUT = hold + 0.25, EO = 0.045, LODUR = 0.55;
  for (var i = letters.length - 1, k = 0; i >= 0; i--, k++) {
    (function (el, ki) {
      tl.to(el, { opacity: 0, x: off[ki].x, y: off[ki].y, duration: LODUR, ease: "power2.in" }, LOUT + k * EO);
    })(letters[i], i);
  }
  var loEnd = LOUT + (letters.length - 1) * EO + LODUR;
  tl.to(symbol, { opacity: 0, scale: 0.94, duration: 0.55, ease: "power2.in" }, loEnd - 0.15);

  // 6 — scrim out
  tl.to(scrim, { opacity: 0, duration: 0.5, ease: "power1.in" }, loEnd + 0.15);

  tl.progress(1).progress(0);   // force every .set() at position 0 to render
  window.__TOTAL = tl.duration();
  window.__seek = function (p) { tl.progress(Math.max(0, Math.min(1, p))); };

  var seek = q.get("seek");
  if (seek !== null) tl.progress(Math.max(0, Math.min(1, parseFloat(seek))));
  else if (q.get("capture") !== null) tl.progress(0);
  else { tl.repeat(-1).repeatDelay(0.6).play(0); }
})();
</script>
</body>
</html>
`;
writeFileSync(join(SITE, "downloads/logo-bumper.html"), html);
console.log("wrote downloads/logo-bumper.html", (html.length / 1024 | 0) + "KB");
