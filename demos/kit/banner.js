/* Demo banner shared by every portfolio demo.
   Set window.DEMO = { app, about, hints:[...], pages:[[label, href]], back, keys:[localStorage keys], side:"left"|"right" } before loading. */
(function () {
  var C = window.DEMO || {};
  function el(tag, attrs, kids) { var e = document.createElement(tag); for (var k in attrs || {}) { if (k === "text") e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); } (kids || []).forEach(function (c) { e.appendChild(c); }); return e; }
  function mount() {
    if (document.getElementById("rm-demo")) return;
    var host = el("div", { id: "rm-demo" }); document.body.appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    var side = C.side === "right" ? "right" : "left";
    root.appendChild(el("style", { text:
      ":host{all:initial}" +
      ".pill,.card{position:fixed;" + side + ":12px;bottom:" + (12 + (C.lift || 0)) + "px;z-index:2147483646;font:600 12px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}" +
      ".pill{display:flex;align-items:center;gap:7px;padding:8px 12px;border-radius:999px;border:1px solid #FF6B33;background:#0B0B0A;color:#F1EEE6;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.35)}" +
      ".dot{width:8px;height:8px;border-radius:50%;background:#FF6B33}" +
      ".card{width:min(340px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;padding:16px;background:#0B0B0A;color:#F1EEE6;border:1px solid #FF6B33;box-shadow:0 10px 40px rgba(0,0,0,.45);font-weight:400}" +
      ".card h2{margin:0 0 6px;font:700 15px/1.3 inherit;font-family:inherit;color:#FF6B33;text-transform:uppercase;letter-spacing:.04em}" +
      ".card p{margin:0 0 10px}.card ul{margin:0 0 12px;padding-left:18px}.card li{margin:3px 0}" +
      ".card b{color:#D7FF3A;font-weight:700}" +
      ".row{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}" +
      "a,button{font:700 12px/1 inherit;font-family:inherit;color:#F1EEE6;background:transparent;border:1px solid #33312C;padding:9px 10px;cursor:pointer;text-decoration:none;display:inline-block}" +
      "a:hover,button:hover{border-color:#F1EEE6}.main{background:#D7FF3A;color:#0B0B0A;border-color:#D7FF3A}" +
      ".x{position:absolute;top:8px;right:8px;border:0;padding:6px 8px;font-size:14px}" +
      ":focus-visible{outline:2px solid #FF6B33;outline-offset:2px}"
    }));
    var pill = el("button", { class: "pill", type: "button", "aria-expanded": "false" }, [el("span", { class: "dot" }), el("span", { text: "Demo of the app" })]);
    var card = el("div", { class: "card", role: "dialog", "aria-label": "About this demo" });
    card.hidden = true;
    var x = el("button", { class: "x", type: "button", "aria-label": "Close", text: "✕" });
    card.appendChild(x);
    card.appendChild(el("h2", { text: "Demo: " + (C.app || "this app") }));
    card.appendChild(el("p", { text: "This is a demo of the app. It runs on sample data, right in your browser. Nothing you type is sent anywhere or seen by anyone else." }));
    if (C.about) card.appendChild(el("p", { text: C.about }));
    if (C.hints && C.hints.length) { var ul = el("ul"); C.hints.forEach(function (h) { var li = el("li"); li.innerHTML = h; ul.appendChild(li); }); card.appendChild(ul); }
    if (C.pages && C.pages.length) { var r1 = el("div", { class: "row" }); C.pages.forEach(function (p) { r1.appendChild(el("a", { href: p[1], text: p[0] })); }); card.appendChild(r1); }
    var r2 = el("div", { class: "row" });
    var reset = el("button", { type: "button", text: "Reset sample data" });
    r2.appendChild(reset);
    r2.appendChild(el("a", { class: "main", href: C.back || "/work/", text: "← Back to the work" }));
    card.appendChild(r2);
    root.appendChild(pill); root.appendChild(card);
    function open(v) { card.hidden = !v; pill.hidden = v; pill.setAttribute("aria-expanded", String(v)); if (v) x.focus(); }
    pill.onclick = function () { open(true); };
    x.onclick = function () { open(false); try { sessionStorage.setItem("rm-demo-seen", "1"); } catch (e) {} };
    reset.onclick = function () {
      try { (C.keys || []).forEach(function (k) { localStorage.removeItem(k); }); Object.keys(localStorage).forEach(function (k) { if (k.indexOf("demo-") === 0) localStorage.removeItem(k); }); } catch (e) {}
      location.reload();
    };
    var seen = false; try { seen = sessionStorage.getItem("rm-demo-seen") === "1"; } catch (e) {}
    open(!seen);
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
  // some apps re-render <body>; put the banner back if it disappears
  setInterval(function () { if (document.body && !document.getElementById("rm-demo")) mount(); }, 1500);
})();
