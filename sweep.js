/* ═══════════════════════════════════════════════════════════════════════════
   THE SWEEP · the signature move for blue-hour
   ---------------------------------------------------------------------------
   A scan line crosses the skyline. Where it passes, the city's lights come on
   and stay on, so the illumination accumulates the whole way down the page.
   Eight of those lights are named: each is a real item on the record, says
   what it is on hover, and jumps there on click. By the close the city is on,
   and it is on because of what you read.

   This is page code. The engine is not touched. Everything below is driven
   from page scroll in one rAF loop writing custom properties.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var root  = document.documentElement;
  var city  = document.querySelector("[data-city]");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".bar__nav a"));
  var reduced = matchMedia("(prefers-reduced-motion: reduce)");

  var IMG_AR = 2560 / 1600;      // desktop plate
  var IMG_AR_M = 1170 / 1560;    // portrait plate

  /* ── the scroll profile ────────────────────────────────────────────────
     Anchored to real section positions, re-measured on resize. */
  var M = { litEnd: 1, docMax: 1, cityStops: [] };

  function measure() {
    var vh = innerHeight;
    var hero  = document.querySelector("[data-hero]");
    var peak  = document.getElementById("sentinel");
    var rail  = document.getElementById("projects");
    var close = document.getElementById("record");
    var top = function (el) { return el ? el.getBoundingClientRect().top + scrollY : 0; };
    var hgt = function (el) { return el ? el.offsetHeight : vh; };

    var heroEnd  = top(hero) + hgt(hero);
    var peakTop  = top(peak);
    var peakEnd  = peakTop + hgt(peak);
    var railTop  = top(rail);
    var closeTop = top(close);

    /* The sweep finishes inside the peak. That is what makes the peak the
       largest visual change on the page rather than merely the longest act. */
    /* The sweep completes exactly where the peak's copy clears, so the city
       coming fully on IS the largest visual change on the page. */
    M.litEnd = Math.max(vh, peakTop + hgt(peak) * 0.80);
    M.docMax = Math.max(1, document.documentElement.scrollHeight - vh);

    /* How present the photograph is. It opens full, recedes while the page
       does its reading, comes forward as the city completes at the peak, and
       returns at the close. */
    M.cityStops = [
      [0,                    1.00],
      [heroEnd * 0.55,       1.00],
      [heroEnd + vh * 0.25,  0.30],
      [peakTop - vh * 0.2,   0.26],
      [peakTop + hgt(peak) * 0.50, 0.46],
      [peakTop + hgt(peak) * 0.86, 0.94],
      [peakEnd,              0.52],
      [railTop + vh * 0.5,   0.30],
      [closeTop - vh * 0.3,  0.34],
      [closeTop + vh * 0.35, 0.80]
    ];
  }

  function atStops(stops, y) {
    if (!stops.length) return 1;
    if (y <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) {
      if (y <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        var span = b[0] - a[0];
        var t = span <= 0 ? 1 : (y - a[0]) / span;
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return stops[stops.length - 1][1];
  }

  var clamp01 = function (n) { return n < 0 ? 0 : n > 1 ? 1 : n; };

  /* ── the loop ──────────────────────────────────────────────────────────
     It settles. A rAF that runs forever costs battery for nothing once the
     page is still, and it keeps the document from ever reporting itself as
     finished rendering, which breaks screenshot capture. Scroll and resize
     wake it; a few identical frames put it back to sleep. */
  var lastY = null, idle = 0, running = false;

  function wake() {
    idle = 0;
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  function frame() {
    var y  = scrollY || pageYOffset;
    var vh = innerHeight;

    if (y === lastY) { idle++; } else { idle = 0; lastY = y; }
    if (idle > 4) { running = false; return; }

    var lit = clamp01(y / M.litEnd);
    var descent = clamp01(y / M.docMax);
    var cityO = atStops(M.cityStops, y);

    /* The scan line is only present while the sweep is actually running, and
       it fades out rather than snapping off at the end. */
    var scanO = lit <= 0.002 ? 0 : lit >= 0.995 ? 0 : Math.min(1, (1 - lit) * 3.2) * 0.85;

    root.style.setProperty("--lit", lit.toFixed(4));
    root.style.setProperty("--scan-o", scanO.toFixed(3));
    root.style.setProperty("--city-o", cityO.toFixed(3));
    root.style.setProperty("--descent", descent.toFixed(4));

    /* Planes. Rates differ by 10 to 30 percent of each other, which is where
       differential movement reads as distance instead of as sliding. Copy
       rides at 1x and is never on a plane. */
    if (!reduced.matches) {
      var t = clamp01(y / (vh * 2.2));
      root.style.setProperty("--plate-y", (-t * 96).toFixed(1) + "px");
      root.style.setProperty("--haze-y",  (-t * 54).toFixed(1) + "px");
      root.style.setProperty("--near-y",  ( t * 52).toFixed(1) + "px");
    }

    requestAnimationFrame(frame);
  }

  addEventListener("scroll", wake, { passive: true });

  /* ── the observation field ────────────────────────────────────────────
     Act 3's ground, and the line's evidence. A few thousand observations
     plotted in loose columns: almost every one is dim and small, a dozen are
     not. "Most of it is nothing" is drawn before it is written. Seeded, so it
     is identical on every load and in every screenshot. */
  function drawField() {
    var cv = document.querySelector("[data-field]");
    if (!cv || !cv.getContext) return;
    var host = cv.parentElement.getBoundingClientRect();
    var dpr = Math.min(devicePixelRatio || 1, 2);
    var W = Math.max(1, Math.round(host.width)), H = Math.max(1, Math.round(host.height));
    cv.width = W * dpr; cv.height = H * dpr;
    var g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    var seed = 20260920;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

    var cols = Math.max(90, Math.round(W / 3));
    var signal = [];
    for (var c = 0; c < cols; c++) {
      var x = (c + 0.5) * (W / cols);
      /* Density varies across the field so it reads as measured rather than
         sprayed: some columns are busy, some are almost empty. */
      var n = 20 + Math.round(rnd() * rnd() * 96);
      for (var i = 0; i < n; i++) {
        var y = rnd() * H;
        var jx = x + (rnd() - 0.5) * 5;
        if (rnd() < 0.0011) { signal.push([jx, y]); continue; }
        g.fillStyle = "rgba(112,150,198," + (0.20 + rnd() * 0.46).toFixed(3) + ")";
        g.fillRect(jx, y, 1, 1 + (rnd() < 0.22 ? 1 : 0));
      }
    }
    /* Soften the field's own top and bottom edges so it blends into the
       photograph above and below instead of cutting against it. */
    g.globalCompositeOperation = "destination-out";
    var fade = g.createLinearGradient(0, 0, 0, H);
    fade.addColorStop(0,    "rgba(0,0,0,1)");
    fade.addColorStop(0.14, "rgba(0,0,0,0)");
    fade.addColorStop(0.86, "rgba(0,0,0,0)");
    fade.addColorStop(1,    "rgba(0,0,0,1)");
    g.fillStyle = fade; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "source-over";

    /* The handful that are not nothing. Drawn last so they sit on top. */
    /* Sample evenly along the list, which is in column order, so the ones that
       matter are spread across the field instead of bunched where the first
       hits happened to fall. */
    var picked = [], step = Math.max(1, Math.floor(signal.length / 14));
    for (var k = 0; k < signal.length && picked.length < 14; k += step) picked.push(signal[k]);
    picked.forEach(function (pt) {
      var r = 1.6 + rnd() * 1.1;
      var h = g.createRadialGradient(pt[0], pt[1], 0, pt[0], pt[1], r * 7);
      h.addColorStop(0, "rgba(255,179,92,0.34)");
      h.addColorStop(1, "rgba(255,179,92,0)");
      g.fillStyle = h;
      g.beginPath(); g.arc(pt[0], pt[1], r * 7, 0, 6.2832); g.fill();
      g.fillStyle = "rgba(255,206,150,0.92)";
      g.beginPath(); g.arc(pt[0], pt[1], r, 0, 6.2832); g.fill();
    });
  }

  /* ── which section the bar is pointing at ──────────────────────────────*/
  var targets = navLinks.map(function (a) {
    return { a: a, el: document.querySelector(a.getAttribute("href")) };
  }).filter(function (t) { return t.el; });

  if ("IntersectionObserver" in window && targets.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var t = targets.filter(function (x) { return x.el === e.target; })[0];
        if (t && e.isIntersecting) {
          targets.forEach(function (x) { x.a.classList.toggle("is-here", x === t); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    targets.forEach(function (t) { io.observe(t.el); });
  }

  /* ── go ────────────────────────────────────────────────────────────────*/
  function boot() {
    measure();
    drawField();
    wake();
  }

  var resizeT;
  addEventListener("resize", function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { drawField(); measure(); wake(); }, 120);
  }, { passive: true });

  /* Sections are measured after fonts settle, because display type at this
     scale changes section heights enough to move every stop. */
  if (document.readyState === "complete") boot();
  else addEventListener("load", boot);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); wake(); });
})();
