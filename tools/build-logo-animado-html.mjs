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

  // sun hidden and behind the line-art, so the mountain masks it while it rises
  sun.parentNode.insertBefore(sun, symbol);

  var EACH = 0.10, START = 0.8, LDUR = 0.5;
  var lettersEnd = START + (letters.length - 1) * EACH + LDUR;

  var tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

  // hidden from the first frame
  tl.set(sun, { opacity: 0, y: 200 }, 0)
    .set(letters, { opacity: 0, scale: 0.35 }, 0);

  // 1 — symbol appears (no writing, no sun)
  tl.from(symbol, { opacity: 0, scale: 0.9, duration: 0.9, ease: "power2.out" }, 0);

  // 2 — ring text, letter by letter
  tl.to(letters, { opacity: 1, scale: 1, duration: LDUR, ease: "back.out(2)",
                   stagger: { each: EACH } }, START);

  // 3 — sun rises from behind the mountain
  tl.to(sun, { opacity: 1, duration: 0.25 }, lettersEnd - 0.05)
    .to(sun, { y: 0, duration: 1.0, ease: "power2.out" }, lettersEnd - 0.05)
    .to(sun, { y: -6, duration: 0.35, ease: "sine.inOut" })
    .to(sun, { y: 0, duration: 0.4, ease: "sine.inOut" });

  tl.to({}, { duration: 0.8 });

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
