/* Sample data and rules for the restaurant demo (loaded before supabase-shim.js) */
window.DEMO_DB = {
  name: "restaurant", host: "demo.supabase.co",
  seed: function () {
    var now = Date.now(), min = 60000, iso = function (t) { return new Date(t).toISOString(); }, n = 0;
    var m = function (name, rupees, category, special) { n++; return { id: "m" + n, name: name, price: rupees * 100, category: category, is_available: true, is_special: !!special, description: "", created_at: iso(now - 864e5) }; };
    var menu = [m("Masala Chai", 30, "Beverages", true), m("Cold Coffee", 90, "Beverages"), m("Lemon Iced Tea", 70, "Beverages"), m("Fresh Lime Soda", 60, "Beverages"),
      m("Paneer Tikka Roll", 140, "Rolls", true), m("Chicken Kathi Roll", 160, "Rolls"), m("Egg Roll", 90, "Rolls"),
      m("Veg Club Sandwich", 120, "Sandwiches"), m("Grilled Cheese Sandwich", 110, "Sandwiches"),
      m("Bun Maska", 50, "Snacks", true), m("Vada Pav", 40, "Snacks"), m("Masala Fries", 80, "Snacks"), m("Samosa (2 pcs)", 40, "Snacks")];
    var byName = {}; menu.forEach(function (x) { byName[x.name] = x; });
    var orders = [], items = [], fb = [];
    function o(num, status, ago, list, name, feedback) {
      var id = "o" + num, total = 0;
      list.forEach(function (l, k) { var mi = byName[l[0]]; total += mi.price * l[1]; items.push({ id: id + "-" + k, order_id: id, menu_item_id: mi.id, quantity: l[1], price_at_time: mi.price, item_name: mi.name, item_price_at_order: mi.price, created_at: iso(now - ago * min) }); });
      orders.push({ id: id, order_number: num, session_id: "sample-" + num, customer_name: name, customer_phone: "90000000" + String(num).slice(-2), status: status, total_amount: total, feedback_given: !!feedback, created_at: iso(now - ago * min), updated_at: iso(now - ago * min) });
      if (feedback) fb.push({ id: "f" + num, order_id: id, rating: feedback[0], comment: feedback[1], created_at: iso(now - (ago - 5) * min) });
    }
    o(41, "PLACED", 1, [["Masala Chai", 2], ["Bun Maska", 2]], "Aarav");
    o(40, "ACCEPTED", 4, [["Paneer Tikka Roll", 1], ["Cold Coffee", 1]], "Diya");
    o(39, "PREPARING", 7, [["Veg Club Sandwich", 2]], "Kabir");
    o(38, "READY", 12, [["Vada Pav", 3], ["Masala Chai", 3]], "Isha");
    o(37, "COMPLETED", 35, [["Chicken Kathi Roll", 2], ["Lemon Iced Tea", 2]], "Rohan", [5, "Best rolls near campus"]);
    o(36, "COMPLETED", 55, [["Masala Fries", 1], ["Fresh Lime Soda", 2]], "Meera", [4, "Quick service"]);
    return { menu_items: menu, orders: orders, order_items: items, feedback: fb };
  },
  insert: {
    orders: function (row, db) { row.order_number = db.orders.reduce(function (a, x) { return Math.max(a, x.order_number || 0); }, 0) + 1; if (row.feedback_given === undefined) row.feedback_given = false; row.updated_at = row.created_at; return row; },
    menu_items: function (row) { if (row.is_available === undefined) row.is_available = true; if (row.is_special === undefined) row.is_special = false; return row; }
  },
  routes: {
    "/api/login": function (b) { return b && b.password === "demo" ? [200, { ok: true }] : [401, { ok: false, error: "Wrong password. In this demo it is: demo" }]; }
  }
};
