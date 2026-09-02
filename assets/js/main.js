/* ============================================================
   Enquanto Vivo — Central de Marca · Conceito 3
   Interações + GSAP
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  /* ---------- NAV: mobile toggle ---------- */
  var nav = document.getElementById("nav");
  var toggle = nav.querySelector(".nav__toggle");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll(".nav__links a").forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- NAV: active link via IntersectionObserver ---------- */
  var linkMap = {};
  nav.querySelectorAll(".nav__links a").forEach(function (a) {
    linkMap[a.getAttribute("href").slice(1)] = a;
  });
  var sections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = linkMap[e.target.id];
        if (!link) return;
        if (e.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Copy HEX ---------- */
  var toast = document.querySelector(".toast");
  var toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove("is-show"); }, 1800);
  }
  document.querySelectorAll(".swatch").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var hex = btn.getAttribute("data-hex");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(
          function () { showToast(hex + " copiado"); },
          function () { showToast(hex); }
        );
      } else {
        showToast(hex);
      }
    });
  });

  /* ---------- Watermark opacity ---------- */
  var wm = document.querySelector(".watermark__control input");
  if (wm) {
    var wmMark = document.querySelector(".watermark__mark");
    var wmOut = document.querySelector(".watermark__control output");
    wm.addEventListener("input", function () {
      var v = wm.value;
      wmMark.style.opacity = v / 100;
      wmOut.textContent = v + "%";
    });
  }

  /* ============================================================
     GSAP
     ============================================================ */
  if (!hasGSAP || reduced) {
    // Fallback: everything simply visible (CSS default), no motion.
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  var canDraw = typeof window.DrawSVGPlugin !== "undefined";
  if (canDraw) gsap.registerPlugin(DrawSVGPlugin);

  document.documentElement.classList.add("reveal-ready");

  /* ---------- HERO intro ---------- */
  var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (canDraw) {
    heroTl.from(".hero__frame path", { drawSVG: "0%", duration: 1.1 }, 0);
  } else {
    heroTl.from(".hero__frame", { opacity: 0, duration: 1 }, 0);
  }

  heroTl
    .from(".hero__photo", { scale: 1.12, duration: 1.6, ease: "power2.out" }, 0)
    .from(".hero__corner", { opacity: 0, y: 8, duration: 0.6, stagger: 0.1 }, 0.7)
    .from("[data-hero-title]", { opacity: 0, y: 40, duration: 1 }, 0.2)
    .from("[data-hero]", { opacity: 0, y: 24, duration: 0.8, stagger: 0.12 }, 0.4)
    .from(".hero__baseline span", { opacity: 0, duration: 0.6, stagger: 0.1 }, 0.9);

  /* ---------- Animated seal inside the hero: symbol -> ring text letter by letter -> sun (plays once with the intro) ---------- */
  (function () {
    var mark = document.querySelector(".hero__mark");
    if (!mark) return;
    var paths   = Array.prototype.slice.call(mark.querySelectorAll("path"));
    var circles = Array.prototype.slice.call(mark.querySelectorAll("circle"));
    if (paths.length < 14) { heroTl.from(mark, { opacity: 0, scale: 0.9, duration: 1 }, 0.35); return; }
    var symbol  = paths[0];
    var sun     = paths[1];
    var letters = paths.slice(2, 10).concat([circles[0]]).concat(paths.slice(10, 14)).concat([circles[1]]).filter(Boolean);

    var vb = (mark.getAttribute("viewBox") || "0 0 1322.98 1336.65").split(/\s+/).map(Number);
    var cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, RADIAL = 26;
    var off = letters.map(function (el) {
      var b = el.getBBox ? el.getBBox() : { x: cx, y: cy, width: 0, height: 0 };
      var dx = (b.x + b.width / 2) - cx, dy = (b.y + b.height / 2) - cy, d = Math.hypot(dx, dy) || 1;
      return { x: -(dx / d) * RADIAL, y: -(dy / d) * RADIAL };
    });

    var START = 0.35, LSTART = 1.0, EACH = 0.05, LDUR = 0.7;
    heroTl.set(sun, { opacity: 0, y: -22 }, START);
    letters.forEach(function (el, i) { heroTl.set(el, { opacity: 0, x: off[i].x, y: off[i].y }, START); });
    heroTl.from(symbol, { opacity: 0, scale: 0.94, duration: 1.0, ease: "expo.out" }, START);
    letters.forEach(function (el, i) {
      heroTl.to(el, { opacity: 1, x: 0, y: 0, duration: LDUR, ease: "expo.out" }, LSTART + i * EACH);
    });
    var lend = LSTART + (letters.length - 1) * EACH + LDUR;
    heroTl.to(sun, { opacity: 1, duration: 0.5, ease: "power2.out" }, lend - 0.35)
          .to(sun, { y: 0, duration: 1.1, ease: "power3.out" }, lend - 0.35);
  })();

  // Safety net: never leave the hero hidden if the tab was throttled / a tween stalled
  setTimeout(function () { if (heroTl.progress() < 1) heroTl.progress(1); }, 4500);
  setTimeout(function () {
    document.querySelectorAll("[data-reveal-child]").forEach(function (el) {
      if (getComputedStyle(el).opacity === "0") gsap.set(el, { opacity: 1, y: 0 });
    });
  }, 9000);

  /* ---------- Badge: gentle vertical drift on scroll (no rotation — circular mark) ---------- */
  gsap.to(".hero__badge", {
    yPercent: -6,
    ease: "none",
    scrollTrigger: { trigger: ".hero__panel", start: "top top", end: "bottom top", scrub: 1 }
  });

  /* ---------- Hero photo parallax ---------- */
  gsap.fromTo(".hero__photo", { yPercent: 0 }, {
    yPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: ".hero__panel", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- Section reveals ---------- */
  gsap.utils.toArray("[data-reveal]").forEach(function (section) {
    var kids = section.querySelectorAll("[data-reveal-child]");
    if (!kids.length) return;
    gsap.to(kids, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: section, start: "top 82%", once: true }
    });
  });

  /* ---------- Big section numbers drift ---------- */
  gsap.utils.toArray(".index").forEach(function (el) {
    gsap.fromTo(el, { letterSpacing: "0.30em" }, {
      letterSpacing: "0.19em",
      ease: "none",
      scrollTrigger: { trigger: el, start: "top 92%", end: "top 55%", scrub: true }
    });
  });

  /* ---------- Photo direction subtle parallax ---------- */
  gsap.utils.toArray(".photodir__grid img, .mk__stage > img:first-child").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: "none",
      scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  ScrollTrigger.refresh();
})();
