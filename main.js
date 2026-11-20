/* Root Directory — page behaviour. No framework, no build step. The night scene is drawn by scene.js. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- the scene stays put; the page slides over it and it dims ---------- */
  const hero = $(".hero"), scene = $(".scene"), nav = $(".nav"), intro = $(".intro"), copy = $(".hero-copy"), floatCta = $(".float-cta");
  const layers = $$(".scene [data-depth]").map((n) => ({ n, d: +n.dataset.depth }));
  let mx = 0, my = 0, tmx = 0, tmy = 0, hasMouse = false;
  // a real mouse move turns the mouse parallax on (touch laptops report pointer:coarse, so no media query)
  addEventListener("mousemove", (e) => {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
    hasMouse = true; tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1; kick();
  }, { passive: true });
  const contact = $("#contact");
  const frame = () => {
    const y = scrollY, h = intro.offsetHeight, p = clamp(y / (h * .85), 0, 1);
    hero.style.setProperty("--dim", (p * .74).toFixed(3));
    scene.style.transform = `scale(${(1 + p * .06).toFixed(4)}) translate3d(0,${(-p * 30).toFixed(1)}px,0)`;
    copy.style.opacity = (1 - p * 1.6).toFixed(2);
    copy.style.transform = `translate3d(0,${(-y * .25).toFixed(1)}px,0)`;
    nav.classList.toggle("solid", y > h * .6);
    const cr = contact.getBoundingClientRect();
    floatCta.classList.toggle("show", y > h * .7 && cr.top > innerHeight * .6);
    mx += (tmx - mx) * .07; my += (tmy - my) * .07;
    if (hasMouse) for (const { n, d } of layers) n.style.transform = `translate3d(${(-mx * d * 34).toFixed(1)}px,${(-my * d * 12).toFixed(1)}px,0)`;
    growRoot();
    return hasMouse && (Math.abs(tmx - mx) > .002 || Math.abs(tmy - my) > .002);
  };
  let ticking = false;
  const loop = () => { if (frame()) requestAnimationFrame(loop); else ticking = false; };
  function kick() { if (!ticking) { ticking = true; requestAnimationFrame(loop); } }
  addEventListener("scroll", kick, { passive: true });

  /* ---------- the tree's root, carried down the page ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.appendChild(n); return n; };
  const flow = $(".flow"), svg = $("#root-line");
  let R = null;
  const buildRoot = () => {
    $$("path, circle", svg).forEach((n) => n.remove());
    const W = flow.clientWidth, H = flow.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    // offsets (not bounding boxes) so the fade-in nudge doesn't shift the measurements
    const off = (el) => { let x = 0, y = 0; while (el && el !== flow) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x, y }; };
    const wrapLeft = off($("#services .wrap")).x;
    const phone = innerWidth <= 760, gx = Math.max(10, wrapLeft - (phone ? 16 : 40));
    const heads = $$(".flow h2").map((h) => { const o = off(h); return { y: o.y + h.offsetHeight / 2, x: o.x }; });
    const bendEnd = Math.max(80, Math.min(170, heads[0].y - 50)), last = heads[heads.length - 1].y;
    const d = `M${W / 2} 0 C${W / 2} ${bendEnd * .6} ${gx} ${bendEnd * .35} ${gx} ${bendEnd} L${gx} ${last}`;
    mk("path", { d, class: "rl-faint" }, svg);
    const main = mk("path", { d, class: "rl" }, svg);
    const nodes = heads.map(({ y, x }) => {
      const nx = Math.max(gx + 8, x - 14);
      const b = mk("path", { d: `M${gx} ${y - 26} Q${gx} ${y} ${nx} ${y}`, class: "rl" }, svg);
      const L = b.getTotalLength(); b.style.strokeDasharray = L; b.style.strokeDashoffset = L; b.style.transition = "stroke-dashoffset .6s ease";
      return { y, b, L, c: mk("circle", { cx: nx, cy: y, r: 3.5, class: "node" }, svg) };
    });
    const total = main.getTotalLength(), samples = [];
    for (let l = 0; l <= total; l += 12) samples.push([l, main.getPointAtLength(l).y]);
    samples.push([total, main.getPointAtLength(total).y]);
    main.style.strokeDasharray = total;
    const tip = mk("circle", { r: 3, class: "tip" }, svg);
    R = { main, total, samples, nodes, tip, top: flow.getBoundingClientRect().top + scrollY };
    growRoot();
  };
  function growRoot() {
    if (!R) return;
    const target = scrollY + innerHeight * .62 - R.top;
    let len = 0;
    for (const [l, y] of R.samples) { if (y > target) break; len = l; }
    R.main.style.strokeDashoffset = (R.total - len).toFixed(1);
    const p = R.main.getPointAtLength(len);
    R.tip.setAttribute("cx", p.x.toFixed(1)); R.tip.setAttribute("cy", p.y.toFixed(1));
    R.tip.style.opacity = len > 2 && len < R.total - 2 ? 1 : 0;
    for (const n of R.nodes) {
      const on = target >= n.y - 26;
      n.c.classList.toggle("on", on);
      n.b.style.strokeDashoffset = on ? 0 : n.L;
    }
  }

  /* ---------- work: choose a project, see one preview ---------- */
  const work = [
    ["restaurant", "Restaurant order system", "Cloud software", "Guests order from their phone and the kitchen sees it instantly.", "restaurant-menu"],
    ["records", "Records platform", "Cloud software", "Staff and student records in one searchable system.", "records-overview"],
    ["tea", "Tea delivery bookings", "Cloud software", "Customers book a delivery and see when it will arrive.", "tea-customer"],
    ["meetx", "MeetX", "App", "Find people nearby who are free to meet now.", "meetx-landing"],
    ["shubh", "ShubhSandesh", "App", "Festival greetings for shop owners, sent in one tap.", "shubh-app"],
    ["consult", "Consultancy site", "Website", "Visitors book a free call straight into open slots.", "consultancy-home"],
    ["tax", "Tax documents site", "Website", "Clients send forms and files in one place.", "tax-home"],
    ["scent", "Scent Stories", "Website", "A friendly guide to perfume for beginners.", "scent-home"],
  ];
  const list = $("#pick-list"), img = $("#pick-img"), kind = $("#pick-kind"), line = $("#pick-line"), link = $("#pick-link");
  work.forEach(([id, name, k], i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "tab"); b.id = `tab-${id}`;
    b.innerHTML = `<span>${name}</span><small>${k}</small>`;
    b.addEventListener("click", () => pick(i));
    b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") pick(i); });
    list.appendChild(b);
  });
  work.forEach(([, , , , shot]) => { const im = new Image(); im.src = `work/device/${shot}-desktop.jpg`; });
  let current = -1, swapT = null;
  const pick = (i) => {
    if (i === current) return;
    current = i;
    const [id, name, k, l, shot] = work[i];
    $$("button", list).forEach((b, j) => b.setAttribute("aria-selected", j === i));
    kind.textContent = k; line.textContent = l; link.href = `work/#${id}`;
    link.setAttribute("aria-label", `View the ${name} case study`);
    img.classList.add("swap");
    clearTimeout(swapT);
    swapT = setTimeout(() => { img.src = `work/device/${shot}-desktop.jpg`; img.alt = `${name} screenshot`; img.onload = () => img.classList.remove("swap"); }, 180);
  };
  pick(0);

  /* ---------- fade-in as sections arrive ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  $$(".reveal").forEach((n) => io.observe(n));

  /* ---------- menu ---------- */
  const burger = $(".burger"), menu = $("#menu");
  const setMenu = (open) => { burger.setAttribute("aria-expanded", open); menu.hidden = !open; document.body.style.overflow = open ? "hidden" : ""; nav.classList.toggle("menu-open", open); };
  burger.addEventListener("click", () => setMenu(menu.hidden));
  $$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ---------- contact form ---------- */
  const form = $("#ask"), q = $("#q"), em = $("#em"), note = $("#note"), send = $(".send", form);
  $$(".picks button").forEach((b) => b.addEventListener("click", () => $$(".picks button").forEach((x) => x.classList.toggle("on", x === b))));
  const say = (text, err) => { note.textContent = text; note.classList.toggle("err", !!err); };
  const saveLead = (data) => {
    const endpoint = (($('meta[name="sheet-endpoint"]') || {}).content || "").trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(endpoint)) return false;
    const body = new URLSearchParams({ ...data, page: location.href.split("#")[0], ref: document.referrer || "", device: `${/Mobi|Android|iPhone/i.test(navigator.userAgent) ? "phone" : "desktop"} · ${innerWidth}×${innerHeight}`, lang: navigator.language || "" });
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return true;
      fetch(endpoint, { method: "POST", mode: "no-cors", body, keepalive: true }).catch(() => {});
      return true;
    } catch (_) { return false; }
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const idea = q.value.trim(), mail = em.value.trim();
    const badIdea = !idea, badMail = !/^\S+@\S+\.\S+$/.test(mail);
    q.closest(".field").classList.toggle("bad", badIdea);
    em.closest(".field").classList.toggle("bad", badMail);
    if (badIdea || badMail) { say(badIdea ? "Please tell us a little about the project." : "Please check your email address.", true); (badIdea ? q : em).focus(); return; }
    if ($("#hp-company").value) return;
    const pickTxt = ($(".picks button.on") || {}).textContent || "";
    send.disabled = true;
    if (saveLead({ project: idea, email: mail, pick: pickTxt, source: "studio contact form" })) {
      say("Thanks, we've got it. We'll reply within one working day.");
      form.reset();
    } else {
      const text = `Hi, I found Root Directory's website. I need help with: ${pickTxt}.\n\n${idea}\n\nMy email: ${mail}`;
      say("Opening WhatsApp so you can send this to us.");
      location.href = `https://wa.me/917777016553?text=${encodeURIComponent(text)}`;
    }
    setTimeout(() => (send.disabled = false), 3000);
  });

  /* ---------- layout ---------- */
  let lastW = 0;
  const layout = (force) => {
    if (!force && innerWidth === lastW) return; // phones fire height-only resizes as the address bar moves
    lastW = innerWidth; buildRoot(); kick();
  };
  addEventListener("resize", () => layout(false));
  addEventListener("load", () => layout(true));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout(true));
  layout(true);
  if (reduce) frame();
})();
