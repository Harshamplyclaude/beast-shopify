// Checks the GST engine against September 2026, which was worked out by hand for the CA.
// Run: node test/engine.test.js   (or: npm test)
const assert = require("node:assert/strict");
const { computeReport, normTitle } = require("../web/gst-engine.js");
const { ISLANDS_DEFAULTS } = require("../web/defaults.js");
const orders = require("./orders-2026-09.json");

const ctx = (overrides = {}) => ({
  settings: { ...ISLANDS_DEFAULTS.settings, ...(overrides.settings || {}) },
  hsn: new Map(ISLANDS_DEFAULTS.hsn.map(h => [normTitle(h.product), h])),
  dummy: new Map(ISLANDS_DEFAULTS.dummy.map(d => [d.order, d])),
  periods: overrides.periods || [],
});
const rupees = p => Math.round(p) / 100;
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log("ok -", name); };

test("September totals match the CA workbook", () => {
  const r = computeReport(orders, "2026-09", ctx());
  assert.equal(r.totals.invoices, 42);
  assert.equal(r.excluded.length, 12);
  assert.equal(rupees(r.totals.value), 58712.75);
  assert.equal(rupees(r.totals.taxable), 52043.68);
  assert.equal(rupees(r.totals.gst), 6669.07);
  assert.equal(rupees(r.totals.igst), 5946.08);
  assert.equal(rupees(r.totals.cgst), 361.53);
  assert.equal(rupees(r.totals.sgst), 361.46);
  assert.equal(r.totals.collected, r.totals.value);
});

test("tees are 5%, Notice and shipping 18%", () => {
  const r = computeReport(orders, "2026-09", ctx());
  assert.deepEqual(r.byRate.map(x => [x.rate, rupees(x.taxable)]), [[5, 20759.44], [18, 31284.24]]);
  for (const l of r.lines) {
    if (l.brand === "MrBeast" || l.kind === "Tip") assert.equal(l.rate, 5, l.title);
    if (l.brand === "Notice" || l.kind === "Shipping") assert.equal(l.rate, 18, l.title);
  }
});

test("apparel above ₹2,500 per piece before GST moves to 18%", () => {
  const tee = JSON.parse(JSON.stringify(orders.find(o => o.name === "#ISLANDER1036111620")));
  tee.lineItems.nodes[0].discountedUnitPriceAfterAllDiscountsSet.shopMoney.amount = "2700";
  tee.currentTotalPriceSet.shopMoney.amount = tee.totalPriceSet.shopMoney.amount = "2700";
  const r = computeReport([tee], "2026-09", ctx());
  assert.equal(r.lines[0].rate, 18);
});

test("test, cancelled, voided and dummy orders are left out", () => {
  const r = computeReport(orders, "2026-09", ctx());
  const status = Object.fromEntries(r.excluded.map(x => [x.name, x.status]));
  assert.equal(status["#1001"], "Test order");
  assert.equal(status["#ISLANDER1016111620"], "Cancelled");
  assert.equal(status["#ISLANDER1024111620"], "Payment voided");
  assert.equal(status["#ISLANDER1030111620"], "Dummy");
});

test("locked September keeps its numbers and October continues at 0043", () => {
  const locked = computeReport(orders, "2026-09", ctx({ periods: ISLANDS_DEFAULTS.periods }));
  assert.equal(locked.docs.from, "TI/26-27/0001");
  assert.equal(locked.docs.to, "TI/26-27/0042");
  assert.equal(locked.flags.filter(f => f.kind === "lock").length, 0);
  const oct = computeReport([], "2026-10", ctx({ periods: ISLANDS_DEFAULTS.periods }));
  assert.equal(oct.startNo, 43);
});

test("switching the GST state to Karnataka moves the CGST/SGST split", () => {
  const r = computeReport(orders, "2026-09", ctx({ settings: { homeState: "KA" } }));
  assert.equal(rupees(r.totals.gst), 6669.07);
  assert.equal(rupees(r.totals.igst), 4958.30);
  assert.equal(rupees(r.totals.cgst), 855.43);
  assert.equal(rupees(r.totals.sgst), 855.34);
});

console.log(`\n${passed} checks passed`);
