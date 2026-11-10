// Root Directory Project — no build, no dependencies.
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

  const YEAR = new Date().getFullYear();
  $("#yr").textContent = YEAR;
  document.documentElement.classList.add("js");
  $("#yr-now").textContent = YEAR;

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
  addEventListener("resize", fitMega);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMega);

  // Boot screen, then hero letters rise in
  const boot = $(".boot");
  const lines = [
    "> scanning your-business.in ..... design from 2014 found",
    "> redesign ...................... ok",
    "> remake ........................ ok",
    "> fix 37 bugs ................... ok",
    `> updated to ${YEAR}. welcome.`,
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
  };

  // Hero hook rotates through everything we do
  const HOOKS = [
    [`We <em>redesign</em>, <em>remake</em> &amp; <em>fix</em> your business's existing websites &amp; software.`, `Stuck in <s>2014</s> → updated to <b id="yr-now">${YEAR}</b>.`],
    [`Websites that <em>load fast</em> and actually <em>sell</em>.`, `Old one? We rebuild it. No site yet? We ship one.`],
    [`<em>Cloud software</em>: dashboards, SaaS &amp; backends that <em>never sleep</em>.`, `Built in India. Built to scale.`],
    [`<em>Consult</em> us before you spend a rupee on tech.`, `First call is free. Straight answers.`],
    [`Got a <em>wild idea</em> or a <em>startup</em>? Let's build it together.`, `Co-build ✶ partner ✶ ship.`],
    [`Small business, big tech problem? <em>Pitch it</em> to us.`, `<a href="#hello">→ pitch it in one line</a>`],
  ];
  const HOOK_MS = 5200;
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
      if (hookI === 0) rollYear();
      if (!still) hookTimer = setTimeout(() => showHook(hookI + 1), HOOK_MS);
    };
    if (still) return swapIn();
    hook.classList.add("swap");
    setTimeout(swapIn, 380);
  }
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

  // Letters jump away from the cursor
  whenMouse(() => {
    if (still) return;
    const chars = $$(".mega .ch, .mega2 .ch");
    let mx = -999, my = -999, raf = 0;
    addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        chars.forEach((ch) => {
          const r = ch.getBoundingClientRect();
          const dx = r.left + r.width / 2 - mx, dy = r.top + r.height / 2 - my;
          const d = Math.hypot(dx, dy), R = 160;
          if (d < R) {
            const f = (1 - d / R);
            ch.style.transform = `translate(${dx / d * f * 18 || 0}px, ${dy / d * f * 30 || 0}px) rotate(${dx / d * f * 12 || 0}deg)`;
          } else if (ch.style.transform) ch.style.transform = "";
        });
      });
    }, { passive: true });
  });

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
  // Shrink the illustrations on short screens so they never hit the headline
  const fitViz = () => $$(".viz").forEach((v) => {
    v.style.setProperty("--s", 1);
    const h = v.offsetHeight;
    v.style.setProperty("--s", Math.min(1, (innerHeight * 0.5) / h).toFixed(3));
  });
  fitViz();
  addEventListener("resize", fitViz);

  if (!still) {
    let cur = 0, target = 0, last = -1, raf = 0;
    const measure = () => {
      const total = work.offsetHeight - innerHeight;
      target = Math.min(1, Math.max(0, -work.getBoundingClientRect().top / total));
      if (!raf) raf = requestAnimationFrame(frame);
    };
    let prevT = 0;
    const frame = (t) => {
      raf = 0;
      const dt = prevT ? Math.min(t - prevT, 200) : 16;
      prevT = t;
      cur += (target - cur) * (1 - Math.exp(-dt / 110));
      if (Math.abs(target - cur) < 0.0005) cur = target;
      const n = panels.length - 1;
      track.style.transform = `translate3d(${-cur * n * 100}vw,0,0)`;
      wBar.style.transform = `scaleX(${cur})`;
      const idx = Math.round(cur * n);
      if (idx !== last) {
        last = idx;
        wDir.textContent = panels[idx].dataset.dir;
        wI.textContent = String(idx + 1).padStart(2, "0");
        panels.forEach((p, i) => p.classList.toggle("active", i === idx));
      }
      if (cur !== target) raf = requestAnimationFrame(frame);
      else prevT = 0;
    };
    addEventListener("scroll", measure, { passive: true });
    addEventListener("resize", measure);
    measure();
  }

  // Motion: --mx / --my in [-1, 1]. Mouse on desktop; phone tilt (very sensitive) on touch.
  const rootStyle = document.documentElement.style;
  let mxT = 0, myT = 0, mxC = 0, myC = 0, mRaf = 0, gyroOn = false;
  const mFrame = () => {
    mxC += (mxT - mxC) * 0.25; myC += (myT - myC) * 0.25;
    rootStyle.setProperty("--mx", mxC.toFixed(3));
    rootStyle.setProperty("--my", myC.toFixed(3));
    mRaf = Math.abs(mxT - mxC) + Math.abs(myT - myC) > 0.002 ? requestAnimationFrame(mFrame) : 0;
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
  const MAIL = "hello@rootdirectoryproject.com";
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
    typeLog(["> packing your idea ......... ok", `> reply-to: ${mail} ...... ok`, "> opening your email app ... ✓  hit send there"], () => {
      const body = `${idea}\n\nReply to: ${mail}`;
      location.href = `mailto:${MAIL}?subject=${encodeURIComponent("New project: " + idea.slice(0, 60))}&body=${encodeURIComponent(body)}`;
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
})();
