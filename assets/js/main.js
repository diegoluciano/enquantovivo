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
    heroTl.from(".hero__frame path", { drawSVG: "0%", duration: 1.1 }, 0)
          .from(".hero__ring-circle", { drawSVG: "0%", duration: 1.4, ease: "power2.inOut" }, 0.15);
  } else {
    heroTl.from([".hero__frame", ".hero__ring"], { opacity: 0, duration: 1 }, 0);
  }

  heroTl
    .from(".hero__photo", { scale: 1.12, duration: 1.6, ease: "power2.out" }, 0)
    .from(".hero__mark", { opacity: 0, scale: 0.88, duration: 1.2, ease: "power3.out" }, 0.35)
    .from(".hero__corner", { opacity: 0, y: 8, duration: 0.6, stagger: 0.1 }, 0.7)
    .from("[data-hero-title]", { opacity: 0, y: 40, duration: 1 }, 0.2)
    .from("[data-hero]", { opacity: 0, y: 24, duration: 0.8, stagger: 0.12 }, 0.4)
    .from(".hero__baseline span", { opacity: 0, duration: 0.6, stagger: 0.1 }, 0.9);

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
