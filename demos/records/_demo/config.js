/* Sample data and server functions for the records demo (loaded before supabase-shim.js) */
(function () {
  var ADMIN = { id: "u-admin", email: "admin@example.com", user_metadata: { full_name: "Demo Admin" } };
  function seed() {
    var now = Date.now(), min = 60000, iso = function (t) { return new Date(t).toISOString(); }, F = {};
    var mods = [["walkins", "Walk-ins", "Admissions, enquiries, and walk-in records."], ["teachers", "Teachers", "Teacher and faculty records."], ["students", "Students", "Student and admission records."], ["staff", "Staff", "Staff and employee records."], ["visitors", "Visitors", "Visitor and front-desk records."]];
    F.modules = mods.map(function (m) { return { id: "mod-" + m[0], slug: m[0], name: m[1], description: m[2], is_active: true, created_at: iso(now - 30 * 864e5), updated_at: iso(now - 864e5), created_by: ADMIN.id, updated_by: ADMIN.id }; });
    var fields = {
      teachers: [["name", "Full name", "text"], ["phone", "Phone", "phone"], ["department", "Department", "text"], ["qualification", "Qualification", "text"], ["post", "Post", "text"], ["status", "Status", "select", ["Active", "On Leave", "Inactive"]]],
      students: [["name", "Full name", "text"], ["phone", "Phone", "phone"], ["course", "Course", "text"], ["year", "Year", "text"], ["qualification", "Qualification", "text"], ["status", "Status", "select", ["Enrolled", "Alumni", "Suspended", "Pending"]]],
      staff: [["name", "Full name", "text"], ["phone", "Phone", "phone"], ["department", "Department", "text"], ["post", "Post", "text"], ["status", "Status", "select", ["Active", "On Leave", "Inactive"]]],
      visitors: [["name", "Full name", "text"], ["phone", "Phone", "phone"], ["purpose", "Purpose", "text"], ["hostDept", "Host department", "text"], ["status", "Status", "select", ["Checked In", "Checked Out", "Expected"]]],
      walkins: [["name", "Full name", "text"], ["phone", "Phone", "phone"], ["date", "Date", "date"], ["qualification", "Qualification", "text"], ["post", "Post applied", "text"], ["remarks", "Remarks", "textarea"]]
    };
    F.module_fields = [];
    Object.keys(fields).forEach(function (slug) { fields[slug].forEach(function (f, i) { F.module_fields.push({ id: "f-" + slug + "-" + f[0], module_id: "mod-" + slug, field_key: f[0], label: f[1], field_type: f[2], is_required: i === 0, is_searchable: true, is_filterable: true, options: f[3] || [], display_order: i + 1, is_active: true, created_at: iso(now - 30 * 864e5), updated_at: iso(now - 30 * 864e5) }); }); });
    var n = 0; function rec(slug, data) { n++; return { id: ({ students: "STU", teachers: "TCH", staff: "STF", visitors: "VIS" })[slug] + "-" + (1000 + n), module_id: "mod-" + slug, data: data, created_by: ADMIN.id, updated_by: ADMIN.id, created_at: iso(now - n * 36e5), updated_at: iso(now - n * 18e5), deleted_at: null }; }
    var ph = function (p, i) { return "90000" + p + String(i).padStart(3, "0"); };
    F.records = []
      .concat([["Ananya Singh", "B.Sc. Computer Science", "2", "Enrolled"], ["Dev Malhotra", "B.Com", "3", "Enrolled"], ["Pooja Chauhan", "BBA", "1", "Pending"], ["Arjun Patel", "B.Tech (IT)", "4", "Enrolled"], ["Kavya Menon", "M.Com", "2", "Alumni"], ["Yash Agarwal", "BBA", "2", "Suspended"], ["Riya Kapoor", "B.Sc. Physics", "1", "Enrolled"], ["Nikhil Joshi", "B.Com", "1", "Pending"], ["Sneha Iyer", "BCA", "3", "Enrolled"], ["Aditya Rao", "B.Tech (CS)", "2", "Enrolled"]].map(function (x, i) { return rec("students", { name: x[0], phone: ph("02", i), course: x[1], year: x[2], qualification: "HSC", status: x[3] }); }))
      .concat([["Dr. Anita Kapoor", "Physics", "Ph.D.", "Professor", "Active"], ["Rajesh Menon", "Mathematics", "M.Sc., B.Ed", "Senior Lecturer", "Active"], ["Sunita Pillai", "Commerce", "M.Com, NET", "Lecturer", "On Leave"], ["Farhan Qureshi", "Computer Science", "M.Tech", "Assistant Professor", "Active"]].map(function (x, i) { return rec("teachers", { name: x[0], phone: ph("01", i), department: x[1], qualification: x[2], post: x[3], status: x[4] }); }))
      .concat([["Gopal Nambiar", "Administration", "Office Manager", "Active"], ["Rekha Sawant", "Accounts", "Accountant", "Active"], ["Imran Sheikh", "IT", "Network Technician", "Active"]].map(function (x, i) { return rec("staff", { name: x[0], phone: ph("03", i), department: x[1], post: x[2], status: x[3] }); }))
      .concat([["Neha Trivedi", "Admission enquiry", "Admissions", "Checked Out"], ["Harish Bajaj", "Vendor meeting", "Accounts", "Checked In"], ["Zoya Ansari", "Interview", "HR", "Expected"]].map(function (x, i) { return rec("visitors", { name: x[0], phone: ph("04", i), purpose: x[1], hostDept: x[2], status: x[3] }); }));
    F.walkins = [["Aarav Mehta", "B.Com", "Accounts Assistant", "Called for second round"], ["Diya Nair", "MBA (HR)", "HR Executive", "Waiting list"], ["Kabir Rao", "B.Tech (CS)", "Lab Assistant", "Selected"], ["Isha Kulkarni", "M.Sc. Physics", "Lecturer", "Demo lecture pending"]]
      .map(function (x, i) { return { id: "w" + i, full_name: x[0], phone: "900000000" + i, qualification: x[1], post_applied_for: x[2], remarks: x[3], record_month: "2026-10-01", legacy_serial_no: i + 1, date_of_birth: null, address: "", constituency: "", test_marks_raw: "", created_at: iso(now - i * 36e5), updated_at: iso(now - i * 36e5), deleted_at: null, created_by: ADMIN.id, walkin_sensitive: null }; });
    F.roles = [{ id: "00000000-0000-0000-0000-000000000001", name: "ADMIN", description: "Full system access." }, { id: "00000000-0000-0000-0000-000000000002", name: "EDITOR", description: "Create and update records." }, { id: "00000000-0000-0000-0000-000000000003", name: "VIEWER", description: "Read-only access." }];
    F.profiles = [{ id: ADMIN.id, email: ADMIN.email, full_name: "Demo Admin", is_active: true, created_at: iso(now - 30 * 864e5), updated_at: iso(now - 864e5) },
      { id: "u-ed", email: "editor@example.com", full_name: "Priya Editor", is_active: true, created_at: iso(now - 20 * 864e5), updated_at: iso(now - 864e5) },
      { id: "u-vw", email: "viewer@example.com", full_name: "Sam Viewer", is_active: true, created_at: iso(now - 10 * 864e5), updated_at: iso(now - 864e5) }];
    F.user_roles = [{ id: "ur1", profile_id: ADMIN.id, role_id: F.roles[0].id }, { id: "ur2", profile_id: "u-ed", role_id: F.roles[1].id }, { id: "ur3", profile_id: "u-vw", role_id: F.roles[2].id }];
    F.audit_logs = [["create", "records", "Created a student record"], ["update", "records", "Updated a teacher record"], ["import", "import_jobs", "Imported 120 visitor rows"], ["export", "records", "Exported students to CSV"]]
      .map(function (a, i) { return { id: "a" + i, actor_id: ADMIN.id, action: a[0], resource_type: a[1], resource_id: "r" + (i + 1), metadata: { note: a[2] }, created_at: iso(now - (i + 1) * 25 * min) }; });
    F.import_jobs = [{ id: "job1", module_slug: "visitors", file_name: "visitors-october.csv", file_type: "csv", status: "completed", total_rows: 120, valid_rows: 120, invalid_rows: 0, created_by: ADMIN.id, created_at: iso(now - 3 * 864e5), updated_at: iso(now - 3 * 864e5) }];
    F.permissions = []; F.role_permissions = [];
    return F;
  }
  function audit(db, action, type, id, meta) { db.audit_logs.push({ id: "a" + Date.now() + Math.random().toString(36).slice(2, 5), actor_id: ADMIN.id, action: action, resource_type: type, resource_id: id, metadata: meta || {}, created_at: new Date().toISOString() }); }
  window.DEMO_DB = {
    name: "records", host: "demo.supabase.co", user: ADMIN, password: "demo", seed: seed,
    fk: { audit_logs: { actor_id: "profiles" } },
    insert: {
      records: function (row, db) { row.deleted_at = null; row.updated_at = row.created_at; audit(db, "create", "records", row.id); return row; },
      profiles: function (row) { if (row.is_active === undefined) row.is_active = true; return row; }
    },
    rpc: {
      get_my_role: "ADMIN", has_permission: true,
      log_audit_event: function (a, db) { audit(db, a.p_action || "event", a.p_resource_type || "auth", a.p_resource_id || null, a.p_metadata); return null; },
      create_dynamic_module: function (a, db) {
        var id = "mod-" + a.p_slug, t = new Date().toISOString();
        db.modules.push({ id: id, slug: a.p_slug, name: a.p_name, description: a.p_description, is_active: true, created_at: t, updated_at: t, created_by: ADMIN.id, updated_by: ADMIN.id });
        (a.p_fields || []).forEach(function (f, i) { db.module_fields.push({ id: id + "-" + (f.fieldKey || f.field_key), module_id: id, field_key: f.fieldKey || f.field_key, label: f.label, field_type: f.fieldType || f.field_type || "text", is_required: !!(f.isRequired || f.is_required), is_searchable: f.isSearchable !== false, is_filterable: f.isFilterable !== false, options: f.options || [], display_order: f.displayOrder || f.display_order || i + 1, is_active: true, created_at: t, updated_at: t }); });
        audit(db, "create", "modules", id); return id;
      },
      archive_dynamic_record: function (a, db) { var r = db.records.find(function (x) { return x.id === a.p_record_id && !x.deleted_at; }); if (!r) return false; r.deleted_at = new Date().toISOString(); audit(db, "archive", "records", r.id); return true; },
      import_dynamic_records: function (a, db) {
        var m = db.modules.find(function (x) { return x.slug === a.p_module_slug; }), t = new Date().toISOString(), job = "job" + Date.now(), rows = a.p_rows || [];
        rows.forEach(function (d, i) { db.records.push({ id: job + "-" + i, module_id: m ? m.id : null, data: d, created_by: ADMIN.id, updated_by: ADMIN.id, created_at: t, updated_at: t, deleted_at: null }); });
        db.import_jobs.push({ id: job, module_slug: a.p_module_slug, file_name: a.p_file_name, file_type: a.p_file_type, status: "completed", total_rows: rows.length, valid_rows: rows.length, invalid_rows: 0, created_by: ADMIN.id, created_at: t, updated_at: t });
        audit(db, "import", "import_jobs", job, { rows: rows.length });
        return { jobId: job, importedRows: rows.length, invalidRows: 0, duplicateRows: 0 };
      }
    }
  };
})();
