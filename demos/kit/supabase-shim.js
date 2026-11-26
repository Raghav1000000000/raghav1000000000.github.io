/* In-browser stand-in for Supabase (REST, Auth, Realtime) used by the portfolio demos.
   The app keeps its real supabase-js code; requests to the demo host are answered here from sample data in localStorage.
   Config (set before this script): window.DEMO_DB = {
     name, host: "demo.supabase.co", seed: () => ({ table: [rows] }),
     insert: { table: (row, db) => row },   // fill defaults on insert
     rpc: { fn: (args, db, user) => value },
     user: { id, email, ... }                // signed-in demo user (Auth)
   } */
(function () {
  var C = window.DEMO_DB || {}, HOST = C.host || "demo.supabase.co", KEY = "demo-db-" + (C.name || "app");
  var bc = "BroadcastChannel" in window ? new BroadcastChannel(KEY) : null;

  /* ---------- storage ---------- */
  function load() { try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.__v === 1) return d; } catch (e) {} var s = C.seed ? C.seed() : {}; s.__v = 1; save(s); return s; }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function uuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }); }

  /* ---------- select parsing: "*, order_items(id, menu_items(name)), alias:table!hint(cols)" ---------- */
  function splitTop(s) { var out = [], depth = 0, cur = ""; for (var i = 0; i < s.length; i++) { var ch = s[i]; if (ch === "(") depth++; if (ch === ")") depth--; if (ch === "," && depth === 0) { out.push(cur); cur = ""; } else cur += ch; } if (cur.trim()) out.push(cur); return out.map(function (x) { return x.trim(); }).filter(Boolean); }
  function parseSelect(s) {
    return splitTop((s || "*").replace(/\s+/g, " ")).map(function (item) {
      var m = item.match(/^(?:([\w]+):)?([\w]+)(?:!([\w]+))?(?:!inner)?\s*\((.*)\)$/);
      if (m) return { embed: true, alias: m[1] || m[2], rel: m[2], hint: m[3], sub: parseSelect(m[4]) };
      var c = item.replace(/::\w+/g, ""), a = c.match(/^([\w]+):(.+)$/), alias = a ? a[1] : null, col = a ? a[2] : c;
      return { col: col.trim(), alias: alias };
    });
  }
  var singular = function (t) { return t.replace(/ies$/, "y").replace(/s$/, ""); };
  function getPath(row, col) { var parts = col.split(/->>?/); var v = row[parts[0]]; for (var i = 1; i < parts.length; i++) { if (v == null) return v; v = v[parts[i].replace(/'/g, "")]; } return v; }
  function embed(db, table, row, e) {
    // table to embed: rel itself, or a key column mapped in C.fk (e.g. profiles:actor_id(...)), or the !hint
    var fk = (C.fk && C.fk[table]) || {};
    var tname = db[e.rel] ? e.rel : fk[e.rel] || (e.hint && db[e.hint] ? e.hint : null);
    if (!tname) return null;
    var target = db[tname];
    // many-to-one: this row holds the key
    var keys = [e.hint, db[e.rel] ? null : e.rel, singular(tname) + "_id"].filter(Boolean);
    for (var i = 0; i < keys.length; i++) {
      if (Object.prototype.hasOwnProperty.call(row, keys[i])) {
        var parent = target.find(function (r) { return r.id === row[keys[i]]; });
        return parent ? shape(db, tname, parent, e.sub) : null;
      }
    }
    // one-to-many: rows in the other table point at this one
    var ck = e.hint && target.some(function (r) { return Object.prototype.hasOwnProperty.call(r, e.hint); }) ? e.hint : singular(table) + "_id";
    return target.filter(function (r) { return r[ck] === row.id; }).map(function (r) { return shape(db, tname, r, e.sub); });
  }
  function shape(db, table, row, sel) {
    var out = {};
    sel.forEach(function (f) {
      if (f.embed) { out[f.alias] = embed(db, table, row, f); return; }
      if (f.col === "*") { for (var k in row) out[k] = row[k]; return; }
      out[f.alias || f.col.split(/->>?/).pop().replace(/'/g, "")] = getPath(row, f.col);
    });
    return out;
  }

  /* ---------- filters ---------- */
  function cmp(v, op, val) {
    var s = v == null ? null : String(v), n = Number(val), isNum = val !== "" && !isNaN(n) && typeof v === "number";
    switch (op) {
      case "eq": return s === val || (typeof v === "boolean" && String(v) === val);
      case "neq": return s !== val;
      case "gt": return isNum ? v > n : s > val; case "gte": return isNum ? v >= n : s >= val;
      case "lt": return isNum ? v < n : s < val; case "lte": return isNum ? v <= n : s <= val;
      case "is": return val === "null" ? v == null : String(v) === val;
      case "in": var set = val.replace(/^\(|\)$/g, "").split(",").map(function (x) { return x.replace(/^"|"$/g, ""); }); return set.indexOf(s) >= 0;
      case "like": case "ilike": if (s == null) return false; var re = new RegExp("^" + val.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/[*%]/g, ".*") + "$", op === "ilike" ? "i" : ""); return re.test(s);
      case "cs": try { var want = JSON.parse(val.replace(/^\{(.*)\}$/, "[$1]")); return [].concat(want).every(function (w) { return (v || []).indexOf(w) >= 0; }); } catch (e) { return true; }
      default: return true;
    }
  }
  function test(row, key, expr) {
    var neg = false; if (expr.indexOf("not.") === 0) { neg = true; expr = expr.slice(4); }
    var i = expr.indexOf("."), op = expr.slice(0, i), val = expr.slice(i + 1);
    var r = cmp(getPath(row, key), op, val); return neg ? !r : r;
  }
  function testGroup(row, body, any) { // or=(a.eq.1,b.ilike.*x*)
    var parts = splitTop(body.replace(/^\(|\)$/g, ""));
    var res = parts.map(function (p) {
      var g = p.match(/^(or|and)\((.*)\)$/); if (g) return testGroup(row, g[2], g[1] === "or");
      var j = p.indexOf("."); return test(row, p.slice(0, j), p.slice(j + 1));
    });
    return any ? res.some(Boolean) : res.every(Boolean);
  }
  function applyFilters(rows, params) {
    return rows.filter(function (r) {
      var ok = true;
      params.forEach(function (v, k) {
        if (!ok || ["select", "order", "limit", "offset", "on_conflict", "columns"].indexOf(k) >= 0) return;
        if (k === "or" || k === "and") { ok = testGroup(r, v, k === "or"); return; }
        if (k.indexOf(".") >= 0 && k.indexOf("->") < 0) return; // filter on an embedded table: ignored in the demo
        ok = test(r, k, v);
      });
      return ok;
    });
  }
  function applyOrder(rows, order) {
    if (!order) return rows;
    var keys = order.split(",").map(function (o) { var p = o.split("."); return { k: p[0], desc: p[1] === "desc", nf: p.indexOf("nullsfirst") >= 0 }; });
    return rows.slice().sort(function (a, b) {
      for (var i = 0; i < keys.length; i++) { var x = getPath(a, keys[i].k), y = getPath(b, keys[i].k); if (x === y) continue; if (x == null) return keys[i].nf ? -1 : 1; if (y == null) return keys[i].nf ? 1 : -1; var c = x > y ? 1 : -1; return keys[i].desc ? -c : c; }
      return 0;
    });
  }

  /* ---------- realtime ---------- */
  var sockets = [];
  function emitChange(table, type, record, old, local) {
    var ts = new Date().toISOString();
    sockets.forEach(function (s) { s._change(table, type, record, old, ts); });
    if (local && bc) bc.postMessage({ table: table, type: type, record: record, old: old });
  }
  if (bc) bc.onmessage = function (e) { var m = e.data; emitChange(m.table, m.type, m.record, m.old, false); };

  function FakeSocket(url) {
    var self = this; this.url = url; this.readyState = 0; this.binaryType = "arraybuffer"; this._subs = {}; sockets.push(this);
    setTimeout(function () { self.readyState = 1; self.onopen && self.onopen({}); }, 30);
  }
  FakeSocket.CONNECTING = 0; FakeSocket.OPEN = 1; FakeSocket.CLOSING = 2; FakeSocket.CLOSED = 3;
  FakeSocket.prototype._send = function (arr) { var self = this; setTimeout(function () { self.onmessage && self.onmessage({ data: JSON.stringify(arr) }); }, 5); };
  FakeSocket.prototype.send = function (raw) {
    var m; try { m = JSON.parse(raw); } catch (e) { return; }
    var join_ref = m[0], ref = m[1], topic = m[2], event = m[3], payload = m[4] || {};
    if (event === "phx_join") {
      var pcs = ((payload.config || {}).postgres_changes || []).map(function (p, i) { return { id: Math.floor(Math.random() * 1e9), event: p.event, schema: p.schema, table: p.table, filter: p.filter }; });
      this._subs[topic] = { join_ref: join_ref, pcs: pcs };
      this._send([join_ref, ref, topic, "phx_reply", { status: "ok", response: { postgres_changes: pcs } }]);
    } else if (event === "phx_leave") { delete this._subs[topic]; this._send([join_ref, ref, topic, "phx_reply", { status: "ok", response: {} }]); }
    else this._send([join_ref, ref, topic, "phx_reply", { status: "ok", response: {} }]); // heartbeat, access_token
  };
  FakeSocket.prototype._change = function (table, type, record, old, ts) {
    for (var topic in this._subs) {
      var s = this._subs[topic], ids = s.pcs.filter(function (p) {
        if (p.table && p.table !== "*" && p.table !== table) return false;
        if (p.event && p.event !== "*" && p.event !== type) return false;
        if (p.filter) { var f = p.filter.match(/^(\w+)=(\w+)\.(.*)$/); if (f && !cmp((record || old || {})[f[1]], f[2], f[3])) return false; }
        return true;
      }).map(function (p) { return p.id; });
      if (ids.length) this._send([s.join_ref, null, topic, "postgres_changes", { ids: ids, data: { schema: "public", table: table, commit_timestamp: ts, type: type, record: record || {}, old_record: old || {}, columns: [], errors: null } }]);
    }
  };
  FakeSocket.prototype.close = function () { this.readyState = 3; sockets = sockets.filter(function (x) { return x !== this; }, this); this.onclose && this.onclose({ code: 1000 }); };
  var RealWS = window.WebSocket;
  window.WebSocket = function (url, proto) { return String(url).indexOf(HOST) >= 0 ? new FakeSocket(url) : new RealWS(url, proto); };
  ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (k) { window.WebSocket[k] = RealWS[k]; });

  /* ---------- auth ---------- */
  var b64 = function (o) { return btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_"); };
  function session() {
    var u = C.user || { id: "demo-user", email: "demo@example.com" }, now = Math.floor(Date.now() / 1000);
    var user = Object.assign({ aud: "authenticated", role: "authenticated", app_metadata: { provider: "email" }, user_metadata: {}, created_at: new Date().toISOString() }, u);
    return { access_token: b64({ alg: "HS256", typ: "JWT" }) + "." + b64({ sub: user.id, email: user.email, role: "authenticated", aud: "authenticated", exp: now + 864000, iat: now }) + ".demo", refresh_token: "demo-refresh", token_type: "bearer", expires_in: 864000, expires_at: now + 864000, user: user };
  }

  /* ---------- REST ---------- */
  function reply(status, body, headers) {
    var h = new Headers(Object.assign({ "Content-Type": "application/json" }, headers || {}));
    return Promise.resolve(new Response(status === 204 || body === undefined ? null : JSON.stringify(body), { status: status, headers: h }));
  }
  function header(init, req, name) {
    var h = (init && init.headers) || (req && req.headers) || {};
    if (h instanceof Headers) return h.get(name) || "";
    for (var k in h) if (k.toLowerCase() === name.toLowerCase()) return h[k];
    return "";
  }
  function handle(url, init, req) {
    var method = ((init && init.method) || (req && req.method) || "GET").toUpperCase(), path = url.pathname, p = url.searchParams;
    var rawBody = init && init.body; var body = null;
    if (typeof rawBody === "string") { try { body = JSON.parse(rawBody); } catch (e) { body = rawBody; } }
    if (path.indexOf("/auth/v1/") === 0) {
      if (path.indexOf("/auth/v1/token") === 0 || path.indexOf("/auth/v1/signup") === 0) {
        if (C.password && body && body.password !== undefined && body.password !== C.password) return reply(400, { error: "invalid_grant", error_description: "Invalid login credentials", msg: "Invalid login credentials. In this demo the password is: " + C.password, code: 400 });
        return reply(200, session());
      }
      if (path === "/auth/v1/user") return reply(200, session().user);
      if (path.indexOf("/auth/v1/logout") === 0) return reply(204);
      return reply(200, {});
    }
    if (path.indexOf("/storage/v1/") === 0) return reply(200, { Key: "demo/" + Date.now(), path: "demo/" + Date.now() });
    if (path.indexOf("/functions/v1/") === 0) return reply(200, { ok: true, demo: true });
    var db = load(), rpc = path.match(/^\/rest\/v1\/rpc\/(\w+)/);
    if (rpc) { var fn = (C.rpc || {})[rpc[1]]; var val = typeof fn === "function" ? fn(body || {}, db, session().user) : (fn === undefined ? null : fn); save(db); return reply(200, val); }
    var t = path.match(/^\/rest\/v1\/(\w+)/); if (!t) return reply(404, { message: "Not in the demo: " + path });
    var table = t[1]; if (!db[table]) db[table] = [];
    var prefer = header(init, req, "Prefer"), accept = header(init, req, "Accept"), single = /vnd\.pgrst\.object/.test(accept);
    var sel = parseSelect(p.get("select") || "*"), wantRows = /return=representation/.test(prefer) || method === "GET" || method === "HEAD";
    var result;
    if (method === "GET" || method === "HEAD") {
      var rows = applyOrder(applyFilters(db[table], p), p.get("order")), total = rows.length;
      var off = Number(p.get("offset") || 0), lim = p.get("limit"); rows = rows.slice(off, lim ? off + Number(lim) : undefined);
      result = rows.map(function (r) { return shape(db, table, r, sel); });
      var range = { "Content-Range": (rows.length ? off + "-" + (off + rows.length - 1) : "*") + "/" + total };
      if (method === "HEAD") return reply(200, undefined, range);
      if (single) return result[0] ? reply(200, result[0], range) : reply(406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: "The result contains 0 rows" });
      if (/maybeSingle|vnd\.pgrst\.object/.test(accept)) return reply(200, result[0] || null, range);
      return reply(200, result, range);
    }
    if (method === "POST") {
      var list = [].concat(body || []), merge = /merge-duplicates/.test(prefer), conflict = (p.get("on_conflict") || "id").split(",");
      var out = list.map(function (r) {
        var row = Object.assign({}, r);
        var hit = merge ? db[table].find(function (x) { return conflict.every(function (k) { return x[k] === row[k]; }); }) : null;
        if (hit) { var old = Object.assign({}, hit); Object.assign(hit, row); if ("updated_at" in hit) hit.updated_at = new Date().toISOString(); emitChange(table, "UPDATE", hit, old, true); return hit; }
        if (row.id === undefined) row.id = uuid();
        if (row.created_at === undefined) row.created_at = new Date().toISOString();
        if (C.insert && C.insert[table]) row = C.insert[table](row, db) || row;
        db[table].push(row); emitChange(table, "INSERT", row, null, true); return row;
      });
      save(db);
      result = out.map(function (r) { return shape(db, table, r, sel); });
      if (!wantRows) return reply(201, undefined);
      return single ? reply(201, result[0]) : reply(201, result);
    }
    if (method === "PATCH") {
      var hits = applyFilters(db[table], p);
      hits.forEach(function (h) { var old = Object.assign({}, h); Object.assign(h, body || {}); if ("updated_at" in h && !(body && body.updated_at)) h.updated_at = new Date().toISOString(); emitChange(table, "UPDATE", h, old, true); });
      save(db); result = hits.map(function (r) { return shape(db, table, r, sel); });
      if (!wantRows) return reply(204);
      return single ? (result[0] ? reply(200, result[0]) : reply(406, { code: "PGRST116", message: "no rows" })) : reply(200, result);
    }
    if (method === "DELETE") {
      var gone = applyFilters(db[table], p);
      db[table] = db[table].filter(function (r) { return gone.indexOf(r) < 0; });
      gone.forEach(function (g) { emitChange(table, "DELETE", null, g, true); });
      save(db); result = gone.map(function (r) { return shape(db, table, r, sel); });
      return wantRows ? reply(200, single ? result[0] : result) : reply(204);
    }
    return reply(405, { message: "Method not in the demo" });
  }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var req = typeof input === "object" && input && "url" in input ? input : null;
    var url = new URL(req ? req.url : String(input), location.href);
    if (url.host === HOST) {
      if (req && !init) { return req.clone().text().then(function (txt) { return handle(url, { method: req.method, headers: req.headers, body: txt || undefined }, req); }); }
      return handle(url, init, req);
    }
    if (C.routes) { for (var k in C.routes) { if (url.pathname.slice(-k.length) === k) { var b = null; try { b = JSON.parse((init && init.body) || "null"); } catch (e) {} var r = C.routes[k](b, url, init); return reply(r[0], r[1]); } } }
    return realFetch(input, init);
  };
  window.__demoDb = { load: load, save: save, key: KEY };
})();
