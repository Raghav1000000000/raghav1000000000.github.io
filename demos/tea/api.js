/* Demo stand-in for the tea app's Express + MongoDB API. Answers /api/* in the browser from sample data kept in localStorage. */
(function () {
  var KEY = "demo-tea", PASS = "demo", min = 60000;
  function seed() {
    var now = Date.now(), b = function (id, name, phone, location, notes, status, ago, eta) { return { id: id, name: name, phone: phone, location: location, customLocation: "", notes: notes, status: status, eta: eta || "", createdAt: new Date(now - ago * min).toISOString(), updatedAt: new Date(now - ago * min).toISOString() }; };
    return {
      bookings: [b("b1", "Aarav", "9000000001", "Office Complex A", "4 cups, less sugar", "pending", 3), b("b2", "Diya", "9000000002", "University Campus", "2 cups", "accepted", 9, "6 min"),
                 b("b3", "Kabir", "9000000003", "Park Street", "1 cup, extra ginger", "accepted", 14, "12 min"), b("b4", "Isha", "9000000004", "Market Square", "", "completed", 40)],
      notifications: [{ id: "n1", message: "Fresh ginger chai is ready!", location: "Office Complex A", createdAt: new Date(now - 20 * min).toISOString() }, { id: "n2", message: "Evening round starts at 5 pm", location: "", createdAt: new Date(now - 90 * min).toISOString() }],
      shop: { isOpen: true }, tokens: []
    };
  }
  function load() { try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.bookings) return d; } catch (e) {} return seed(); }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function json(body, status) { return Promise.resolve(new Response(JSON.stringify(body), { status: status || 200, headers: { "Content-Type": "application/json" } })); }
  var id = function () { return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  function authed(d, init) { var h = (init && init.headers) || {}; var a = h.Authorization || h.authorization || (h.get && h.get("Authorization")) || ""; return d.tokens.indexOf(String(a).replace(/^Bearer /, "")) >= 0; }
  var real = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = new URL(typeof input === "string" ? input : input.url, location.href), m = url.pathname.match(/\/api\/(.*)$/);
    if (!m) return real(input, init);
    var path = m[1], method = ((init && init.method) || "GET").toUpperCase(), body = {};
    try { body = JSON.parse((init && init.body) || "{}"); } catch (e) {}
    var d = load(), res;
    var admin = function () { return authed(d, init); };
    var one = path.match(/^bookings\/([^/]+)$/), note = path.match(/^notifications\/([^/]+)$/);
    if (path === "shop-status" && method === "GET") res = json(d.shop);
    else if (path === "shop-status") { if (!admin()) return json({ success: false, message: "Unauthorized" }, 401); d.shop = { isOpen: !!body.isOpen }; res = json({ success: true, status: d.shop }); }
    else if (path === "my-bookings") { var ph = (url.searchParams.get("phone") || "").trim(); res = json(d.bookings.filter(function (x) { return x.phone === ph; }).map(function (x) { return { id: x.id, status: x.status, location: x.location, customLocation: x.customLocation, notes: x.notes, eta: x.eta, createdAt: x.createdAt }; })); }
    else if (path === "bookings" && method === "GET") { if (!admin()) return json({ success: false, message: "Unauthorized" }, 401); res = json(d.bookings.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); })); }
    else if (path === "bookings" && method === "POST") { var t = new Date().toISOString(), nb = { id: id(), name: String(body.name || ""), phone: String(body.phone || ""), location: String(body.location || ""), customLocation: String(body.customLocation || ""), notes: String(body.notes || ""), status: "pending", eta: "", createdAt: t, updatedAt: t }; d.bookings.push(nb); res = json({ success: true, booking: nb }); }
    else if (one) {
      if (!admin()) return json({ success: false, message: "Unauthorized" }, 401);
      var i = d.bookings.findIndex(function (x) { return x.id === one[1]; });
      if (i < 0) return json({ success: false, message: "Booking not found" }, 404);
      if (method === "DELETE") { d.bookings.splice(i, 1); res = json({ success: true }); }
      else { if (body.status !== undefined) d.bookings[i].status = body.status; if (body.eta !== undefined) d.bookings[i].eta = body.eta; d.bookings[i].updatedAt = new Date().toISOString(); res = json({ success: true, booking: d.bookings[i] }); }
    }
    else if (path === "notifications" && method === "GET") res = json(d.notifications.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 20));
    else if (path === "notifications") { if (!admin()) return json({ success: false }, 401); var nn = { id: id(), message: String(body.message || ""), location: String(body.location || ""), createdAt: new Date().toISOString() }; d.notifications.push(nn); res = json({ success: true, notification: nn }); }
    else if (note) { if (!admin()) return json({ success: false }, 401); var j = d.notifications.findIndex(function (x) { return x.id === note[1]; }); if (j < 0) return json({ success: false }, 404);
      if (method === "DELETE") { d.notifications.splice(j, 1); res = json({ success: true }); } else { if (body.message !== undefined) d.notifications[j].message = body.message; if (body.location !== undefined) d.notifications[j].location = body.location; res = json({ success: true, notification: d.notifications[j] }); } }
    else if (path === "auth/login") { if (body.password !== PASS) return json({ success: false, message: "Invalid password. In this demo it is: demo" }, 401); var tk = id(); d.tokens.push(tk); res = json({ success: true, token: tk }); }
    else if (path === "auth/verify") res = json({ success: d.tokens.indexOf(body.token) >= 0 });
    else if (path === "auth/logout") { d.tokens = d.tokens.filter(function (x) { return x !== body.token; }); res = json({ success: true }); }
    else if (path === "auth/change-password") res = json({ success: false, message: "Changing the password is turned off in the demo." }, 400);
    else if (path === "health") res = json({ status: "ok", database: "demo (in your browser)" });
    else res = json({ success: false, message: "Not in the demo" }, 404);
    save(d); return res;
  };
})();
