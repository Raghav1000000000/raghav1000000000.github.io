/* Root Directory — hero scene. A moonlit night painted once into canvas layers (redrawn only when the
   width changes), plus one small animated layer for fireflies, falling leaves and light running down the roots.
   World is 1600×1000; desktop crops it to fill the screen, phones fit the middle of it to the width. */
(() => {
  const $ = (s) => document.querySelector(s);
  const hero = $(".hero");
  if (!hero) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPhone = () => innerWidth <= 760;
  const PAD = 40; // layers are 40px wider each side so mouse parallax never shows an edge
  const MX = 1150, MY = 236, MR = 100; // the moon
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mk = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const gauss = (r) => (r() + r() + r() + r() - 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const ramp = (stops, t) => { // stops: [[t, "#hex"], ...]
    t = clamp(t, 0, 1);
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i], k = (t - t0) / (t1 - t0), a = hex(c0), b = hex(c1);
      return `rgb(${Math.round(lerp(a[0], b[0], k))},${Math.round(lerp(a[1], b[1], k))},${Math.round(lerp(a[2], b[2], k))})`;
    }
    return stops[stops.length - 1][1];
  };

  let HW = 0, HH = 0, DPR = 1;
  const VB = () => (isPhone() ? [330, 40, 940, 960] : [0, 0, 1600, 1000]);
  const frame = () => {
    const [vx, vy, vw, vh] = VB();
    const s = isPhone() ? Math.min(HW / vw, HH / vh) : Math.max(HW / vw, HH / vh);
    return { s, ox: (HW - vw * s) / 2 - vx * s + PAD, oy: HH - vh * s - vy * s };
  };
  const setup = (c) => {
    const w = c.clientWidth, h = c.clientHeight;
    c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
    const ctx = c.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  };
  const world = (ctx, f, extraX = 0) => ctx.setTransform(DPR * f.s, 0, 0, DPR * f.s, DPR * (f.ox + extraX), DPR * f.oy);
  const blob = (ctx, x, y, r, color, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("A", a)); g.addColorStop(1, color.replace("A", 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  // midpoint-displacement ridge line
  const ridge = (r, x0, x1, base, amp, rough, n = 9) => {
    let pts = [[x0, base + gauss(r) * amp * .5], [x1, base + gauss(r) * amp * .5]], a = amp;
    for (let k = 0; k < n; k++) {
      const np = [];
      for (let i = 0; i < pts.length - 1; i++) {
        np.push(pts[i]);
        np.push([(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2 + gauss(r) * a]);
      }
      np.push(pts[pts.length - 1]); pts = np; a *= rough;
    }
    return pts;
  };
  const cubic = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  };
  const sampleCurve = (start, segs, step = .02) => {
    const pts = []; let p0 = start;
    for (const [c1, c2, p3] of segs) { for (let t = 0; t < 1; t += step) pts.push(cubic(p0, c1, c2, p3, t)); p0 = p3; }
    pts.push(p0); return pts;
  };
  const moonward = (x, y) => { const dx = MX - x, dy = MY - y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d, d]; };

  /* ---------- sky: gradient, milky way, stars (screen space) ---------- */
  const drawSky = () => {
    const { ctx, w, h } = setup($("#c-sky")), f = frame(), r = mk(3);
    const mx = f.ox + MX * f.s, my = f.oy + MY * f.s, k = Math.max(w, h) / 1500;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#020309"); g.addColorStop(.4, "#070a16"); g.addColorStop(.7, "#11142a"); g.addColorStop(1, "#1a1724");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // milky way: a soft diagonal band away from the moon, with a dark dust lane
    const ax = w * .02, ay = -h * .05, bx = w * .62, by = h * .78, L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L;
    for (let i = 0; i < 520; i++) {
      const t = r(), off = gauss(r) * h * .09;
      blob(ctx, ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off, (24 + r() * 70) * k, r() > .7 ? "rgba(210,190,170,A)" : "rgba(150,165,215,A)", .006);
    }
    for (let i = 0; i < 160; i++) {
      const t = r(), off = gauss(r) * h * .025 + h * .01;
      blob(ctx, ax + (bx - ax) * t + nx * off, ay + (by - ay) * t + ny * off, (14 + r() * 40) * k, "rgba(2,3,8,A)", .05);
    }
    // stars
    const n = Math.round(w * h / 1300), cols = ["#ffffff", "#e3eaff", "#fff1dc", "#ffd9ad", "#cddcff"];
    for (let i = 0; i < n + 2200; i++) {
      let x, y;
      if (i < n) { x = r() * w; y = r() * h * .72; }
      else { const t = r(), off = gauss(r) * h * .07; x = ax + (bx - ax) * t + nx * off; y = ay + (by - ay) * t + ny * off; }
      const size = .25 + Math.pow(r(), 7) * 1.7 + (i >= n ? -.1 : 0);
      const dm = Math.hypot(x - mx, y - my);
      const fade = clamp((dm - MR * f.s * 1.6) / (w * .22), 0, 1) * clamp(1 - (y - h * .45) / (h * .3), 0, 1);
      if (fade <= 0) continue;
      ctx.globalAlpha = (.25 + r() * .75) * fade * (i >= n ? .25 : 1);
      ctx.fillStyle = cols[(r() * cols.length) | 0];
      ctx.beginPath(); ctx.arc(x, y, Math.max(.2, size), 0, 7); ctx.fill();
      if (size > 1.25) { ctx.globalAlpha *= .3; blob(ctx, x, y, size * 6, "rgba(220,230,255,A)", .5); }
    }
    ctx.globalAlpha = 1;
    // moonlight washing the sky, warm horizon
    blob(ctx, mx, my, w * .5, "rgba(255,150,70,A)", .075);
    blob(ctx, mx, my, w * 1.1, "rgba(255,110,40,A)", .025);
    const hz = ctx.createLinearGradient(0, h * .5, 0, h);
    hz.addColorStop(0, "rgba(30,30,50,0)"); hz.addColorStop(1, "rgba(38,34,52,.45)");
    ctx.fillStyle = hz; ctx.fillRect(0, h * .5, w, h * .5);
  };

  /* ---------- the moon: amber, textured, with a soft halo ---------- */
  const drawMoon = () => {
    const c = $("#c-moon"), { ctx } = setup(c), f = frame(), r = mk(21);
    world(ctx, f);
    blob(ctx, MX, MY, MR * 6, "rgba(255,150,70,A)", .14);
    blob(ctx, MX, MY, MR * 2.6, "rgba(255,180,100,A)", .26);
    blob(ctx, MX, MY, MR * 1.45, "rgba(255,210,150,A)", .3);
    ctx.save();
    ctx.beginPath(); ctx.arc(MX, MY, MR, 0, 7); ctx.clip();
    const d = ctx.createRadialGradient(MX - MR * .25, MY - MR * .3, 0, MX, MY, MR);
    d.addColorStop(0, "#fff3da"); d.addColorStop(.5, "#ffd699"); d.addColorStop(.85, "#f6ad5f"); d.addColorStop(1, "#dc7f36");
    ctx.fillStyle = d; ctx.fillRect(MX - MR, MY - MR, MR * 2, MR * 2);
    // maria (the dark "seas")
    [[-.34, -.26, .33], [.06, -.36, .22], [.26, -.06, .3], [-.1, .14, .2], [-.46, .2, .18], [.32, .36, .15], [.0, -.06, .14], [-.2, -.5, .12]].forEach(([u, v, s]) => {
      for (let i = 0; i < 4; i++)
        blob(ctx, MX + (u + gauss(r) * s * .3) * MR, MY + (v + gauss(r) * s * .3) * MR, s * MR * (.9 + r() * .7), "rgba(165,82,30,A)", .13);
    });
    // craters
    for (let i = 0; i < 70; i++) {
      const a = r() * 6.283, rr = Math.sqrt(r()) * MR * .95, x = MX + Math.cos(a) * rr, y = MY + Math.sin(a) * rr, cr = MR * (.01 + Math.pow(r(), 3) * .07);
      ctx.fillStyle = "rgba(140,64,22,.08)"; ctx.beginPath(); ctx.arc(x, y, cr, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(255,244,220,.16)"; ctx.lineWidth = cr * .2;
      ctx.beginPath(); ctx.arc(x + cr * .1, y + cr * .1, cr * .9, 3.6, 5.6); ctx.stroke();
    }
    // a bright rayed crater
    const tx = MX + MR * .14, ty = MY + MR * .56;
    ctx.strokeStyle = "rgba(255,248,230,.07)"; ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) { const a = r() * 6.283, l = MR * (.3 + r() * .7); ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + Math.cos(a) * l, ty + Math.sin(a) * l); ctx.stroke(); }
    blob(ctx, tx, ty, MR * .06, "rgba(255,250,235,A)", .8);
    // fine surface speckle
    for (let i = 0; i < 2600; i++) {
      const a = r() * 6.283, rr = Math.sqrt(r()) * MR;
      ctx.fillStyle = r() > .5 ? "rgba(255,240,215,.06)" : "rgba(120,50,15,.07)";
      ctx.fillRect(MX + Math.cos(a) * rr, MY + Math.sin(a) * rr, .7, .7);
    }
    // limb darkening
    const lg = ctx.createRadialGradient(MX, MY, MR * .62, MX, MY, MR);
    lg.addColorStop(0, "rgba(130,50,12,0)"); lg.addColorStop(1, "rgba(130,50,12,.42)");
    ctx.fillStyle = lg; ctx.fillRect(MX - MR, MY - MR, MR * 2, MR * 2);
    ctx.restore();
    ctx.strokeStyle = "rgba(255,225,180,.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(MX, MY, MR - .5, 0, 7); ctx.stroke();
  };

  /* ---------- thin clouds drifting past the moon ---------- */
  const drawClouds = () => {
    const c = $("#c-clouds"), { ctx } = setup(c), f = frame(), r = mk(33);
    world(ctx, f, (c.clientWidth - (HW + PAD * 2)) / 2);
    const wisps = [[MX - 40, MY + 34, 560], [MX + 60, MY - 58, 340], [260, 210, 520], [560, 330, 640], [1450, 390, 520], [880, 140, 420], [120, 420, 600], [1300, 470, 700]];
    for (const [cx, cy, len] of wisps) {
      const ph = r() * 6;
      for (let i = 0; i < 80; i++) {
        const t = i / 79, x = cx + (t - .5) * len, y = cy + Math.sin(t * 5 + ph) * 9 + gauss(r) * 5;
        const lit = clamp(1 - Math.hypot(x - MX, y - MY) / 460, 0, 1);
        const rad = 12 + r() * 30, edge = Math.pow(Math.sin(t * Math.PI), 1.5);
        ctx.save(); ctx.translate(x, y); ctx.scale(5 + r() * 3, 1);
        blob(ctx, 0, 0, rad, lit > .05 ? `rgba(${Math.round(lerp(90, 255, lit))},${Math.round(lerp(98, 196, lit))},${Math.round(lerp(130, 140, lit))},A)` : "rgba(90,98,130,A)", (.006 + lit * .05) * edge);
        ctx.restore();
      }
    }
  };

  /* ---------- far: hazy ridges, valley lights, data-centre silhouettes ---------- */
  const drawFar = () => {
    const { ctx } = setup($("#c-far")), f = frame(), r = mk(11);
    world(ctx, f);
    const rimGrad = (a) => {
      const g = ctx.createLinearGradient(-300, 0, 1900, 0);
      g.addColorStop(0, "rgba(255,170,90,0)"); g.addColorStop((MX - 650 + 300) / 2200, "rgba(255,170,90,0)");
      g.addColorStop((MX + 300) / 2200, `rgba(255,180,100,${a})`); g.addColorStop((MX + 650 + 300) / 2200, "rgba(255,170,90,0)"); g.addColorStop(1, "rgba(255,170,90,0)");
      return g;
    };
    const fillRidge = (pts, top, bot, rim) => {
      ctx.beginPath(); ctx.moveTo(pts[0][0], 1000);
      for (const p of pts) ctx.lineTo(p[0], p[1]);
      ctx.lineTo(pts[pts.length - 1][0], 1000); ctx.closePath();
      const g = ctx.createLinearGradient(0, 500, 0, 760); g.addColorStop(0, top); g.addColorStop(1, bot);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.strokeStyle = rimGrad(rim); ctx.lineWidth = 1.3; ctx.stroke();
    };
    const haze = (y0, y1, a) => {
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, "rgba(44,42,66,0)"); g.addColorStop(.6, `rgba(48,44,66,${a})`); g.addColorStop(1, `rgba(30,28,44,${a * .6})`);
      ctx.fillStyle = g; ctx.fillRect(-300, y0, 2200, y1 - y0);
    };
    fillRidge(ridge(r, -300, 1900, 570, 150, .54), "#1a1b2b", "#131427", .28);
    haze(520, 690, .5);
    fillRidge(ridge(r, -300, 1900, 616, 100, .52), "#121422", "#0e101c", .2);
    haze(580, 700, .4);
    // valley lights: towns and data centres
    for (let i = 0; i < 1300; i++) {
      const x = -250 + r() * 2100;
      const dens = (Math.sin(x * .011) + Math.sin(x * .027 + 1.7) + Math.sin(x * .004 + .6)) / 3 + .25;
      if (r() > dens) continue;
      const y = 640 + r() * 34 + Math.sin(x * .02) * 4, warm = r();
      ctx.fillStyle = warm > .3 ? "rgba(255,200,130,.75)" : warm > .1 ? "rgba(255,150,70,.8)" : "rgba(210,225,255,.7)";
      const s = .5 + r() * r() * 1.4; ctx.fillRect(x, y, s, s);
      if (r() > .93) blob(ctx, x, y, 6 + r() * 8, "rgba(255,170,90,A)", .18);
    }
    // a few low data-centre halls and masts with red lights
    for (let i = 0; i < 7; i++) {
      const x = 80 + i * 230 + r() * 120, w = 50 + r() * 70, h = 10 + r() * 14, y = 676 - h;
      ctx.fillStyle = "#0d0f1a"; ctx.fillRect(x, y, w, h + 20);
      ctx.fillStyle = "rgba(170,200,255,.5)";
      for (let wx = x + 4; wx < x + w - 4; wx += 5) if (r() > .4) ctx.fillRect(wx, y + h * .4, 2.2, 1.1);
      if (r() > .4) {
        const mx = x + w * r(), mh = 50 + r() * 70;
        ctx.strokeStyle = "#0d0f1a"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(mx - 4, y); ctx.lineTo(mx, y - mh); ctx.lineTo(mx + 4, y); ctx.stroke();
        blob(ctx, mx, y - mh, 7, "rgba(255,70,50,A)", .5);
        ctx.fillStyle = "#ff5a3c"; ctx.fillRect(mx - 1, y - mh - 1, 2, 2);
      }
    }
    fillRidge(ridge(r, -300, 1900, 676, 50, .5), "#0c0e18", "#090b13", .25);
    haze(640, 760, .35);
  };

  /* ---------- the tree on its hill, backlit by the moon ---------- */
  const canopy = [];
  const LEAF = [[0, "#0e0705"], [.3, "#2b1208"], [.55, "#6e2f0f"], [.75, "#c9641f"], [.9, "#ffa646"], [1, "#ffe0a3"]];
  const drawTree = () => {
    const { ctx } = setup($("#c-tree")), f = frame(), r = mk(5);
    world(ctx, f);
    canopy.length = 0;
    // hill
    const hillTop = sampleCurve([-300, 740], [[[-100, 730], [0, 725], [0, 720]], [[260, 690], [420, 604], [640, 588]], [[760, 579], [860, 582], [980, 598]], [[1180, 624], [1380, 690], [1600, 700]], [[1700, 704], [1800, 708], [1900, 712]]]);
    ctx.beginPath(); ctx.moveTo(-300, 1000); hillTop.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.lineTo(1900, 1000); ctx.closePath();
    const hg = ctx.createLinearGradient(0, 580, 0, 800); hg.addColorStop(0, "#0b0e17"); hg.addColorStop(1, "#05070c");
    ctx.fillStyle = hg; ctx.fill();
    // moonlit rim and grass along the crest
    for (let i = 0; i < hillTop.length - 1; i++) {
      const [x, y] = hillTop[i], [x2, y2] = hillTop[i + 1], lit = clamp(1 - Math.abs(x - MX) / 700, 0, 1) * .55 + .08;
      ctx.strokeStyle = `rgba(255,180,100,${lit.toFixed(3)})`; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    }
    for (let i = 0; i < hillTop.length - 1; i++) {
      const [x0, y0] = hillTop[i], [x1, y1] = hillTop[i + 1];
      for (let k = 0; k < 6; k++) {
        const t = r(), x = lerp(x0, x1, t), y = lerp(y0, y1, t), h = 2 + r() * r() * 9, lean = (r() - .4) * 3;
        ctx.strokeStyle = "#05070c"; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.quadraticCurveTo(x + lean * .4, y - h * .6, x + lean, y - h); ctx.stroke();
      }
    }

    // grow the tree
    const segs = [], tips = [], MAXD = 8;
    const grow = (x, y, a, len, w, d) => {
      const n = Math.max(2, Math.round(len / 13)), wEnd = w * .7;
      let cx = x, cy = y, ca = a;
      for (let i = 0; i < n; i++) {
        ca += (r() - .5) * .3 - ca * .05 + .01;
        const sl = len / n, nx = cx + Math.sin(ca) * sl, ny = cy - Math.cos(ca) * sl;
        segs.push([cx, cy, nx, ny, lerp(w, wEnd, i / n), d]);
        if (d >= 3 && d < MAXD && r() < .14) twig(nx, ny, ca + (r() > .5 ? 1 : -1) * (.6 + r() * .5), len * .35, lerp(w, wEnd, i / n) * .5, d + 2);
        cx = nx; cy = ny;
      }
      if (d >= 4) tips.push([cx, cy, d]);
      if (d >= MAXD) return;
      const kids = r() < .3 ? 3 : 2;
      for (let i = 0; i < kids; i++) {
        const leader = kids === 3 && i === 2, side = i % 2 ? 1 : -1;
        let na = leader ? ca * .6 + (r() - .5) * .3 : ca * .82 + side * (d < 2 ? .5 + r() * .35 : .32 + r() * .4);
        na = clamp(na, -1.2, 1.2);
        grow(cx, cy, na, len * (.7 + r() * .14) * (1 - Math.min(.3, Math.abs(na) * .1)), wEnd * (.64 + r() * .06), d + 1);
      }
    };
    const twig = (x, y, a, len, w, d) => {
      const nx = x + Math.sin(a) * len, ny = y - Math.cos(a) * len;
      segs.push([x, y, nx, ny, w, d]);
      tips.push([nx, ny, Math.min(MAXD, d + 2)]);
    };
    grow(800, 602, -.02, 112, 26, 0);

    // crown shape for lighting
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [x, y] of tips) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const ccx = (x0 + x1) / 2, ccy = (y0 + y1) / 2 + 20, crx = (x1 - x0) / 2 + 20, cry = (y1 - y0) / 2 + 20;
    const [mdx, mdy] = moonward(ccx, ccy);

    // light bleeding through the crown
    blob(ctx, ccx + mdx * crx * .35, ccy + mdy * cry * .35, Math.max(crx, cry) * 1.15, "rgba(255,140,50,A)", .2);

    // wood: flared base, then every segment, then a moonlit rim on the thicker ones
    ctx.fillStyle = "#04050a";
    ctx.beginPath(); ctx.moveTo(770, 608); ctx.quadraticCurveTo(788, 598, 789, 572); ctx.lineTo(812, 572); ctx.quadraticCurveTo(813, 598, 834, 608); ctx.closePath(); ctx.fill();
    [[-1, 52], [1, 60], [-1, 28], [1, 34]].forEach(([s, l]) => {
      ctx.strokeStyle = "#04050a"; ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(800 + s * 8, 604); ctx.quadraticCurveTo(800 + s * l * .5, 602, 800 + s * l, 610 + l * .1); ctx.stroke();
    });
    ctx.lineCap = "round"; ctx.strokeStyle = "#04050a";
    for (const [ax, ay, bx, by, w] of segs) { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); }
    for (const [ax, ay, bx, by, w, d] of segs) {
      if (d > 5 || w < 1.2) continue;
      const [ux, uy] = moonward(ax, ay), o = w * .32;
      ctx.strokeStyle = `rgba(255,176,96,${(.4 - d * .055).toFixed(3)})`; ctx.lineWidth = Math.max(.5, w * .16);
      ctx.beginPath(); ctx.moveTo(ax + ux * o, ay + uy * o); ctx.lineTo(bx + ux * o, by + uy * o); ctx.stroke();
    }

    // leaves: dark inside the crown, glowing at the edge that faces the moon
    const leaves = [];
    for (const [tx, ty, d] of tips) {
      const n = d >= MAXD ? 16 : d >= 6 ? 9 : 4;
      for (let i = 0; i < n; i++) {
        const x = tx + gauss(r) * 16, y = ty + gauss(r) * 13;
        const nx = (x - ccx) / crx, ny = (y - ccy) / cry, rr = Math.hypot(nx, ny) || 1;
        const facing = (nx * mdx + ny * mdy) / rr;
        const edge = Math.pow(clamp((rr - .3) / .75, 0, 1), 1.4);
        const L = clamp(edge * (.28 + .72 * Math.max(0, facing)) + Math.max(0, -ny) * .12 + gauss(r) * .12, 0, 1);
        leaves.push([x, y, r() * 6.283, 1.8 + r() * 2.6, L]);
      }
    }
    leaves.sort((a, b) => a[4] - b[4]);
    for (const [x, y, rot, s, L] of leaves) {
      ctx.fillStyle = ramp(LEAF, L); ctx.globalAlpha = .92;
      ctx.beginPath(); ctx.ellipse(x, y, s, s * .5, rot, 0, 7); ctx.fill();
      if (L > .45 && r() > .8) canopy.push([x, y, L]);
    }
    ctx.globalAlpha = 1;
    for (const [x, y, , s, L] of leaves) if (L > .86 && r() > .9) blob(ctx, x, y, s * 4, "rgba(255,190,110,A)", .35);
  };

  /* ---------- ROOT: stone letters, extruded, lit from the moon ---------- */
  let noiseTile = null;
  const getNoise = () => {
    if (noiseTile) return noiseTile;
    const t = document.createElement("canvas"); t.width = t.height = 220;
    const c = t.getContext("2d"), r = mk(77);
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() > .5 ? `rgba(0,0,0,${(r() * .22).toFixed(3)})` : `rgba(255,255,255,${(r() * .14).toFixed(3)})`; c.fillRect(r() * 220, r() * 220, 1 + r() * 1.5, 1 + r() * 1.5); }
    for (let i = 0; i < 40; i++) blob(c, r() * 220, r() * 220, 8 + r() * 30, "rgba(40,30,20,A)", .12);
    return (noiseTile = t);
  };
  const drawWord = () => {
    const { ctx } = setup($("#c-word")), f = frame();
    world(ctx, f);
    const fs = isPhone() ? 272 : 330;
    ctx.font = `${fs}px "Archivo Black", "Arial Black", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    if ("letterSpacing" in ctx) ctx.letterSpacing = isPhone() ? "-2px" : "6px";
    const X = 800, Y = 842, DEPTH = 20;
    for (let i = DEPTH; i >= 1; i--) {
      const k = i / DEPTH;
      ctx.fillStyle = `rgb(${Math.round(lerp(40, 9, k))},${Math.round(lerp(34, 9, k))},${Math.round(lerp(28, 12, k))})`;
      ctx.fillText("ROOT", X - i * 1.05, Y + i * .72);
    }
    const face = ctx.createLinearGradient(0, Y - fs * .72, 0, Y);
    face.addColorStop(0, "#f1eadf"); face.addColorStop(.45, "#d6cec1"); face.addColorStop(1, "#8a8378");
    ctx.fillStyle = face; ctx.fillText("ROOT", X, Y);
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = .6; ctx.fillStyle = ctx.createPattern(getNoise(), "repeat"); ctx.fillRect(0, Y - fs, 1600, fs + 40);
    ctx.globalAlpha = 1;
    const rim = ctx.createLinearGradient(1330, 0, 760, 0);
    rim.addColorStop(0, "rgba(255,170,90,.6)"); rim.addColorStop(.45, "rgba(255,170,90,.18)"); rim.addColorStop(1, "rgba(255,170,90,0)");
    ctx.fillStyle = rim; ctx.fillRect(0, Y - fs, 1600, fs + 40);
    const top = ctx.createLinearGradient(0, Y - fs * .73, 0, Y - fs * .6);
    top.addColorStop(0, "rgba(255,236,205,.5)"); top.addColorStop(1, "rgba(255,236,205,0)");
    ctx.fillStyle = top; ctx.fillRect(0, Y - fs, 1600, fs * .4);
    const shade = ctx.createLinearGradient(0, Y - fs * .3, 0, Y + 20);
    shade.addColorStop(0, "rgba(8,8,12,0)"); shade.addColorStop(1, "rgba(8,8,12,.8)");
    ctx.fillStyle = shade; ctx.fillRect(0, Y - fs * .3, 1600, fs * .3 + 40);
    ctx.globalCompositeOperation = "source-over";
  };

  /* ---------- foreground: grass, soil cross-section and glowing roots ---------- */
  const rootPaths = [];
  const drawFront = () => {
    const { ctx } = setup($("#c-front")), f = frame(), r = mk(9);
    world(ctx, f);
    rootPaths.length = 0;
    const top = sampleCurve([-300, 768], [[[-200, 768], [-60, 770], [0, 770]], [[180, 740], [300, 790], [470, 800]], [[640, 812], [700, 796], [800, 800]], [[930, 806], [1020, 816], [1180, 798]], [[1330, 782], [1460, 744], [1600, 752]], [[1700, 756], [1800, 760], [1900, 762]]], .01);
    ctx.beginPath(); ctx.moveTo(-300, 1000); top.forEach((p) => ctx.lineTo(p[0], p[1])); ctx.lineTo(1900, 1000); ctx.closePath();
    const sg = ctx.createLinearGradient(0, 760, 0, 1000);
    sg.addColorStop(0, "#05060b"); sg.addColorStop(.25, "#07070a"); sg.addColorStop(1, "#0d0906");
    ctx.fillStyle = sg; ctx.fill();
    ctx.save(); ctx.clip();
    // soil: grains, pebbles, faint strata
    for (let i = 0; i < 2600; i++) {
      const x = -300 + r() * 2200, y = 800 + Math.pow(r(), .7) * 200, s = .4 + Math.pow(r(), 4) * 4;
      ctx.fillStyle = r() > .85 ? "rgba(120,96,70,.12)" : "rgba(52,40,28,.35)";
      ctx.beginPath(); ctx.ellipse(x, y, s, s * (.6 + r() * .4), r() * 3, 0, 7); ctx.fill();
    }
    for (let i = 0; i < 5; i++) {
      const y = 850 + i * 30 + r() * 10;
      ctx.strokeStyle = "rgba(255,200,150,.025)"; ctx.lineWidth = 2;
      ctx.beginPath(); for (let x = -300; x <= 1900; x += 40) { const yy = y + Math.sin(x * .006 + i) * 6; x === -300 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); } ctx.stroke();
    }

    // roots: dark woody bodies with a glowing core; the main one runs down to /services
    const R = mk(13);
    const root = (x, y, a, len, w, d, keep) => {
      const pts = [[x, y]], n = Math.max(3, Math.round(len / 10));
      let cx = x, cy = y, ca = a;
      for (let i = 0; i < n; i++) {
        ca += (R() - .5) * .45 - ca * .03;
        cx += Math.sin(ca) * len / n; cy += Math.cos(ca) * len / n;
        pts.push([cx, cy]);
      }
      const body = (lw, style, glow) => {
        ctx.strokeStyle = style; ctx.shadowBlur = glow; ctx.shadowColor = "rgba(255,140,40,.9)";
        for (let i = 0; i < pts.length - 1; i++) {
          ctx.lineWidth = lw * (1 - i / pts.length * .75);
          ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke();
        }
      };
      body(w * 1.7, "#1b130c", 0);
      body(w * .45, d < 2 ? "#ffb85a" : "rgba(255,170,80,.65)", (d < 2 ? 9 : 4) * f.s * DPR);
      ctx.shadowBlur = 0;
      if (keep) rootPaths.push(pts);
      if (d < 3) {
        const forks = d === 0 ? 3 : 2;
        for (let i = 0; i < forks; i++) {
          const p = pts[Math.min(pts.length - 2, 2 + ((R() * (pts.length - 3)) | 0))];
          root(p[0], p[1], ca + (R() > .5 ? 1 : -1) * (.5 + R() * .7), len * (.4 + R() * .25), w * .55, d + 1, false);
        }
      } else {
        ctx.strokeStyle = "rgba(255,190,120,.25)"; ctx.lineWidth = .5;
        for (let i = 0; i < 4; i++) { const p = pts[pts.length - 1]; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + (R() - .5) * 14, p[1] + R() * 12); ctx.stroke(); }
      }
    };
    ctx.lineCap = "round";
    [[-1.05, 230], [1.1, 250], [-.7, 200], [.75, 210], [-1.35, 300], [1.35, 320]].forEach(([a, l], i) => root(800 + Math.sign(a) * 10, 812, a, l, 4.4 - (i >> 1) * .6, 0, i < 4));
    // the main taproot, straight down to the bottom edge at the centre
    const main = [];
    for (let y = 808; y <= 1012; y += 8) main.push([800 + Math.sin(y * .05) * 5 * (1 - (y - 808) / 204), y]);
    ctx.strokeStyle = "#1b130c"; ctx.lineWidth = 11; ctx.beginPath(); main.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke();
    ctx.strokeStyle = "#ffc06a"; ctx.lineWidth = 3; ctx.shadowBlur = 12 * f.s * DPR; ctx.shadowColor = "rgba(255,140,40,1)";
    ctx.beginPath(); main.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke(); ctx.shadowBlur = 0;
    rootPaths.unshift(main);
    ctx.restore();

    // grass along the edge, a few blades catching moonlight
    for (let i = 0; i < top.length - 1; i++) {
      const [x0, y0] = top[i], [x1, y1] = top[i + 1];
      for (let k = 0; k < 7; k++) {
        const t = r(), x = lerp(x0, x1, t), y = lerp(y0, y1, t);
        const tall = (Math.sin(x * .013) + 1.3) * .5, h = 4 + r() * r() * 26 * tall + 3, lean = (r() - .45) * 8;
        ctx.strokeStyle = "#04050a"; ctx.lineWidth = 1 + r() * .8;
        ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.quadraticCurveTo(x + lean * .3, y - h * .6, x + lean, y - h); ctx.stroke();
        if (r() > .82) {
          ctx.strokeStyle = `rgba(255,175,95,${(.12 + clamp(1 - Math.abs(x - MX) / 900, 0, 1) * .3).toFixed(3)})`; ctx.lineWidth = .6;
          ctx.beginPath(); ctx.moveTo(x + lean * .55, y - h * .7); ctx.quadraticCurveTo(x + lean * .8, y - h * .88, x + lean, y - h); ctx.stroke();
        }
      }
    }
  };

  /* ---------- animated: fireflies, falling leaves, light running down the roots ---------- */
  const fx = $("#c-fx"), fctx = fx.getContext("2d");
  const sprite = (() => {
    const s = document.createElement("canvas"); s.width = s.height = 64;
    const g = s.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,236,190,1)"); gr.addColorStop(.18, "rgba(255,180,90,.85)"); gr.addColorStop(.5, "rgba(255,130,40,.18)"); gr.addColorStop(1, "rgba(255,120,30,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
  })();
  let flies = [], falls = [], pulses = [], F = null, on = true;
  const newFall = (any) => {
    const c = canopy[(Math.random() * canopy.length) | 0] || [800, 300, .8];
    return { x: c[0], y: any ? c[1] + Math.random() * 300 : c[1], vy: .22 + Math.random() * .35, vx: .1 + Math.random() * .25, rot: Math.random() * 6.3, vr: (Math.random() - .5) * .05, s: 1.8 + Math.random() * 1.8, ph: Math.random() * 6.3, col: ramp(LEAF, .62 + c[2] * .38), a: 0, wait: any ? 0 : Math.random() * 300 };
  };
  const initFx = () => {
    fx.width = Math.round(fx.clientWidth * DPR); fx.height = Math.round(fx.clientHeight * DPR);
    F = frame();
    const nF = isPhone() ? 7 : 14;
    flies = Array.from({ length: nF }, (_, i) => ({ bx: 420 + Math.random() * 760, by: 560 + Math.random() * 220, ax: 20 + Math.random() * 50, ay: 10 + Math.random() * 30, f1: .0002 + Math.random() * .0004, f2: .0003 + Math.random() * .0004, ph: Math.random() * 6.3, bl: .0008 + Math.random() * .0015, s: 7 + Math.random() * 7 }));
    falls = Array.from({ length: isPhone() ? 8 : 16 }, () => newFall(true));
    pulses = rootPaths.map((p, i) => ({ p, t: Math.random(), v: (i ? .0022 : .0016) + Math.random() * .001 }));
  };
  const tick = (t) => {
    if (on && F) {
      const w = fx.width, h = fx.height;
      fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, w, h);
      fctx.setTransform(DPR * F.s, 0, 0, DPR * F.s, DPR * F.ox, DPR * F.oy);
      fctx.globalCompositeOperation = "lighter";
      for (const q of pulses) {
        q.t += q.v; if (q.t > 1.15) q.t = -.1;
        const n = q.p.length - 1;
        for (let k = 0; k < 6; k++) {
          const tt = q.t - k * .012; if (tt < 0 || tt > 1) continue;
          const fi = tt * n, i = Math.min(n - 1, fi | 0), u = fi - i, a = q.p[i], b = q.p[i + 1];
          const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), s = (k ? 14 : 22) * (1 - k * .13);
          fctx.globalAlpha = (1 - k / 6) * .9; fctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
        }
      }
      for (const p of flies) {
        const x = p.bx + Math.sin(t * p.f1 + p.ph) * p.ax + Math.sin(t * p.f2 * 2.3) * p.ax * .3;
        const y = p.by + Math.cos(t * p.f2 + p.ph) * p.ay;
        const b = Math.max(0, Math.sin(t * p.bl + p.ph)); fctx.globalAlpha = b * b * .95;
        fctx.drawImage(sprite, x - p.s / 2, y - p.s / 2, p.s, p.s);
      }
      fctx.globalCompositeOperation = "source-over";
      for (const p of falls) {
        if (p.wait > 0) { p.wait--; continue; }
        p.y += p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * .35; p.rot += p.vr;
        p.a = Math.min(1, p.a + .02, Math.max(0, (790 - p.y) / 40));
        if (p.y > 790) { Object.assign(p, newFall(false)); continue; }
        fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot); fctx.scale(1, Math.abs(Math.cos(t / 380 + p.ph)) * .75 + .25);
        fctx.globalAlpha = p.a * .9; fctx.fillStyle = p.col;
        fctx.beginPath(); fctx.ellipse(0, 0, p.s, p.s * .5, 0, 0, 7); fctx.fill();
        fctx.restore();
      }
      fctx.globalAlpha = 1;
    }
    if (!reduce) requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(hero);

  /* ---------- render everything; again only when the width changes ---------- */
  let lastW = 0;
  const render = (force) => {
    if (!force && innerWidth === lastW) return; // phones fire height-only resizes as the address bar moves
    lastW = innerWidth;
    HW = hero.clientWidth; HH = hero.clientHeight;
    DPR = Math.min(devicePixelRatio || 1, isPhone() ? 2 : 1.5);
    drawSky(); drawMoon(); drawClouds(); drawFar(); drawTree(); drawFront();
    const fontReady = document.fonts && document.fonts.load ? document.fonts.load('330px "Archivo Black"') : Promise.resolve();
    fontReady.then(drawWord, drawWord);
    initFx();
    if (reduce) tick(0);
  };
  render(true);
  addEventListener("resize", () => render(false));
  if (!reduce) requestAnimationFrame(tick);
  requestAnimationFrame(() => document.documentElement.classList.add("loaded"));
  setTimeout(() => document.documentElement.classList.add("loaded"), 400);
})();
