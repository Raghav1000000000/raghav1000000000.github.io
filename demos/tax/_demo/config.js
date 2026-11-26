/* Sample data for the tax practice demo (loaded before supabase-shim.js) */
(function () {
  function seed() {
    var now = Date.now(), day = 864e5, iso = function (t) { return new Date(t).toISOString(); };
    var tr = function (id, name, email, phone, prov, year, emp, ready, help, notes, ago) { return { id: id, name: name, email: email, phone: phone, province: prov, tax_year: year, employment_status: emp, documents_ready: ready, support_needed: help, notes: notes, uploaded_file_urls: null, created_at: iso(now - ago * day) }; };
    return {
      tax_requests: [
        tr("t1", "Alex Martin", "alex.martin@example.com", "555-0101", "Ontario", "2025", "Employed", true, false, "One T4, RRSP receipt.", 1),
        tr("t2", "Priya Shah", "priya.shah@example.com", "555-0102", "British Columbia", "2025", "Self-employed", false, true, "First year freelancing, needs help with expenses.", 3),
        tr("t3", "Sam Chen", "sam.chen@example.com", "555-0103", "Alberta", "2024", "Student", true, false, "Tuition credits (T2202).", 6),
        tr("t4", "Maria Lopez", "maria.lopez@example.com", "555-0104", "Quebec", "2025", "Other", false, true, "Moved provinces mid-year.", 9)],
      contacts: [
        { id: "c1", name: "Jordan Lee", email: "jordan.lee@example.com", phone: "555-0105", message: "Do you file for newcomers to Canada?", created_at: iso(now - 2 * day) },
        { id: "c2", name: "Nina Patel", email: "nina.patel@example.com", phone: null, message: "What documents should I bring?", created_at: iso(now - 5 * day) }],
      client_consents: [
        { id: "k1", client_name: "Alex Martin", client_email: "alex.martin@example.com", client_phone: "555-0101", consent_date: iso(now - day).slice(0, 10), signature_data: null, signature_photo_url: null, signature_type: "draw", consent_type: "tax_service_agreement", deleted_at: null, created_at: iso(now - 1 * day) },
        { id: "k2", client_name: "Sam Chen", client_email: "sam.chen@example.com", client_phone: "555-0103", consent_date: iso(now - 6 * day).slice(0, 10), signature_data: null, signature_photo_url: null, signature_type: "upload", consent_type: "tax_service_agreement", deleted_at: null, created_at: iso(now - 6 * day) }],
      analytics_events: []
    };
  }
  function within(rows, ms) { var t = Date.now() - ms; return rows.filter(function (r) { return !r.deleted_at && new Date(r.created_at).getTime() >= t; }).length; }
  window.DEMO_DB = {
    name: "tax", host: "demo.supabase.co", seed: seed,
    insert: { client_consents: function (r) { if (r.deleted_at === undefined) r.deleted_at = null; return r; } },
    rpc: {
      get_consent_statistics: function (a, db) { var c = db.client_consents.filter(function (r) { return !r.deleted_at; }); return [{ total_consents: c.length, consents_today: within(c, 864e5), consents_this_week: within(c, 7 * 864e5), consents_this_month: within(c, 30 * 864e5), signature_types: { draw: c.filter(function (r) { return r.signature_type === "draw"; }).length, upload: c.filter(function (r) { return r.signature_type === "upload"; }).length } }]; }
    },
    routes: {
      "/api/contact": function (b) { var db = window.__demoDb.load(); db.contacts.push({ id: "c" + Date.now(), name: b && b.name, email: b && b.email, phone: (b && b.phone) || null, message: b && b.message, created_at: new Date().toISOString() }); window.__demoDb.save(db); return [200, { success: true, message: "Message received (demo: saved only in your browser)." }]; },
      "/api/analytics": function (b, url, init) {
        var db = window.__demoDb.load(), ev = db.analytics_events || [];
        if (init && init.method === "POST") { ev.push({ t: Date.now(), type: b && b.eventType, s: b && b.sessionId }); db.analytics_events = ev.slice(-500); window.__demoDb.save(db); return [200, { success: true }]; }
        return [200, { data: { total_page_views: ev.filter(function (e) { return e.type === "page_view"; }).length, total_clicks: ev.filter(function (e) { return e.type === "click"; }).length, total_form_submits: ev.filter(function (e) { return e.type === "form_submit"; }).length, unique_sessions: 1 } }];
      },
      "/api/admin/consent-pdf": function () { return [404, { error: "Consent PDFs aren't generated in the demo." }]; }
    }
  };
})();
