// Raghav Mittal — site script. No build, no dependencies.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Mouse effects switch on when a real mouse moves — not from CSS media queries,
  // because touchscreen laptops often tell Chrome/Edge they are touch-only.
  const mouseQ = [];
  let hasMouse = false;
  const whenMouse = (fn) => (hasMouse ? fn() : mouseQ.push(fn));
  const goMouse = (e) => {
    if (hasMouse || (e.pointerType !== "mouse" && e.pointerType !== "pen")) return;
    hasMouse = true;
    document.documentElement.classList.add("mouse");
    removeEventListener("pointermove", goMouse);
    mouseQ.splice(0).forEach((fn) => fn());
  };
  addEventListener("pointermove", goMouse, { passive: true });

  // Every visit (and every reload) starts at the top, on the title, unless a link asked for a section
  if (!location.hash) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
  }

  const YEAR = new Date().getFullYear();
  $("#yr").textContent = YEAR;
  document.documentElement.classList.add("js");
  $("#yr-now").textContent = YEAR;
  $$(".yr").forEach((e) => (e.textContent = YEAR));

  // "Stuck in 2014 → updated to <this year>": the year rolls forward
  const rollYear = () => {
    const el = $("#yr-now");
    if (still) return;
    let y = 2014;
    const t = setInterval(() => {
      el.textContent = ++y;
      if (y >= YEAR) clearInterval(t);
    }, 90);
  };

  // Split big words into letters
  $$("[data-split]").forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...c.textContent].forEach((t) => {
            const s = document.createElement("span");
            s.className = "ch";
            s.setAttribute("aria-hidden", "true");
            s.textContent = t;
            frag.appendChild(s);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && !c.classList.contains("dot")) walk(c);
      });
    };
    walk(el);
  });

  // Phones: each title line is sized to fill the screen width (poster style, no dead space)
  const megaLines = $$(".mega .line");
  const fitMega = () => {
    megaLines.forEach((l) => { l.style.fontSize = ""; l.style.width = ""; });
    if (innerWidth >= 760) return;
    const avail = $(".mega").clientWidth;
    megaLines.forEach((l) => {
      l.style.width = "max-content";
      const base = parseFloat(getComputedStyle(l).fontSize);
      l.style.fontSize = `${Math.min(base * (avail / l.offsetWidth) * 0.98, innerHeight * 0.2)}px`;
      l.style.width = "";
    });
  };
  fitMega();
  { let w = innerWidth; addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; fitMega(); } }); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMega);

  // Boot screen, then hero letters rise in
  const boot = $(".boot");
  const lines = [
    "> opening your-business.in ........ looks like 2014",
    "> slow pages, broken checkout ..... found",
    "> redesign · rebuild · fix ........ done",
    "> plus apps, cloud & automation ... ready",
    `> your business, updated for ${YEAR}. come in.`,
  ];
  const startHero = () => {
    $$(".mega .ch").forEach((c, i) => {
      c.style.animationDelay = `${i * 28}ms`;
      c.classList.add("in");
      c.addEventListener("animationend", () => { c.classList.remove("in"); c.style.animationDelay = ""; }, { once: true });
    });
    typeLoop();
    setTimeout(rollYear, 700);
    startHook();
    setTimeout(() => playGhost(), still ? 0 : 1500); // once the letters have risen in
  };

  let heroFocus = () => {}; // hook for anything in the hero that follows the rotating headline

  // Hero hook rotates through everything we do
  const HOOKS = [
    [`We <em>redesign</em>, <em>remake</em> &amp; <em>fix</em> your business's existing websites &amp; software.`, `Stuck in <s>2014</s> → updated to <b id="yr-now">${YEAR}</b>.`],
    [`Websites that <em>load fast</em> and actually <em>sell</em>.`, `Old one? We rebuild it. No site yet? We ship one.`],
    [`<em>Cloud software</em>: dashboards, SaaS &amp; backends that <em>never sleep</em>.`, `Built in India. Built to scale.`],
    [`<em>Consult</em> us before you spend a rupee on tech.`, `First call is free. Straight answers.`],
    [`Got a <em>wild idea</em> or a <em>startup</em>? Let's build it together.`, `Co-build ✶ partner ✶ ship.`],
    [`Small business, big tech problem? <em>Pitch it</em> to us.`, `<a href="#hello">→ pitch it in one line</a>`],
  ];
  const HOOK_MS = 3400; // how long each headline stays before the next one
  const hook = $("#hook"), hookBig = $("#hook-big"), hookSub = $("#hook-sub"), hookDots = $("#hook-dots");
  let hookI = 0, hookTimer = 0;
  const dots = HOOKS.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Message ${i + 1}`);
    b.style.setProperty("--dur", `${HOOK_MS}ms`);
    b.addEventListener("click", () => showHook(i, true));
    hookDots.appendChild(b);
    return b;
  });
  const markDots = () => dots.forEach((d, i) => {
    d.classList.remove("on");
    d.classList.toggle("done", i < hookI);
    if (i === hookI) { void d.offsetWidth; if (!still) d.classList.add("on"); else d.classList.add("done"); }
  });
  function showHook(i, manual) {
    if (i === hookI && !manual) return;
    hookI = (i + HOOKS.length) % HOOKS.length;
    clearTimeout(hookTimer);
    const swapIn = () => {
      hookBig.innerHTML = HOOKS[hookI][0];
      hookSub.innerHTML = HOOKS[hookI][1];
      hook.classList.remove("swap");
      markDots();
      heroFocus(hookI);
      if (hookI === 0) rollYear();
      if (!still) hookTimer = setTimeout(() => showHook(hookI + 1), HOOK_MS);
    };
    if (still) return swapIn();
    hook.classList.add("swap");
    setTimeout(swapIn, 380);
  }
  // Reserve exactly the room the longest message needs (no jumping, no dead gap under short ones)
  function sizeHook() {
    hookBig.style.minHeight = hookSub.style.minHeight = "";
    const probe = hook.cloneNode(true);
    probe.removeAttribute("id");
    $$("[id]", probe).forEach((el) => el.removeAttribute("id"));
    probe.classList.remove("swap");
    probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;width:${hook.clientWidth}px`;
    hook.parentElement.appendChild(probe);
    const [pb, ps] = [probe.querySelector(".hook-big"), probe.querySelector(".hook-year")];
    let hb = 0, hs = 0;
    HOOKS.forEach(([big, sub]) => {
      pb.innerHTML = big; ps.innerHTML = sub;
      hb = Math.max(hb, pb.offsetHeight); hs = Math.max(hs, ps.offsetHeight);
    });
    probe.remove();
    hookBig.style.minHeight = `${hb}px`;
    hookSub.style.minHeight = `${hs}px`;
  }
  sizeHook();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeHook);
  { let w = innerWidth; addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; sizeHook(); } }); }

  function startHook() {
    markDots();
    if (!still) hookTimer = setTimeout(() => showHook(1), HOOK_MS);
  }
  if (still) { boot.remove(); startHero(); }
  else {
    const log = $("#boot-log");
    let i = 0;
    const next = () => {
      if (i < lines.length) { log.textContent += lines[i++] + "\n"; setTimeout(next, 170); }
      else setTimeout(() => { boot.classList.add("done"); startHero(); setTimeout(() => boot.remove(), 800); }, 220);
    };
    next();
  }

  // Typed prompt
  function typeLoop() {
    const words = ["redesign --old-website", "remake --legacy-software", "fix --bugs --slow-pages", `update --to=${YEAR}`, "automate --workflow", "collab --new-idea"];
    const out = $("#typed");
    if (still) { out.textContent = words[0]; return; }
    let w = 0, c = 0, del = false;
    const step = () => {
      const word = words[w];
      out.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(step, 1300); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1;
      setTimeout(step, del ? 35 : 75);
    };
    step();
  }

  // Letters jump away from the cursor.
  // Letter centres are cached in page coordinates from layout (offsetLeft/Top ignore transforms),
  // so moving the mouse never forces the browser to re-measure the page.
  const dodgeChars = $$(".mega .ch, .mega2 .ch");
  let dodgePos = [];
  const measureChars = () => {
    dodgePos = dodgeChars.map((ch) => {
      let x = 0, y = 0, el = ch;
      while (el) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
      return { ch, cx: x + ch.offsetWidth / 2, cy: y + ch.offsetHeight / 2, on: false };
    });
  };
  measureChars();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureChars);
  { let w = innerWidth; addEventListener("resize", () => { if (innerWidth !== w) { w = innerWidth; measureChars(); } }); }
  // push letters away from a point (page coordinates)
  const dodgeAt = (mx, my) => {
    const R = 160;
    dodgePos.forEach((p) => {
      const dx = p.cx - mx, dy = p.cy - my;
      if (Math.abs(dx) < R && Math.abs(dy) < R) {
        const d = Math.hypot(dx, dy);
        if (d < R) {
          const f = 1 - d / R;
          p.ch.style.transform = `translate(${(dx / d * f * 18 || 0).toFixed(1)}px, ${(dy / d * f * 30 || 0).toFixed(1)}px) rotate(${(dx / d * f * 12 || 0).toFixed(1)}deg)`;
          p.on = true;
          return;
        }
      }
      if (p.on) { p.ch.style.transform = ""; p.on = false; }
    });
  };
  let ghostOn = false; // the intro cursor (below) owns the letters until a real mouse moves
  whenMouse(() => {
    if (still) return;
    let mx = -999, my = -999, raf = 0;
    addEventListener("mousemove", (e) => {
      mx = e.clientX + scrollX; my = e.clientY + scrollY;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!ghostOn) dodgeAt(mx, my); });
    }, { passive: true });
  });

  // Intro: on every visit/reload a cursor glides across the title so the letters show off.
  // It hands over the moment the real mouse moves; on phones it plays once and fades.
  const playGhost = () => {
    if (still || scrollY > innerHeight * 0.5 || !dodgePos.length) return;
    const curEl = $(".cursor");
    const title = dodgePos.filter((p) => p.ch.closest(".mega"));
    if (!title.length) return;
    const minX = Math.min(...title.map((p) => p.cx)), maxX = Math.max(...title.map((p) => p.cx));
    const minY = Math.min(...title.map((p) => p.cy)), maxY = Math.max(...title.map((p) => p.cy));
    const DUR = 3400;
    let t0 = 0, stop = false;
    ghostOn = true;
    document.documentElement.classList.add("ghosting");
    const end = (fade) => {
      if (stop) return;
      stop = true;
      ghostOn = false;
      removeEventListener("pointermove", realMove);
      if (fade) {
        dodgePos.forEach((p) => { if (p.on) { p.ch.style.transform = ""; p.on = false; } });
        curEl.classList.add("ghost-out");
        setTimeout(() => { document.documentElement.classList.remove("ghosting"); curEl.classList.remove("ghost-out"); }, 500);
      } else document.documentElement.classList.remove("ghosting");
    };
    const realMove = (e) => { if (e.pointerType === "mouse" || e.pointerType === "pen") end(false); };
    addEventListener("pointermove", realMove, { passive: true });
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const frame = (now) => {
      if (stop) return;
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / DUR);
      // left → right along the title, weaving through the three lines
      const x = minX - 40 + (maxX - minX + 80) * ease(t);
      const y = minY + (maxY - minY) * (0.5 - 0.5 * Math.cos(t * Math.PI * 3));
      curEl.style.transform = `translate(${(x - scrollX).toFixed(1)}px, ${(y - scrollY).toFixed(1)}px)`;
      dodgeAt(x, y);
      if (t < 1) requestAnimationFrame(frame);
      else setTimeout(() => end(true), hasMouse ? 900 : 300);
    };
    requestAnimationFrame(frame);
  };

  // Custom cursor (grows over anything clickable, including bugs added later)
  const cur = $(".cursor");
  whenMouse(() => {
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
    document.addEventListener("mouseover", (e) => {
      // crosshair while aiming in the bug game (not over its buttons / win screen)
      const aim = !!e.target.closest(".arena") && !e.target.closest(".arena-win, .snd") && !$(".arena").classList.contains("fixed");
      cur.classList.toggle("aim", aim);
      cur.classList.toggle("big", !aim && !!e.target.closest("a, button, input, label, [data-tilt]"));
      cur.classList.toggle("hide", !!e.target.closest(".door")); // the door's own tag follows the mouse there
    });
    document.addEventListener("mouseleave", () => (cur.style.opacity = "0"));
    document.addEventListener("mouseenter", () => (cur.style.opacity = ""));
  });

  // Text scramble on hover
  const glyphs = "!<>-_\\/[]{}=+*^?#01";
  const scramble = (el) => {
    if (still) return;
    const orig = el.dataset.orig || (el.dataset.orig = el.textContent);
    let f = 0;
    clearInterval(el._t);
    el._t = setInterval(() => {
      el.textContent = [...orig].map((ch, i) => (i < f / 2 || ch === " " ? ch : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      if (++f > orig.length * 2) { clearInterval(el._t); el.textContent = orig; }
    }, 22);
  };
  $$("[data-scramble]").forEach((el) => el.addEventListener("mouseenter", () => scramble(el)));

  // 3D tilt cards
  whenMouse(() => {
    if (still) return;
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  });

  // Work: vertical scroll drives the sideways track
  const work = $(".work"), track = $("#w-track"), panels = $$(".panel", track);
  const wDir = $("#w-dir"), wI = $("#w-i"), wBar = $("#w-bar");
  const pin = $(".work-pin");
  // Phones fire "resize" whenever the address bar shows/hides; only react to real width changes
  // (this was a source of the judder on mobile).
  let lastW = innerWidth;
  const onWidth = (fn) => addEventListener("resize", () => { if (innerWidth !== lastW) { lastW = innerWidth; fn(); } });

  // Shrink the illustrations on short screens so they never hit the headline
  const phoneQ = matchMedia("(max-width: 760px)");
  const fitViz = () => $$(".viz").forEach((v) => {
    v.style.setProperty("--s", 1);
    const h = v.offsetHeight;
    const room = phoneQ.matches ? panels[0].offsetHeight * 0.55 : pin.offsetHeight * 0.5;
    v.style.setProperty("--s", Math.min(1, room / h).toFixed(3));
  });
  fitViz();
  onWidth(fitViz);

  // Snap points: each panel is a resting place the page settles on
  const n = panels.length - 1;
  const snaps = panels.map(() => {
    const s = document.createElement("i");
    s.className = "snap-pt";
    s.setAttribute("aria-hidden", "true");
    work.appendChild(s);
    return s;
  });
  const placeSnaps = () => {
    const total = work.offsetHeight - pin.offsetHeight;
    snaps.forEach((s, i) => (s.style.top = `${Math.round((total * i) / n)}px`));
  };
  placeSnaps();
  onWidth(placeSnaps);

  // Each panel locks in place for most of its share of the scroll, then moves to the next
  const HOLD = 0.55;
  const lockStep = (p) => {
    const P = p * n, i = Math.min(n, Math.floor(P)), f = P - i;
    const t = Math.min(1, Math.max(0, (f - HOLD) / (1 - HOLD)));
    return Math.min(n, i + t * t * (3 - 2 * t));
  };

  // which panel is showing: updates the "cd /root/work/…" label, counter, bar and animations
  let lastIdx = -1;
  const showPanel = (idx, progress) => {
    wBar.style.transform = `scaleX(${progress})`;
    if (idx === lastIdx) return;
    lastIdx = idx;
    wDir.textContent = panels[idx].dataset.dir;
    wI.textContent = String(idx + 1).padStart(2, "0");
    panels.forEach((p, i) => p.classList.toggle("active", i === idx));
  };

  // Phones: the panels are a native swipe carousel; the page scrolls normally
  let swipeRaf = 0;
  track.addEventListener("scroll", () => {
    if (!phoneQ.matches || swipeRaf) return;
    swipeRaf = requestAnimationFrame(() => {
      swipeRaf = 0;
      const step = panels[1].offsetLeft - panels[0].offsetLeft;
      const p = Math.min(n, Math.max(0, track.scrollLeft / step));
      showPanel(Math.round(p), (p + 1) / (n + 1));
    });
  }, { passive: true });
  const enterMode = () => {
    if (phoneQ.matches) { track.style.transform = ""; showPanel(Math.round(track.scrollLeft / Math.max(1, panels[1].offsetLeft - panels[0].offsetLeft)), 1 / (n + 1)); }
  };
  phoneQ.addEventListener ? phoneQ.addEventListener("change", enterMode) : phoneQ.addListener(enterMode);
  enterMode();

  // Phones: the carousel swipes itself while it's on screen. A touch pauses it; it carries on
  // a few seconds after you let go. Loops back to the first panel at the end.
  // (It used to pause whenever a finger touched the cards, which includes simply scrolling the
  // page past them, so on a real phone it rarely got going. Now only a sideways swipe pauses it.)
  const AUTO_MS = 2600, FIRST_MS = 1200, RESUME_MS = 3500;
  let autoT = 0, workSeen = false, holdUntil = 0;
  const stepW = () => panels[1].offsetLeft - panels[0].offsetLeft;
  const advance = () => {
    const i = Math.round(track.scrollLeft / stepW());
    const next = i >= n ? 0 : i + 1;
    track.scrollTo({ left: next * stepW(), behavior: "smooth" });
  };
  const autoTick = (wait = AUTO_MS) => {
    clearTimeout(autoT);
    if (!phoneQ.matches || still) return;
    autoT = setTimeout(() => {
      const busy = !workSeen || document.hidden || !svcModal.hidden || Date.now() < holdUntil;
      if (!busy) advance();
      autoTick();
    }, wait);
  };
  // pause only for a real sideways swipe on the cards
  let tx = null, ty = 0;
  track.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  track.addEventListener("touchmove", (e) => {
    if (tx == null) return;
    const dx = Math.abs(e.touches[0].clientX - tx), dy = Math.abs(e.touches[0].clientY - ty);
    if (dx > 10 && dx > dy) { holdUntil = Date.now() + RESUME_MS; tx = null; }
  }, { passive: true });
  track.addEventListener("touchend", () => (tx = null), { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      const was = workSeen;
      workSeen = en.isIntersecting && en.intersectionRatio >= 0.45;
      if (workSeen && !was) autoTick(FIRST_MS); // first move soon after it comes into view
    }, { threshold: [0, 0.45, 0.8] }).observe(track);
  }
  phoneQ.addEventListener ? phoneQ.addEventListener("change", () => autoTick()) : phoneQ.addListener(() => autoTick());
  if (!still) {
    let cur = 0, target = 0, raf = 0;
    const measure = () => {
      if (phoneQ.matches) return; // phones use the swipe carousel
      const total = work.offsetHeight - pin.offsetHeight;
      target = Math.min(1, Math.max(0, -work.getBoundingClientRect().top / total));
      if (!raf) raf = requestAnimationFrame(frame);
    };
    let prevT = 0;
    const frame = (t) => {
      raf = 0;
      const dt = prevT ? Math.min(t - prevT, 200) : 16;
      prevT = t;
      // touch scrolling is already smooth, so follow it directly; ease only for mouse wheels
      cur = hasMouse ? cur + (target - cur) * (1 - Math.exp(-dt / 110)) : target;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const g = lockStep(cur);
      if (phoneQ.matches) return;
      track.style.transform = `translate3d(${(-g * pin.offsetWidth).toFixed(1)}px,0,0)`;
      showPanel(Math.round(g), cur);
      if (cur !== target) raf = requestAnimationFrame(frame);
      else prevT = 0;
    };
    addEventListener("scroll", measure, { passive: true });
    onWidth(measure);
    measure();
  }

  // Motion: --mx / --my in [-1, 1]. Mouse on desktop; phone tilt (very sensitive) on touch.
  // Performance: the values are written only to sections currently on screen. Writing them at the
  // page root made the browser re-check every element on every mouse move.
  let mxT = 0, myT = 0, mxC = 0, myC = 0, mRaf = 0, gyroOn = false;
  const motionZones = $$(".hero, .work-pin, .proc, .doors, .hello, .foot");
  const liveZones = new Set();
  if ("IntersectionObserver" in window) {
    const zio = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) liveZones.add(en.target);
      else liveZones.delete(en.target);
    }));
    motionZones.forEach((z) => zio.observe(z));
  } else motionZones.forEach((z) => liveZones.add(z));
  let lastMx = "", lastMy = "";
  const mFrame = () => {
    mxC += (mxT - mxC) * 0.25; myC += (myT - myC) * 0.25;
    const sx = mxC.toFixed(2), sy = myC.toFixed(2);
    if (sx !== lastMx || sy !== lastMy) {
      lastMx = sx; lastMy = sy;
      liveZones.forEach((z) => { z.style.setProperty("--mx", sx); z.style.setProperty("--my", sy); });
    }
    mRaf = Math.abs(mxT - mxC) + Math.abs(myT - myC) > 0.004 ? requestAnimationFrame(mFrame) : 0;
  };
  const setM = (x, y) => {
    mxT = Math.max(-1, Math.min(1, x)); myT = Math.max(-1, Math.min(1, y));
    if (!mRaf) mRaf = requestAnimationFrame(mFrame);
  };
  whenMouse(() => {
    if (still) return;
    addEventListener("mousemove", (e) => setM(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
  });
  const buzz = (p) => { if (gyroOn && navigator.vibrate) navigator.vibrate(p); };

  const coarse = matchMedia("(hover: none), (pointer: coarse)").matches;
  if (!still && coarse && "DeviceOrientationEvent" in window) {
    // every letter / pill gets its own wobble strength
    $$(".mega .ch, .mega2 .ch, .flow li, .quick button, .tile").forEach((el) =>
      el.style.setProperty("--k", ((0.4 + Math.random() * 1.4) * (Math.random() < 0.5 ? -1 : 1)).toFixed(2)));

    const SENS = 9; // degrees of tilt for full effect — lower = more sensitive
    let base = null;
    const onTilt = (e) => {
      if (e.gamma == null || hasMouse) return; // laptops fire empty events; a mouse wins
      if (!base) {
        base = { g: e.gamma, b: e.beta };
        gyroOn = true;
        document.body.classList.add("gyro");
        $("#motion-btn").hidden = true;
      }
      // slowly re-centre so it works however the phone is held
      base.g += (e.gamma - base.g) * 0.01; base.b += (e.beta - base.b) * 0.01;
      setM((e.gamma - base.g) / SENS, (e.beta - base.b) / SENS);
    };

    let lastShake = 0, prev = null;
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null) return;
      if (prev) {
        const d = Math.abs(a.x - prev.x) + Math.abs(a.y - prev.y) + Math.abs(a.z - prev.z);
        const now = Date.now();
        if (d > 14 && now - lastShake > 900) {
          lastShake = now;
          document.body.classList.remove("shake"); void document.body.offsetWidth; document.body.classList.add("shake");
          $$("[data-scramble]").forEach(scramble);
          buzz([20, 40, 20]);
          setTimeout(() => document.body.classList.remove("shake"), 600);
        }
      }
      prev = { x: a.x, y: a.y, z: a.z };
    };

    // listen now; the "gyro" look only switches on once a real tilt reading arrives
    let listening = false;
    const start = () => {
      if (listening) return;
      listening = true;
      addEventListener("deviceorientation", onTilt);
      addEventListener("devicemotion", onMotion);
    };
    start();

    const btn = $("#motion-btn");
    const phoneSized = Math.min(screen.width, screen.height) < 820;
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // iPhone (and some newer browsers): sensors need a tap to allow.
      // Only offer it on phone-sized screens with no mouse, and only if no reading arrived by itself.
      setTimeout(() => { if (!gyroOn && !hasMouse && phoneSized) btn.hidden = false; }, 1200);
      whenMouse(() => (btn.hidden = true));
      btn.addEventListener("click", async () => {
        try {
          const r = await DeviceOrientationEvent.requestPermission();
          if (typeof DeviceMotionEvent !== "undefined" && DeviceMotionEvent.requestPermission) await DeviceMotionEvent.requestPermission().catch(() => {});
          if (r === "granted") start();
        } catch (_) {}
        btn.hidden = true;
      });
    }

    // no hover on phones: links scramble as they scroll into view
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && scramble(en.target)), { threshold: 1 });
      $$("[data-scramble]").forEach((el) => io.observe(el));
    }
  }

  // ---------- Toy-pistol sounds (made in the browser with Web Audio — no sound files) ----------
  const SFX = (() => {
    let ctx = null, master = null, noise = null;
    let muted = false;
    try { muted = localStorage.getItem("rdp-sound") === "off"; } catch (_) {}
    const get = () => {
      if (muted) return null;
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      if (!ctx) {
        ctx = new C();
        master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
        noise = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    };
    const burst = (a, t, { type = "highpass", freq = 1500, q = 0.7, vol = 0.5, len = 0.08 }) => {
      const n = a.createBufferSource(); n.buffer = noise;
      const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      n.connect(f).connect(g).connect(master); n.start(t); n.stop(t + len + 0.02);
    };
    const tone = (a, t, { type = "square", from, to, vol = 0.16, len = 0.18 }) => {
      const o = a.createOscillator(); o.type = type;
      o.frequency.setValueAtTime(from, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + len);
      const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      o.connect(g).connect(master); o.start(t); o.stop(t + len + 0.02);
    };
    return {
      get muted() { return muted; },
      toggle() {
        muted = !muted;
        try { localStorage.setItem("rdp-sound", muted ? "off" : "on"); } catch (_) {}
        if (!muted) this.tick();
        return muted;
      },
      // cap-gun crack + plastic "pew" that drops in pitch
      pew() {
        const a = get(); if (!a) return;
        const t = a.currentTime, p = 0.85 + Math.random() * 0.35;
        burst(a, t, { freq: 1800, vol: 0.55, len: 0.07 });
        burst(a, t, { type: "lowpass", freq: 420, vol: 0.5, len: 0.12 });
        tone(a, t, { from: 1500 * p, to: 150, len: 0.2 });
        tone(a, t + 0.01, { type: "triangle", from: 760 * p, to: 95, vol: 0.12, len: 0.22 });
      },
      // empty trigger: dry plastic click
      tick() {
        const a = get(); if (!a) return;
        const t = a.currentTime;
        burst(a, t, { type: "bandpass", freq: 3200, q: 4, vol: 0.35, len: 0.025 });
        tone(a, t, { from: 900, to: 600, vol: 0.06, len: 0.03 });
      },
      // rubber stamp hitting a desk
      thunk() {
        const a = get(); if (!a) return;
        const t = a.currentTime;
        burst(a, t, { type: "lowpass", freq: 380, vol: 0.8, len: 0.14 });
        tone(a, t, { type: "sine", from: 140, to: 55, vol: 0.35, len: 0.16 });
        burst(a, t, { type: "bandpass", freq: 2200, q: 2, vol: 0.15, len: 0.03 });
      },
      // 8-bit victory jingle
      win() {
        const a = get(); if (!a) return;
        const t = a.currentTime;
        [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(a, t + i * 0.09, { from: f, vol: 0.13, len: i === 5 ? 0.45 : 0.08 }));
        burst(a, t + 0.5, { freq: 2500, vol: 0.25, len: 0.2 });
      },
    };
  })();

  // Fun: squash the bugs. Tilt the phone and they slide.
  const arena = $("#arena"), bugN = $("#bug-n"), bugT = $("#bug-t"), win = $("#arena-win");
  const BUGS = 8;
  $("#bug-total").textContent = BUGS;
  let bugs = [], squashed = 0, t0 = 0, tick = 0, bRaf = 0, inView = false, lastF = 0;
  const spawn = () => {
    $$(".critter", arena).forEach((c) => c.remove());
    arena.classList.remove("fixed");
    win.hidden = true;
    squashed = 0; t0 = 0; bugN.textContent = "0"; bugT.textContent = "0.0s";
    clearInterval(tick);
    const W = arena.clientWidth, H = arena.clientHeight;
    bugs = Array.from({ length: BUGS }, () => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "critter";
      el.setAttribute("aria-label", "Squash bug");
      el.textContent = "🪲";
      const b = { el, x: 40 + Math.random() * (W - 80), y: 60 + Math.random() * (H - 100), a: Math.random() * Math.PI * 2, v: 0.6 + Math.random() * 1.2, dead: false };
      el.addEventListener("pointerdown", (e) => { e.preventDefault(); squash(b); });
      el.addEventListener("click", () => squash(b)); // keyboard
      arena.appendChild(el);
      place(b);
      return b;
    });
  };
  const place = (b) => { b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.a + Math.PI / 2}rad)`; };
  const squash = (b) => {
    if (b.dead) return;
    b.dead = true;
    b.el.textContent = "✶";
    b.el.classList.add("dead");
    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    buzz(25);
    SFX.pew();
    pow(b.x, b.y);
    if (!still) arena.animate([{ translate: "0 0" }, { translate: `${Math.random() * 6 - 3}px -3px` }, { translate: "0 0" }], { duration: 110 });
    if (!t0) {
      t0 = performance.now();
      tick = setInterval(() => (bugT.textContent = `${((performance.now() - t0) / 1000).toFixed(1)}s`), 100);
    }
    bugN.textContent = ++squashed;
    if (squashed === BUGS) {
      clearInterval(tick);
      const s = ((performance.now() - t0) / 1000).toFixed(1);
      bugT.textContent = `${s}s`;
      $("#bug-final").textContent = `${s}s`;
      arena.classList.add("fixed");
      buzz([30, 60, 30, 60, 80]);
      setTimeout(() => SFX.win(), 250);
      setTimeout(() => { win.hidden = false; }, 700);
    }
  };
  const bugFrame = (t) => {
    const dt = lastF ? Math.min(50, t - lastF) / 16.7 : 1;
    lastF = t;
    const W = arena.clientWidth, H = arena.clientHeight;
    bugs.forEach((b) => {
      if (b.dead) return;
      b.a += (Math.random() - 0.5) * 0.35 * dt;
      let vx = Math.cos(b.a) * b.v, vy = Math.sin(b.a) * b.v;
      if (gyroOn) { vx += mxC * 5; vy += myC * 5; } // tilt makes them slide
      b.x += vx * dt; b.y += vy * dt;
      if (b.x < 26) { b.x = 26; b.a = Math.PI - b.a; }
      if (b.x > W - 26) { b.x = W - 26; b.a = Math.PI - b.a; }
      if (b.y < 56) { b.y = 56; b.a = -b.a; }
      if (b.y > H - 26) { b.y = H - 26; b.a = -b.a; }
      place(b);
    });
    bRaf = inView ? requestAnimationFrame(bugFrame) : 0;
  };
  // comic "POW!" where a bug got hit
  const POWS = ["POW!", "BANG!", "PEW!", "ZAP!", "BAM!", "SPLAT!"];
  function pow(x, y) {
    const s = document.createElement("span");
    s.className = "pow";
    s.textContent = POWS[(Math.random() * POWS.length) | 0];
    s.style.left = `${x}px`; s.style.top = `${y - 34}px`;
    s.style.setProperty("--r", `${(Math.random() * 30 - 15).toFixed(0)}deg`);
    arena.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
  // shooting empty space: click of an empty toy trigger
  arena.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".critter, button, a") || arena.classList.contains("fixed")) return;
    SFX.tick();
  });
  // sound on/off (remembered)
  const sndBtn = $("#bug-sound");
  const sndLabel = () => {
    sndBtn.textContent = SFX.muted ? "♪ off" : "♪ on";
    sndBtn.setAttribute("aria-pressed", String(!SFX.muted));
  };
  sndBtn.addEventListener("click", () => { SFX.toggle(); sndLabel(); });
  sndLabel();

  spawn();
  $("#bug-again").addEventListener("click", spawn);
  if (!still && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => {
      inView = en.isIntersecting;
      if (inView && !bRaf) { lastF = 0; bRaf = requestAnimationFrame(bugFrame); }
    }).observe(arena);
  }

  // Contact: quick picks, email, send
  const MAIL = "raghavmittal.founder@gmail.com";
  // WhatsApp: messages from the site open with "Hey Raghav 👋" and mention the
  // website, so they're easy to spot in your chats while still reading like a normal hello.
  const WA = "917777016553";
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const WA_HELLO = "Hey Raghav 👋\nJust came across your website and I'd love to chat about a project.\n\n";
  $$("a[data-wa]").forEach((a) => (a.href = waLink(WA_HELLO)));
  const form = $("#ask"), q = $("#q"), em = $("#em"), log = $("#ask-log"), send = $("#send");
  $$(".quick button").forEach((b) => b.addEventListener("click", () => {
    $$(".quick button").forEach((x) => x.classList.toggle("on", x === b));
    q.value = b.dataset.q;
    q.closest(".field").classList.remove("bad");
    buzz(12);
    (em.value ? send : em).focus({ preventScroll: true });
  }));
  [q, em].forEach((el) => el.addEventListener("input", () => el.closest(".field").classList.remove("bad")));

  // magnetic send button on desktop
  whenMouse(() => {
    if (still) return;
    send.addEventListener("mousemove", (e) => {
      const r = send.getBoundingClientRect();
      send.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.06}px ${(e.clientY - r.top - r.height / 2) * 0.25}px`;
    });
    send.addEventListener("mouseleave", () => (send.style.translate = ""));
  });

  const typeLog = (lines, done) => {
    log.textContent = "";
    let i = 0;
    const next = () => {
      if (i >= lines.length) return done && done();
      log.textContent += lines[i++] + "\n";
      setTimeout(next, still ? 0 : 320);
    };
    next();
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const idea = q.value.trim(), mail = em.value.trim();
    const badIdea = !idea, badMail = !/^\S+@\S+\.\S+$/.test(mail);
    q.closest(".field").classList.toggle("bad", badIdea);
    em.closest(".field").classList.toggle("bad", badMail);
    if (badIdea || badMail) {
      buzz([40, 30, 40]);
      typeLog([badIdea ? "✗ tell us what we're building" : "✗ that email looks off"]);
      (badIdea ? q : em).focus();
      return;
    }
    send.classList.add("sent");
    $(".send-t", send).textContent = "SENDING…";
    buzz(30);
    const url = waLink(`Hey Raghav 👋\nFound you through your website. Here's what I have in mind:\n\n✦ ${idea}\n\nYou can also reach me at ${mail}. Looking forward to it!`);
    // desktop: open WhatsApp Web in a new tab right away (browsers block pop-ups opened later)
    const opened = hasMouse ? window.open(url, "_blank", "noopener") : null;
    typeLog(["> packing your idea ......... ok", `> reply-to: ${mail} ...... ok`, "> opening WhatsApp .......... ✓  hit send there"], () => {
      if (!opened) location.href = url;
      $(".send-t", send).textContent = "SENT ✓";
      setTimeout(() => { send.classList.remove("sent"); $(".send-t", send).textContent = "SEND IT"; }, 4000);
    });
  });

  // copy email tile
  const copyBtn = $("#copy-mail"), copyNote = $("#copy-note");
  copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(MAIL); copyNote.textContent = "copied ✓"; }
    catch (_) { location.href = `mailto:${MAIL}`; return; }
    copyBtn.classList.add("copied");
    buzz(20);
    setTimeout(() => { copyNote.textContent = "tap to copy"; copyBtn.classList.remove("copied"); }, 1800);
  });

  // ---------- Scroll reveals: content arrives as you scroll ----------
  panels[0].classList.add("active");
  if (still) panels.forEach((p) => p.classList.add("active"));

  const splitWords = (el) => {
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(part));
          const w = document.createElement("span"), inner = document.createElement("span");
          w.className = "w"; inner.textContent = part; w.appendChild(inner); frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1) walk(c);
    });
    walk(el);
    $$(".w > span", el).forEach((s, i) => s.style.setProperty("--d", `${i * 0.07}s`));
    el.classList.add("wrv");
  };

  const reveal = [];
  const add = (sel, cls = "rv", step = 0) => $$(sel).forEach((el, i) => {
    cls.split(" ").forEach((c) => el.classList.add(c));
    if (step) el.style.setProperty("--d", `${(i * step).toFixed(2)}s`);
    reveal.push(el);
  });

  $$(".proc-head h2, .fun .sec-title").forEach((el) => { splitWords(el); reveal.push(el); });
  add(".proc .cmd, .fun .cmd, .fun-sub, .doors-cmd, .hello > .cmd, .ask-label, .field, .send");
  add(".flow li", "rv pop", 0.12);
  add(".quick button", "rv pop", 0.04);
  add(".tile", "rv", 0.12);
  add("#arena", "rv-wipe");
  add(".door-a", "rv-l");
  add(".door-b", "rv-r");
  add(".or", "rv");
  add(".foot-word", "rv");
  const mega2 = $(".mega2");
  $$(".ch", mega2).forEach((c, i) => c.style.setProperty("--d", `${i * 0.06}s`));
  reveal.push(mega2);

  if (!still && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      io.unobserve(el);
      // once arrived, drop the reveal classes so the element's own hover transitions come back
      if (el.classList.contains("rv")) {
        const delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
        setTimeout(() => el.classList.remove("rv", "pop", "in"), 1300 + delay * 1000);
      }
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveal.filter((el) => !el.classList.contains("rv-wipe")).forEach((el) => io.observe(el));
    // a fully clipped box never counts as "visible", so watch its section instead
    $$(".rv-wipe").forEach((el) => {
      const wio = new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { el.classList.add("in"); wio.disconnect(); }
      }, { threshold: 0.2 });
      wio.observe(el.parentElement);
    });
  } else reveal.forEach((el) => el.classList.add("in"));

  // ---------- Doors: strips slide with scroll, OR spins, tag follows the mouse ----------
  const doors = $$(".door"), orEl = $(".or");
  let dRaf = 0;
  const doorScroll = () => {
    dRaf = 0;
    doors.forEach((d, i) => {
      const r = d.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
      const x = i === 0 ? -150 - p * 700 : -850 + p * 700;
      d.style.setProperty("--x", `${x.toFixed(1)}px`);
      if (i === 0) orEl.style.setProperty("--rot", `${(p * 540).toFixed(1)}deg`);
    });
  };
  if (!still) {
    addEventListener("scroll", () => { if (!dRaf) dRaf = requestAnimationFrame(doorScroll); }, { passive: true });
    doorScroll();
  }
  whenMouse(() => doors.forEach((d) => d.addEventListener("mousemove", (e) => {
    const r = d.getBoundingClientRect(), tag = $(".door-tag", d);
    const tx = Math.min(e.clientX - r.left + 20, r.width - tag.offsetWidth - 12);
    const ty = Math.min(e.clientY - r.top + 20, r.height - tag.offsetHeight - 8);
    d.style.setProperty("--tx", `${tx}px`);
    d.style.setProperty("--ty", `${ty}px`);
  })));
  doors.forEach((d) => d.addEventListener("click", (e) => {
    e.preventDefault();
    $("#hello").scrollIntoView({ behavior: still ? "auto" : "smooth" });
    const pick = $$(".quick button").find((b) => b.dataset.q === d.dataset.pick);
    setTimeout(() => pick && pick.click(), still ? 0 : 650);
  }));

  // ---------- Footer: social links (fill in a URL to show it) + service links ----------
  const SOCIALS = [
    ["GitHub", "https://github.com/Raghav1000000000", "M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"],
    ["LinkedIn", "https://www.linkedin.com/in/raghavmittal100/", "M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"],
    ["Instagram", "", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM23.9 7c-.1-1.9-.5-3.6-1.9-5S18.9.2 17 .1C15 0 9 0 7 .1 5.1.2 3.4.6 2 2S.2 5.1.1 7C0 9 0 15 .1 17c.1 1.9.5 3.6 1.9 5s3.1 1.8 5 1.9c2 .1 8 .1 10 0 1.9-.1 3.6-.5 5-1.9s1.8-3.1 1.9-5c.1-2 .1-8 0-10zm-2.6 12.4a4 4 0 0 1-2.3 2.3c-1.6.6-5.3.5-7 .5s-5.4.1-7-.5a4 4 0 0 1-2.3-2.3C2.1 17.8 2.2 14 2.2 12s-.1-5.8.5-7a4 4 0 0 1 2.3-2.4C6.6 2 10.3 2.2 12 2.2s5.4-.1 7 .5a4 4 0 0 1 2.3 2.3c.6 1.6.5 5.4.5 7s.1 5.4-.5 7z"],
    ["X", "", "M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4zm-1.2 17.9h1.9L7 4.2H5z"],
  ];
  const socialsEl = $("#socials");
  SOCIALS.filter(([, url]) => url).forEach(([name, url, path]) => {
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>${name}`;
    socialsEl.appendChild(a);
  });

  // jump straight to one of the work panels
  const goPanel = (i) => {
    if (phoneQ.matches) {
      work.scrollIntoView({ behavior: still ? "auto" : "smooth" });
      track.scrollTo({ left: panels[i].offsetLeft - panels[0].offsetLeft, behavior: still ? "auto" : "smooth" });
    } else {
      const total = work.offsetHeight - pin.offsetHeight;
      scrollTo({ top: work.offsetTop + (total * i) / n, behavior: still ? "auto" : "smooth" });
    }
  };

  // ---------- Service popups: opened from the nav ("services", "consult", "collab") and the footer ----------
  const SERVICES = [
    { id: "remake", tag: "remake/", name: "Remake & redesign", acc: "#3D35FF", panel: 0, pick: "Redesign my old website",
      short: "Old site or software, rebuilt for today",
      lede: "Your old website or software, rebuilt for the way your customers use it today.",
      gets: ["A fresh, modern design that works beautifully on phones first", "Faster pages and better visibility on Google", "Your content, products and data moved over safely", "A site your team can update without calling a developer"],
      fit: "businesses whose website looks dated, loads slowly, or feels embarrassing to share on WhatsApp.",
      meta: ["Fixed quote after a free check", "Keep your domain & data"] },
    { id: "fix", tag: "fix/", name: "Fix bugs & speed", acc: "#FF5B1F", panel: 1, pick: "Fix my website",
      short: "Broken, slow or buggy, found and fixed",
      lede: "Something broken, slow or unsafe? We find the real cause and fix it properly.",
      gets: ["A plain-language report of what's wrong and why", "Fixes for errors, crashes, broken forms and checkouts", "Speed improvements you can feel", "Security updates and backups, so it doesn't happen again"],
      fit: "urgent problems: a site that's down, losing orders, flagged as unsafe, or too slow to use.",
      meta: ["Urgent issues first", "Clear before/after"] },
    { id: "web", tag: "web/", name: "Websites", acc: "#FF5B1F", panel: 2, pick: "", q: "A new website for my business",
      short: "Fast websites that turn visitors into customers",
      lede: "A website that loads fast, looks sharp and turns visitors into customers.",
      gets: ["A custom design made for your brand, not a template", "Mobile-first and ready for Google from day one", "WhatsApp chat, UPI/Razorpay payments and enquiry forms built in", "Domain, hosting and launch handled for you"],
      fit: "new businesses, launches, shops and service providers who need to look credible online.",
      meta: ["Fixed price", "You own everything"] },
    { id: "cloud", tag: "cloud/", name: "Cloud software", acc: "#D7FF3A", panel: 3, pick: "Build cloud software / a dashboard",
      short: "Dashboards, portals and SaaS that never sleep",
      lede: "Custom dashboards, portals and software that run reliably, around the clock.",
      gets: ["Web apps, admin dashboards and customer portals", "Secure logins with roles for your team", "APIs and databases designed to grow with you", "Hosting, monitoring and backups on reliable cloud"],
      fit: "teams outgrowing spreadsheets, and startups turning an idea into a real product.",
      meta: ["Built to scale", "Hosted in India when needed"] },
    { id: "automate", tag: "automate/", name: "Automation", acc: "#D7FF3A", panel: 4, pick: "", q: "Automate a workflow in my business",
      short: "Busywork that runs itself",
      lede: "Hand the repetitive work to software, so your team can focus on customers.",
      gets: ["Workflows that connect the tools you already use: WhatsApp, Sheets, Tally, email", "Automatic invoices, reminders and reports", "Data kept in sync between your systems", "Fewer manual errors and hours saved every week"],
      fit: "teams that spend hours copying data, sending the same messages, or building the same reports.",
      meta: ["Works with your tools", "Small wins first"] },
    { id: "consult", tag: "consult/", name: "Consulting", acc: "#F1EEE6", panel: -1, pick: "Need tech advice (consultation)",
      short: "Honest tech advice before you spend",
      lede: "Clear, honest tech advice before you spend money on the wrong thing.",
      gets: ["A review of your current website, software and tools", "Recommendations in plain language, no jargon", "Build-vs-buy guidance and a second opinion on vendor quotes", "A step-by-step roadmap you can act on"],
      fit: "owners who aren't sure what to build, what it should cost, or whom to trust.",
      meta: ["First call is free", "No obligation"] },
    { id: "collab", tag: "collab/", name: "Startup collabs", acc: "#FF5B1F", panel: -1, pick: "Collab on a startup idea",
      short: "Your idea, built together, sketch to launch",
      lede: "Got an idea? We build it with you, from first sketch to launch day.",
      gets: ["Scoping your MVP so you build only what matters first", "Design and development as one team", "Flexible ways to work: fixed scope or a longer partnership", "Support after launch while you learn from real users"],
      fit: "founders, side projects and early-stage startups who want a hands-on tech partner.",
      meta: ["Fixed scope or partnership", "Founder-friendly"] },
  ];
  const ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.7 11.7 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>';
  const ICON_MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h16V7.4l-8 5.3-8-5.3zM5.6 7l6.4 4.2L18.4 7H5.6z"/></svg>';
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const svcModal = $("#svc-modal"), svcBody = $("#svc-body"), svcSheet = $(".svc-sheet", svcModal);
  let svcOpen = false, svcIdx = -1, svcLastFocus = null;

  const waFor = (s) => waLink(`Hey Raghav 👋\nI came across your ${s.name.toLowerCase()} service on the website and I'd like to know more.\n\nHere's what I need: `);
  const gmailFor = (s) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(MAIL)}&su=${encodeURIComponent(`Enquiry: ${s.name} · via raghavmittal site`)}&body=${encodeURIComponent(`Hi Raghav,\n\nI came across your ${s.name.toLowerCase()} service on the website and I'd like to know more.\n\nHere's what I need:\n\n`)}`;

  const renderCard = (i, dir = 0) => {
    const s = SERVICES[i];
    svcIdx = i;
    svcSheet.style.setProperty("--acc", s.acc);
    svcSheet.setAttribute("aria-labelledby", "svc-title");
    svcBody.innerHTML = `
      <div class="svc-top"><span class="svc-tag">${s.tag}</span><span class="svc-count">${i + 1}/${SERVICES.length}</span>
        <div class="svc-nav"><button type="button" data-step="-1" aria-label="Previous service">←</button><button type="button" data-step="1" aria-label="Next service">→</button></div></div>
      <h2 id="svc-title">${esc(s.name)}</h2>
      <p class="svc-lede">${esc(s.lede)}</p>
      <p class="svc-h">What you get</p>
      <ul class="svc-list">${s.gets.map((g) => `<li>${esc(g)}</li>`).join("")}</ul>
      <p class="svc-for"><b>A good fit for</b> ${esc(s.fit)}</p>
      <div class="svc-meta">${s.meta.map((m) => `<span>${esc(m)}</span>`).join("")}</div>
      <div class="svc-cta">
        <a class="svc-btn wa" href="${waFor(s)}" target="_blank" rel="noopener">${ICON_WA}WhatsApp</a>
        <a class="svc-btn gm" href="${gmailFor(s)}" target="_blank" rel="noopener">${ICON_MAIL}Gmail</a>
        <div class="svc-more"><button type="button" data-form>or use the form</button>${s.panel >= 0 ? `<button type="button" data-see="${s.panel}">see it in action →</button>` : `<button type="button" data-doors>see both paths →</button>`}</div>
      </div>`;
    svcBody.scrollTop = 0;
    if (dir && !still) { svcBody.style.setProperty("--dir", `${dir * 18}px`); svcBody.classList.remove("swap"); void svcBody.offsetWidth; svcBody.classList.add("swap"); }
  };
  const renderList = () => {
    svcIdx = -1;
    svcSheet.style.setProperty("--acc", "#D7FF3A");
    svcSheet.setAttribute("aria-labelledby", "svc-title");
    svcBody.innerHTML = `
      <div class="svc-top"><span class="svc-tag">ls /root/services</span></div>
      <h2 id="svc-title">What we do</h2>
      <p class="svc-lede">Pick a service to see what's included and how to start.</p>
      <ul class="svc-pick">${SERVICES.map((s, i) => `<li><button type="button" data-open="${i}"><span class="n">0${i + 1}</span><span class="t"><b>${esc(s.name)}</b><small>${esc(s.short)}</small></span><span class="a">→</span></button></li>`).join("")}</ul>`;
    svcBody.scrollTop = 0;
  };
  const openSvc = (key) => {
    svcLastFocus = document.activeElement;
    if (key === "list") renderList();
    else renderCard(Math.max(0, SERVICES.findIndex((s) => s.id === key)));
    svcModal.hidden = false;
    svcModal.classList.remove("closing");
    svcSheet.style.transform = "";
    document.documentElement.style.overflow = "hidden";
    svcOpen = true;
    requestAnimationFrame(() => svcSheet.focus({ preventScroll: true }));
  };
  const closeSvc = (then) => {
    if (!svcOpen) return;
    svcOpen = false;
    svcModal.classList.add("closing");
    setTimeout(() => {
      svcModal.hidden = true;
      svcModal.classList.remove("closing");
      document.documentElement.style.overflow = "";
      if (then) then(); else if (svcLastFocus) svcLastFocus.focus({ preventScroll: true });
    }, still ? 0 : 230);
  };

  // open from the nav + footer
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-svc]");
    if (!t || svcModal.contains(t)) return;
    e.preventDefault();
    openSvc(t.dataset.svc);
  });
  // inside the popup
  svcModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) return closeSvc();
    const open = e.target.closest("[data-open]");
    if (open) return renderCard(+open.dataset.open, 1);
    const step = e.target.closest("[data-step]");
    if (step) return renderCard((svcIdx + +step.dataset.step + SERVICES.length) % SERVICES.length, +step.dataset.step);
    const see = e.target.closest("[data-see]");
    if (see) return closeSvc(() => goPanel(+see.dataset.see));
    if (e.target.closest("[data-doors]")) return closeSvc(() => $("#talk").scrollIntoView({ behavior: still ? "auto" : "smooth" }));
    if (e.target.closest("[data-form]")) {
      const s = SERVICES[svcIdx];
      return closeSvc(() => {
        $("#hello").scrollIntoView({ behavior: still ? "auto" : "smooth" });
        const pick = $$(".quick button").find((b) => b.dataset.q === s.pick);
        setTimeout(() => { if (pick) pick.click(); else { q.value = s.q || s.name; (em.value ? send : em).focus({ preventScroll: true }); } }, still ? 0 : 650);
      });
    }
  });
  // keyboard: Esc closes, arrows browse, Tab stays inside
  document.addEventListener("keydown", (e) => {
    if (!svcOpen) return;
    if (e.key === "Escape") { e.preventDefault(); closeSvc(); }
    else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && svcIdx >= 0 && !/input|textarea/i.test(document.activeElement.tagName)) {
      const d = e.key === "ArrowRight" ? 1 : -1;
      renderCard((svcIdx + d + SERVICES.length) % SERVICES.length, d);
    } else if (e.key === "Tab") {
      const f = $$("button, a[href]", svcSheet).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && (document.activeElement === f[0] || document.activeElement === svcSheet)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // phones: drag the sheet down to close
  {
    let y0 = null, dy = 0;
    svcSheet.addEventListener("touchstart", (e) => { if (!phoneQ.matches || svcBody.scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
    svcSheet.addEventListener("touchmove", (e) => {
      if (y0 == null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (dy > 0) { svcSheet.style.transition = "none"; svcSheet.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });
    svcSheet.addEventListener("touchend", () => {
      if (y0 == null) return;
      y0 = null;
      svcSheet.style.transition = "transform .25s ease";
      if (dy > 110) { svcSheet.style.transform = "translateY(100%)"; setTimeout(() => { svcSheet.style.transition = ""; closeSvc(); }, 200); }
      else { svcSheet.style.transform = ""; setTimeout(() => (svcSheet.style.transition = ""), 260); }
    });
  }

  // ---------- Performance: pause looping animations in sections that are off screen ----------
  if ("IntersectionObserver" in window) {
    const offIo = new IntersectionObserver((es) => es.forEach((en) => en.target.classList.toggle("off", !en.isIntersecting)), { rootMargin: "120px 0px" });
    $$(".hero, .bands, .work, .proc, .fun, .doors, .hello, .foot").forEach((s) => offIo.observe(s));
  }
})();
