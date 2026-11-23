/* ==========================================================================
   Project motifs — one small animated SVG per project, each a literal
   picture of what the project does. Colours come from CSS variables so
   they follow the light/dark theme. Animation is SMIL + CSS (no JS loop).
   ========================================================================== */
(function () {
  'use strict';
  var NS = (window.EKG = window.EKG || {});
  var uid = 0;
  var M = {};

  function loopVals(n, v) { var a = []; for (var i = 0; i < n; i++) a.push(v); return a.join(';'); }
  function T(x, y, s, anchor, cls) {
    return '<text x="' + x + '" y="' + y + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + (cls ? ' class="' + cls + '"' : '') + '>' + s + '</text>';
  }

  /* 1 ── ModelNumquamOblita: sources → reviewed memory → cited answer ----- */
  M.mno = function () {
    var ys = [56, 120, 184], out = '';
    out += T(58, 20, 'SOURCES', 'middle') + T(200, 20, 'MEMORY', 'middle') + T(341, 20, 'ANSWER', 'middle');
    ys.forEach(function (y, i) {
      var dashed = i === 2;
      // source tile
      out += '<rect class="fill-bg" x="24" y="' + (y - 22) + '" width="68" height="44" rx="8"/>';
      out += '<path class="stroke-dim" d="M36 ' + (y - 8) + 'h36M36 ' + y + 'h24M36 ' + (y + 8) + 'h30"/>';
      // memory card
      out += '<rect class="fill-bg" x="166" y="' + (y - 22) + '" width="68" height="44" rx="8"' + (dashed ? ' stroke-dasharray="4 4"' : '') + '/>';
      out += '<circle class="' + (dashed ? 'fill-heart' : 'fill-pulse') + '" cx="180" cy="' + (y - 9) + '" r="3"/>';
      out += '<path class="stroke-dim" d="M190 ' + (y - 9) + 'h30M178 ' + (y + 3) + 'h42M178 ' + (y + 12) + 'h26"/>';
      // wires
      out += '<path class="stroke-dim" d="M92 ' + y + 'H166"/>';
      if (!dashed) out += '<path class="stroke-dim" d="M234 ' + y + 'C270 ' + y + ' 270 120 306 120"/>';
    });
    out += T(200, 222, 'DRAFT STAYS DRAFT', 'middle');
    // answer
    out += '<rect class="fill-bg" x="306" y="86" width="70" height="68" rx="10" style="stroke:var(--pulse)"/>';
    out += '<path class="stroke-pulse" d="M322 104l6 6 11-12"/>';
    out += '<path class="stroke-dim" d="M322 124h40M322 134h30M322 144h36"/>';
    // travelling evidence
    function dot(path, begin) {
      return '<circle class="fill-pulse glow" r="3.6" opacity="0"><animateMotion path="' + path + '" dur="5.2s" begin="' + begin + '" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.78;.86;1" dur="5.2s" begin="' + begin + '" repeatCount="indefinite"/></circle>';
    }
    out += dot('M92 56H234C270 56 270 120 306 120', '0s');
    out += dot('M92 120H306', '1.7s');
    // the abstain case: the dot stops at the draft card and fades
    out += '<circle class="fill-heart" r="3.6" opacity="0"><animateMotion path="M92 184H152" dur="5.2s" begin="3.2s" repeatCount="indefinite"/>' +
      '<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.45;.6;1" dur="5.2s" begin="3.2s" repeatCount="indefinite"/></circle>';
    out += '<text x="256" y="188" style="fill:var(--heart)" text-anchor="middle">?<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.5;.6;.8;.9;1" dur="5.2s" begin="3.2s" repeatCount="indefinite"/></text>';
    return out;
  };

  /* 2 ── CarsinOS: the four-floor "Glass Office" with an elevator --------- */
  M.carsinos = function () {
    var floors = [['4F', 'THE OFFICE'], ['3F', 'THE WINDOW'], ['2F', 'THE TRENCHES'], ['B', 'THE BASEMENT']];
    var ys = [28, 80, 132, 184], out = '';
    floors.forEach(function (f, i) {
      out += '<rect class="fill-bg" x="36" y="' + ys[i] + '" width="240" height="40" rx="8"/>';
      out += T(52, ys[i] + 24, f[0]) + T(86, ys[i] + 24, f[1]);
      out += '<circle class="fill-ink" cx="256" cy="' + (ys[i] + 20) + '" r="2.4" opacity=".45"/>';
    });
    var seq = [28, 28, 80, 80, 132, 132, 184, 184, 132, 132, 80, 80, 28];
    var vals = seq.join(';');
    var times = seq.map(function (_, i) { return (i / (seq.length - 1)).toFixed(3); }).join(';');
    var splines = []; for (var i = 0; i < seq.length - 1; i++) splines.push('0.45 0 0.25 1');
    var anim = '<animate attributeName="y" values="' + vals + '" keyTimes="' + times + '" calcMode="spline" keySplines="' + splines.join(';') + '" dur="12s" repeatCount="indefinite"/>';
    out += '<rect fill="rgba(var(--pulse-rgb),.10)" x="36" y="28" width="240" height="40" rx="8">' + anim + '</rect>';
    out += '<path class="stroke-dim" d="M318 20V230" stroke-dasharray="3 5"/>';
    out += '<rect class="fill-bg glow" x="300" y="28" width="36" height="40" rx="7" style="stroke:var(--pulse);stroke-width:1.6">' + anim + '</rect>';
    out += T(318, 14, 'ELEVATOR', 'middle');
    return out;
  };

  /* 3 ── Plotkeeper: a ledger that only closes on PASS --------------------- */
  M.plotkeeper = function () {
    var out = '', rows = 5, y0 = 32, dy = 32, D = '9s';
    out += T(40, 20, 'RUN LEDGER') + T(360, 20, 'READ-ONLY', 'end');
    for (var r = 0; r < rows; r++) {
      var y = y0 + r * dy;
      var a = 0.06 + r * 0.115, b = a + 0.1;           // check-draw window
      out += '<rect class="fill-bg" x="40" y="' + y + '" width="20" height="20" rx="5"/>';
      out += '<path class="stroke-pulse" d="M45 ' + (y + 10) + 'l4 4 7-8" stroke-dasharray="16" stroke-dashoffset="16">' +
        '<animate attributeName="stroke-dashoffset" values="16;16;0;0;16" keyTimes="0;' + a.toFixed(3) + ';' + b.toFixed(3) + ';.9;1" dur="' + D + '" repeatCount="indefinite"/></path>';
      var w = [250, 200, 270, 170, 230][r];
      out += '<rect x="76" y="' + (y + 7) + '" width="' + w * 0.75 + '" height="6" rx="3" fill="var(--rule-strong)"/>';
      out += '<rect x="76" y="' + (y + 7) + '" width="0" height="6" rx="3" fill="rgba(var(--pulse-rgb),.55)">' +
        '<animate attributeName="width" values="0;0;' + w * 0.75 + ';' + w * 0.75 + ';0" keyTimes="0;' + a.toFixed(3) + ';' + b.toFixed(3) + ';.9;1" dur="' + D + '" repeatCount="indefinite"/></rect>';
    }
    // the gate
    out += '<rect class="fill-bg" x="40" y="196" width="320" height="30" rx="15"/>';
    out += '<text x="200" y="215" text-anchor="middle" opacity="1">REVIEW PENDING…' +
      '<animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.62;.66;.96;1" dur="' + D + '" repeatCount="indefinite"/></text>';
    out += '<text x="200" y="215" text-anchor="middle" style="fill:var(--pulse)" opacity="0">PASS · open_items=0' +
      '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.64;.7;.9;.95;1" dur="' + D + '" repeatCount="indefinite"/></text>';
    out += '<rect x="40" y="196" width="320" height="30" rx="15" fill="none" stroke="var(--pulse)" stroke-width="1.6" opacity="0">' +
      '<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.64;.7;.9;.95;1" dur="' + D + '" repeatCount="indefinite"/></rect>';
    return out;
  };

  /* 4 ── Codex Audit: where the tokens actually went ----------------------- */
  M.codexaudit = function () {
    var id = 'ca' + (++uid), out = '';
    var rows = [[34, 22, 18, 14, 12], [16, 38, 10, 26, 10], [46, 12, 22, 8, 12]];
    var fills = ['var(--ink)', 'var(--pulse)', 'var(--ink)', 'var(--heart)', 'var(--ink)'];
    var ops = [0.72, 0.9, 0.42, 0.9, 0.34];
    out += T(40, 22, 'WHERE THE TOKENS WENT');
    out += '<defs><clipPath id="' + id + '"><rect x="40" y="30" width="0" height="140"><animate attributeName="width" values="0;320;320;0" keyTimes="0;.42;.9;1" dur="7s" repeatCount="indefinite"/></rect></clipPath></defs>';
    out += '<g clip-path="url(#' + id + ')">';
    rows.forEach(function (segs, r) {
      var x = 40, y = 44 + r * 46;
      segs.forEach(function (p, i) {
        var w = p * 3.2 - 2;
        out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="28" rx="5" fill="' + fills[i] + '" opacity="' + ops[i] + '"/>';
        x += p * 3.2;
      });
    });
    out += '</g>';
    out += '<line x1="40" y1="30" x2="40" y2="176" stroke="var(--pulse)" stroke-width="1.6" class="glow"><animate attributeName="x1" values="40;360;360;40" keyTimes="0;.42;.9;1" dur="7s" repeatCount="indefinite"/><animate attributeName="x2" values="40;360;360;40" keyTimes="0;.42;.9;1" dur="7s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.42;.5;1" dur="7s" repeatCount="indefinite"/></line>';
    var lg = ['CONTEXT', 'AGENTS', 'TOOLS', 'POLLING', 'COMPACTION'], lx = 38;
    lg.forEach(function (label, i) {
      out += '<rect x="' + lx.toFixed(1) + '" y="205" width="7" height="7" rx="2" fill="' + fills[i] + '" opacity="' + ops[i] + '"/>' + T((lx + 12).toFixed(1), 212, label);
      lx += 12 + label.length * 5.9 + 14;   // swatch + gap + label + breathing room
    });
    return out;
  };

  /* 5 ── Context Checkpoint: a baton passed across context windows --------- */
  M.checkpoint = function () {
    var out = '', xs = [28, 150, 272], D = '7s';
    out += T(200, 20, 'CONTEXT WINDOWS', 'middle');
    xs.forEach(function (x, i) {
      out += '<rect class="fill-bg" x="' + x + '" y="34" width="100" height="124" rx="10"/>';
      out += '<path class="stroke-dim" d="M' + (x + 12) + ' 52h50M' + (x + 12) + ' 68h72M' + (x + 12) + ' 80h58M' + (x + 12) + ' 92h66M' + (x + 12) + ' 112h40M' + (x + 12) + ' 124h60"/>';
      var kt = [['0', '.02', '.16', '.24', '1'], ['0', '.36', '.46', '.56', '1'], ['0', '.76', '.84', '.98', '1']][i];
      out += '<rect x="' + x + '" y="34" width="100" height="124" rx="10" fill="rgba(var(--pulse-rgb),.07)" stroke="var(--pulse)" stroke-width="1.6" opacity="0"><animate attributeName="opacity" values="0;1;1;0;0" keyTimes="' + kt.join(';') + '" dur="' + D + '" repeatCount="indefinite"/></rect>';
      if (i < 2) out += '<path class="stroke-dim" d="M' + (x + 111) + ' 34v124" stroke-dasharray="3 5"/>' + T(x + 111, 176, 'COMPACT', 'middle');
    });
    var route = 'M78 208C110 192 168 192 200 208C232 192 290 192 322 208';
    out += '<path class="stroke-dim" d="' + route + '" stroke-dasharray="2 6"/>';
    out += '<g><animateMotion path="' + route + '" dur="' + D + '" repeatCount="indefinite" keyPoints="0;0;.5;.5;1;1" keyTimes="0;.06;.4;.52;.88;1" calcMode="linear"/>' +
      '<rect class="glow" x="-31" y="-10" width="62" height="20" rx="10" fill="var(--pulse)"/>' +
      '<text x="0" y="3" text-anchor="middle" style="fill:var(--pulse-ink);font-size:8px;font-weight:600">next_cmd</text></g>';
    return out;
  };

  /* 6 ── UPSKAYLEDD: combing resolves into a clean frame -------------------- */
  M.upskayledd = function () {
    var s = '' + (++uid), out = '';
    var scene = '<rect x="30" y="28" width="340" height="184" fill="rgba(var(--pulse-rgb),.06)"/>' +
      '<circle cx="292" cy="82" r="22" fill="var(--heart)" opacity=".9"/>' +
      '<path d="M30 212L112 108 168 168 238 94 370 212Z" fill="var(--ink)" opacity=".34"/>' +
      '<path d="M30 212L96 160 172 196 250 150 370 212Z" fill="var(--ink)" opacity=".62"/>' +
      '<path d="M30 150h340M30 164h340" stroke="var(--ink)" stroke-width="1" opacity=".08"/>';
    out += '<defs>' +
      '<g id="sc' + s + '">' + scene + '</g>' +
      '<pattern id="po' + s + '" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="4" fill="#fff"/></pattern>' +
      '<pattern id="pe' + s + '" width="8" height="8" patternUnits="userSpaceOnUse"><rect y="4" width="8" height="4" fill="#fff"/></pattern>' +
      '<mask id="mo' + s + '"><rect x="0" y="0" width="400" height="240" fill="url(#po' + s + ')"/></mask>' +
      '<mask id="me' + s + '"><rect x="0" y="0" width="400" height="240" fill="url(#pe' + s + ')"/></mask>' +
      '<clipPath id="fr' + s + '"><rect x="30" y="28" width="340" height="184" rx="10"/></clipPath>' +
      '<clipPath id="cb' + s + '"><rect x="30" y="28" width="0" height="184"><animate attributeName="width" values="340;340;0;0;340" keyTimes="0;.12;.55;.7;1" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1"/></rect></clipPath>' +
      '</defs>';
    out += T(30, 20, 'BEFORE') + T(370, 20, 'AFTER', 'end');
    out += '<g clip-path="url(#fr' + s + ')">' +
      '<use href="#sc' + s + '"/>' +
      '<g clip-path="url(#cb' + s + ')">' +
        '<rect x="30" y="28" width="340" height="184" fill="var(--bg-2)"/>' +
        '<g mask="url(#mo' + s + ')" transform="translate(6 0)"><use href="#sc' + s + '"/></g>' +
        '<g mask="url(#me' + s + ')" transform="translate(-6 0)"><use href="#sc' + s + '"/></g>' +
      '</g></g>';
    out += '<rect class="stroke" x="30" y="28" width="340" height="184" rx="10" style="stroke:var(--rule-strong)"/>';
    var vals = '370;370;30;30;370', kt = '0;.12;.55;.7;1', sp = '0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1';
    out += '<line y1="22" y2="218" stroke="var(--pulse)" stroke-width="1.6" class="glow"><animate attributeName="x1" values="' + vals + '" keyTimes="' + kt + '" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="' + sp + '"/><animate attributeName="x2" values="' + vals + '" keyTimes="' + kt + '" dur="9s" repeatCount="indefinite" calcMode="spline" keySplines="' + sp + '"/></line>';
    return out;
  };

  /* 7 ── Lo-fi Defragger: the MS-DOS block grid ------------------------------ */
  M.lofi = function () {
    var out = '', cols = 20, rows = 9, size = 14, gap = 4, x0 = 22, y0 = 34, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    out += T(22, 20, 'DEFRAGMENTING…') + T(378, 20, 'LO-FI', 'end');
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = x0 + c * (size + gap), y = y0 + r * (size + gap);
        if (rnd() < 0.1) { out += '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="2" fill="var(--ink)" opacity=".22"/>'; continue; }
        var delay = -(c * 0.33 + r * 0.14).toFixed(2);
        out += '<rect class="cell" style="animation-delay:' + delay + 's" x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="2"/>';
      }
    }
    out += '<rect class="fill-bg" x="22" y="212" width="356" height="10" rx="5"/>';
    out += '<rect x="22" y="212" width="0" height="10" rx="5" fill="var(--pulse)"><animate attributeName="width" values="0;356;356;0" keyTimes="0;.88;.96;1" dur="9s" repeatCount="indefinite"/></rect>';
    return out;
  };

  /* 8 ── STARSHAPE: a sky; six stars chosen; a constellation traced ---------- */
  M.starshape = function () {
    var out = '', seed = 11, pts = [], tries = 0;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    while (pts.length < 24 && tries++ < 4000) {
      var p = [34 + rnd() * 332, 28 + rnd() * 184], ok = true;
      for (var i = 0; i < pts.length; i++) { var dx = pts[i][0] - p[0], dy = pts[i][1] - p[1]; if (dx * dx + dy * dy < 30 * 30) { ok = false; break; } }
      if (ok) pts.push(p);
    }
    // choose six spread-out stars: left → right
    var chosen = pts.map(function (p, i) { return i; }).sort(function (a, b) { return pts[a][0] - pts[b][0]; });
    var pick = [chosen[1], chosen[6], chosen[10], chosen[14], chosen[18], chosen[22]];
    var edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [1, 3], [2, 5]];
    out += T(34, 20, '24 CONCEPTS · 6 CHOSEN') + T(366, 20, 'ONE SHARED SKY', 'end');
    pts.forEach(function (p, i) {
      if (pick.indexOf(i) >= 0) return;
      out += '<circle class="fill-ink tw" style="animation-delay:' + (rnd() * 3.6).toFixed(2) + 's" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (1.1 + rnd() * 1.1).toFixed(1) + '"/>';
    });
    var D = '10s';
    edges.forEach(function (e, k) {
      var a = pts[pick[e[0]]], b = pts[pick[e[1]]];
      var len = Math.hypot(a[0] - b[0], a[1] - b[1]).toFixed(1);
      var s = 0.08 + k * 0.085, t = s + 0.06;
      out += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="var(--pulse)" stroke-width="1.5" stroke-linecap="round" class="glow" stroke-dasharray="' + len + '" stroke-dashoffset="' + len + '">' +
        '<animate attributeName="stroke-dashoffset" values="' + len + ';' + len + ';0;0;' + len + '" keyTimes="0;' + s.toFixed(3) + ';' + t.toFixed(3) + ';.86;1" dur="' + D + '" repeatCount="indefinite"/></line>';
    });
    pick.forEach(function (idx, k) {
      var p = pts[idx], s = 0.06 + k * 0.1;
      out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.2" fill="var(--pulse)" class="glow"/>' +
        '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="none" stroke="var(--pulse)" stroke-width="1" opacity="0">' +
        '<animate attributeName="r" values="3;3;11;11;3" keyTimes="0;' + s.toFixed(3) + ';' + (s + 0.1).toFixed(3) + ';1;1" dur="' + D + '" repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;0;.9;0;0" keyTimes="0;' + s.toFixed(3) + ';' + (s + 0.02).toFixed(3) + ';' + (s + 0.1).toFixed(3) + ';1" dur="' + D + '" repeatCount="indefinite"/></circle>';
    });
    return out;
  };

  /* 9 ── Faultline: solid where the code proves it, dashed where it doesn't -- */
  M.faultline = function () {
    var out = '', D = '4s';
    function box(x, y) {
      return '<rect class="fill-bg" x="' + x + '" y="' + y + '" width="72" height="40" rx="8"/>' +
        '<path class="stroke-dim" d="M' + (x + 10) + ' ' + (y + 15) + 'h34M' + (x + 10) + ' ' + (y + 26) + 'h22"/>';
    }
    // travel (optional): keyTimes for "go, then wait", so a dot can cross its road quickly and then sit
    function dot(path, begin, cls, dur, keys, travel) {
      var mot = travel ? ' keyPoints="0;1;1" keyTimes="' + travel + '" calcMode="linear"' : '';
      return '<circle class="' + cls + (cls === 'fill-pulse' ? ' glow' : '') + '" r="3.6" opacity="0"><animateMotion path="' + path + '" dur="' + dur + '" begin="' + begin + '"' + mot + ' repeatCount="indefinite"/>' +
        '<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="' + keys + '" dur="' + dur + '" begin="' + begin + '" repeatCount="indefinite"/></circle>';
    }
    out += T(30, 20, 'SOLID · PROVEN') + T(370, 20, 'DASHED · INFERRED', 'end');
    // contour lines: the geologic-map backdrop
    out += '<path class="stroke-dim" opacity=".4" d="M10 198C70 178 118 206 188 190S318 188 392 206"/>';
    out += '<path class="stroke-dim" opacity=".22" d="M10 212C80 194 130 220 200 204S330 202 392 220"/>';
    // proven roads: solid
    out += '<path class="stroke-pulse" d="M102 64C128 64 138 56 164 56"/>';
    out += '<path class="stroke-pulse" d="M236 56C268 56 270 76 298 76"/>';
    out += '<path class="stroke-pulse" d="M66 84C66 112 78 156 96 156"/>';
    out += '<path class="stroke-pulse" d="M334 96C334 122 312 132 296 144"/>';
    // inferred roads: dashed, each marked with a ?
    out += '<path class="stroke" stroke-dasharray="4 5" d="M168 156H250"/>';
    out += '<path class="stroke" stroke-dasharray="4 5" d="M200 76C200 112 268 108 268 144"/>';
    out += '<text x="209" y="148" text-anchor="middle" style="fill:var(--heart);font-size:14px;font-weight:600">?</text>';
    out += '<text x="247" y="104" text-anchor="middle" style="fill:var(--heart);font-size:14px;font-weight:600">?</text>';
    // the boxes
    out += box(30, 44) + box(164, 36) + box(298, 56) + box(96, 136) + box(250, 144);
    // proof travels the solid roads; on a dashed one it fades out at the ?
    out += dot('M102 64C128 64 138 56 164 56H236C268 56 270 76 298 76', '0s', 'fill-pulse', '6s', '0;.06;.7;.78;1');
    out += dot('M66 84C66 112 78 156 96 156', '0.6s', 'fill-pulse', D, '0;.05;.38;.46;1', '0;.4;1');
    out += dot('M168 156H202', '2.2s', 'fill-heart', D, '0;.04;.26;.42;1', '0;.26;1');
    out += T(200, 232, '? = ONLY MATCHED A NAME', 'middle');
    return out;
  };

  /* ── public API ───────────────────────────────────────────────────────── */
  NS.mountMotif = function (el, slug) {
    if (!el || !M[slug]) return;
    var svg = '<svg class="motif" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">' + M[slug]() + '</svg>';
    el.innerHTML = svg;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var s = el.firstChild;
      try { s.pauseAnimations(); s.setCurrentTime(3.2); } catch (e) { /* older engines */ }
    }
    el.setAttribute('data-mounted', slug);
  };
  NS.motifSlugs = Object.keys(M);
})();
