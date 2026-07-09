/* ---------------------------------------------------------
   FRIENDS — interactive signed-network hero background
   Vanilla canvas force simulation, no dependencies.
   Positive edges: solid blue. Negative edges: dashed red.
--------------------------------------------------------- */
(function () {
  "use strict";

  var canvas = document.getElementById("network-bg");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Enforce layering from JS so the canvas can never enter normal
     document flow (e.g. if the stylesheet is stale or missing). */
  var hostEl = canvas.parentElement;
  if (getComputedStyle(hostEl).position === "static") {
    hostEl.style.position = "relative";
  }
  hostEl.style.overflow = "hidden";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "0";
  canvas.style.pointerEvents = "none";

  /* ------------------------- config ------------------------- */
  var CFG = {
    nodeCount: 44,
    posColor: "rgba(58, 110, 165, 0.7)",    // blue — positive ties
    negColor: "rgba(192, 74, 62, 0.7)",     // red  — negative ties
    nodeFill: "#FFFFFF",
    nodeStroke: "rgba(43, 33, 27, 0.6)",    // matches --ink
    nodeRadius: [3, 5.5],
    negFraction: 0.35,                      // share of edges that are negative
    restLength: 130,
    edgeWidth: 2.4,
    spring: 0.012,
    repulsion: 1300,
    damping: 0.9,
    drift: 0.012,
    mouseRadius: 130,
    mouseForce: 0.9,
    maxSpeed: 0.9
  };

  var nodes = [], edges = [];
  var W = 0, H = 0, DPR = 1;
  var mouse = { x: -9999, y: -9999 };
  var rafId = null;

  /* ------------------------- setup ------------------------- */
  function resize() {
    var host = canvas.parentElement;
    var rect = host.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function init() {
    resize();
    nodes = [];
    edges = [];

    var n = W < 640 ? Math.round(CFG.nodeCount * 0.6) : CFG.nodeCount;

    for (var i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: CFG.nodeRadius[0] + Math.random() * (CFG.nodeRadius[1] - CFG.nodeRadius[0])
      });
    }

    // Sparse random graph: connect each node to 1–2 nearby nodes.
    for (i = 0; i < n; i++) {
      var links = 1 + (Math.random() < 0.5 ? 1 : 0);
      var dists = [];
      for (var j = 0; j < n; j++) {
        if (j === i) continue;
        var dx = nodes[j].x - nodes[i].x;
        var dy = nodes[j].y - nodes[i].y;
        dists.push({ j: j, d: dx * dx + dy * dy });
      }
      dists.sort(function (a, b) { return a.d - b.d; });
      for (var k = 0; k < links && k < dists.length; k++) {
        var a = Math.min(i, dists[k].j), b = Math.max(i, dists[k].j);
        var dup = edges.some(function (e) { return e.a === a && e.b === b; });
        if (!dup) {
          edges.push({ a: a, b: b, sign: Math.random() < CFG.negFraction ? -1 : 1 });
        }
      }
    }
  }

  /* ------------------------- physics ------------------------- */
  function step() {
    var i, j, dx, dy, d2, d, f;

    // Pairwise repulsion (n is small, O(n^2) is fine)
    for (i = 0; i < nodes.length; i++) {
      for (j = i + 1; j < nodes.length; j++) {
        dx = nodes[j].x - nodes[i].x;
        dy = nodes[j].y - nodes[i].y;
        d2 = dx * dx + dy * dy + 0.01;
        if (d2 > 40000) continue; // ignore beyond 200px
        f = CFG.repulsion / d2;
        d = Math.sqrt(d2);
        var ux = dx / d, uy = dy / d;
        nodes[i].vx -= ux * f * 0.01;
        nodes[i].vy -= uy * f * 0.01;
        nodes[j].vx += ux * f * 0.01;
        nodes[j].vy += uy * f * 0.01;
      }
    }

    // Springs along edges
    for (i = 0; i < edges.length; i++) {
      var e = edges[i];
      var A = nodes[e.a], B = nodes[e.b];
      dx = B.x - A.x; dy = B.y - A.y;
      d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      f = (d - CFG.restLength) * CFG.spring;
      var sx = (dx / d) * f, sy = (dy / d) * f;
      A.vx += sx; A.vy += sy;
      B.vx -= sx; B.vy -= sy;
    }

    // Mouse repulsion + drift + integrate
    for (i = 0; i < nodes.length; i++) {
      var nd = nodes[i];

      dx = nd.x - mouse.x; dy = nd.y - mouse.y;
      d2 = dx * dx + dy * dy;
      if (d2 < CFG.mouseRadius * CFG.mouseRadius) {
        d = Math.sqrt(d2) + 0.01;
        f = (1 - d / CFG.mouseRadius) * CFG.mouseForce;
        nd.vx += (dx / d) * f;
        nd.vy += (dy / d) * f;
      }

      nd.vx += (Math.random() - 0.5) * CFG.drift;
      nd.vy += (Math.random() - 0.5) * CFG.drift;

      nd.vx *= CFG.damping;
      nd.vy *= CFG.damping;

      var sp = Math.sqrt(nd.vx * nd.vx + nd.vy * nd.vy);
      if (sp > CFG.maxSpeed) {
        nd.vx = (nd.vx / sp) * CFG.maxSpeed;
        nd.vy = (nd.vy / sp) * CFG.maxSpeed;
      }

      nd.x += nd.vx;
      nd.y += nd.vy;

      // Soft wrap at the margins so nodes never pile up on walls
      var m = 20;
      if (nd.x < -m) nd.x = W + m;
      if (nd.x > W + m) nd.x = -m;
      if (nd.y < -m) nd.y = H + m;
      if (nd.y > H + m) nd.y = -m;
    }
  }

  /* ------------------------- render ------------------------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var A = nodes[e.a], B = nodes[e.b];
      var dx = B.x - A.x, dy = B.y - A.y;
      // Skip wrapped-edge artifacts spanning the whole canvas
      if (dx * dx + dy * dy > (CFG.restLength * 3.2) * (CFG.restLength * 3.2)) continue;

      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      if (e.sign > 0) {
        ctx.strokeStyle = CFG.posColor;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = CFG.negColor;
        ctx.setLineDash([8, 6]);
      }
      ctx.lineWidth = CFG.edgeWidth;
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (i = 0; i < nodes.length; i++) {
      var nd = nodes[i];
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
      ctx.fillStyle = CFG.nodeFill;
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = CFG.nodeStroke;
      ctx.stroke();
    }
  }

  function loop() {
    step();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  /* ------------------------- events ------------------------- */
  var host = canvas.parentElement;
  host.addEventListener("mousemove", function (ev) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = ev.clientX - rect.left;
    mouse.y = ev.clientY - rect.top;
  });
  host.addEventListener("mouseleave", function () {
    mouse.x = -9999; mouse.y = -9999;
  });

  var resizeT;
  function scheduleReinit() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var host = canvas.parentElement;
      var rect = host.getBoundingClientRect();
      if (Math.abs(rect.width - W) < 2 && Math.abs(rect.height - H) < 2) return;
      init();
      if (reduceMotion) settleAndDraw();
    }, 150);
  }
  window.addEventListener("resize", scheduleReinit);
  if (typeof ResizeObserver !== "undefined") {
    /* The hero grows when its image loads; refit the canvas when that happens. */
    new ResizeObserver(scheduleReinit).observe(canvas.parentElement);
  } else {
    window.addEventListener("load", scheduleReinit);
  }

  document.addEventListener("visibilitychange", function () {
    if (reduceMotion) return;
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (!rafId) {
      rafId = requestAnimationFrame(loop);
    }
  });

  /* ------------------------- start ------------------------- */
  function settleAndDraw() {
    // Static layout for prefers-reduced-motion: settle offscreen, draw once.
    mouse.x = -9999; mouse.y = -9999;
    for (var t = 0; t < 240; t++) step();
    draw();
  }

  init();
  if (reduceMotion) {
    settleAndDraw();
  } else {
    rafId = requestAnimationFrame(loop);
  }
})();
