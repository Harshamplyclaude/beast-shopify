// Islands GST Desk: GST engine.
// Pure functions shared by the app page (web/index.html) and the tests (test/engine.test.js).
// Amounts are handled in paise (integers) to avoid rounding drift; prices on the store include GST.
const STATES = {
  JK:["01","Jammu and Kashmir"], HP:["02","Himachal Pradesh"], PB:["03","Punjab"], CH:["04","Chandigarh"], UK:["05","Uttarakhand"], UT:["05","Uttarakhand"],
  HR:["06","Haryana"], DL:["07","Delhi"], RJ:["08","Rajasthan"], UP:["09","Uttar Pradesh"], BR:["10","Bihar"], SK:["11","Sikkim"], AR:["12","Arunachal Pradesh"],
  NL:["13","Nagaland"], MN:["14","Manipur"], MZ:["15","Mizoram"], TR:["16","Tripura"], ML:["17","Meghalaya"], AS:["18","Assam"], WB:["19","West Bengal"],
  JH:["20","Jharkhand"], OR:["21","Odisha"], OD:["21","Odisha"], CG:["22","Chhattisgarh"], CT:["22","Chhattisgarh"], MP:["23","Madhya Pradesh"], GJ:["24","Gujarat"],
  DN:["26","Dadra and Nagar Haveli and Daman and Diu"], DD:["26","Dadra and Nagar Haveli and Daman and Diu"], MH:["27","Maharashtra"], KA:["29","Karnataka"],
  GA:["30","Goa"], LD:["31","Lakshadweep"], KL:["32","Kerala"], TN:["33","Tamil Nadu"], PY:["34","Puducherry"], AN:["35","Andaman and Nicobar Islands"],
  TS:["36","Telangana"], TG:["36","Telangana"], AP:["37","Andhra Pradesh"], LA:["38","Ladakh"]
};
const DEFAULT_SETTINGS = { legalName: "", gstin: "", homeState: "DL", prefix: "TI/{FY}/", threshold: 2500, lowRate: 5, highRate: 18, noticeRate: 18, b2clLimit: 100000 };
const APPAREL_RE = /(t-?shirt|\btees?\b|hoodie|sweat|shirt|jacket|trouser|pants?\b|jogger|shorts|apparel|clothing|dress|\btops?\b)/i;

const monthName = m => { const [y, mo] = m.split("-").map(Number); return new Date(Date.UTC(y, mo - 1, 15)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }); };
const paise = v => Math.round(Number(v || 0) * 100);
const money = s => paise(s && s.shopMoney ? s.shopMoney.amount : 0);
const normTitle = t => String(t || "").trim().toUpperCase().replace(/\s+/g, " ");
const posLabel = code => STATES[code] ? `${STATES[code][0]}-${STATES[code][1]}` : "";
const istDate = iso => new Date(new Date(iso).getTime() + 330 * 60000).toISOString().slice(0, 10);
function fyOf(month) { const [y, m] = month.split("-").map(Number); const s = m >= 4 ? y : y - 1; return `${String(s % 100).padStart(2, "0")}-${String((s + 1) % 100).padStart(2, "0")}`; }
function monthRangeUTC(month) {
  const [y, m] = month.split("-").map(Number);
  const iso = d => new Date(d).toISOString().replace(".000Z", "Z");
  return { from: iso(Date.UTC(y, m - 1, 1) - 330 * 60000), to: iso(Date.UTC(y, m, 1) - 330 * 60000) };
}
function payMode(gws) {
  const g = (gws || []).join(" | ").toLowerCase();
  if (/cash on delivery|\bcod\b/.test(g)) return "COD";
  const rz = /razorpay/.test(g), man = /manual/.test(g);
  if (rz && man) return "Razorpay + manual";
  if (rz) return "Razorpay";
  if (/gokwik/.test(g)) return "GoKwik";
  if (man) return "Manual / bank";
  return (gws || []).join(", ") || "Unknown";
}
function splitTax(valueP, rate, inter) {
  const taxable = Math.round(valueP * 100 / (100 + rate));
  const gst = valueP - taxable;
  if (inter) return { taxable, gst, igst: gst, cgst: 0, sgst: 0 };
  const cgst = Math.round(gst / 2);
  return { taxable, gst, igst: 0, cgst, sgst: gst - cgst };
}

function computeReport(orders, month, ctx) {
  const st = Object.assign({}, DEFAULT_SETTINGS, ctx.settings || {});
  const home = STATES[st.homeState] ? STATES[st.homeState][0] : null;
  const fy = fyOf(month);
  const prefix = String(st.prefix || "").replace("{FY}", fy);
  const flags = [], excluded = [], invoices = [];
  const unknown = new Map();
  const add = f => flags.push(f);

  const sorted = orders.slice().sort((a, b) => a.processedAt < b.processedAt ? -1 : 1);
  for (const o of sorted) {
    const addr = o.shippingAddress || o.billingAddress || {};
    const base = { name: o.name, date: istDate(o.processedAt), customer: (o.customer && o.customer.displayName) || addr.name || "",
      city: addr.city || "", state: addr.provinceCode || "", pay: payMode(o.paymentGatewayNames), ful: o.displayFulfillmentStatus || "",
      fin: o.displayFinancialStatus || "", total: money(o.currentTotalPriceSet), original: money(o.totalPriceSet) };
    const dummy = ctx.dummy && ctx.dummy.get(o.name);
    if (o.test) { excluded.push({ ...base, status: "Test order", reason: "Shopify test order (test payment gateway). No money changed hands.", auto: true }); continue; }
    if (dummy) { excluded.push({ ...base, status: "Dummy", reason: dummy.reason || "Marked as a dummy order.", manual: true }); continue; }
    if (o.cancelledAt) { excluded.push({ ...base, status: "Cancelled", reason: `Cancelled on ${istDate(o.cancelledAt)} before it became a sale. No invoice.`, auto: true }); continue; }
    if (base.fin === "VOIDED") { excluded.push({ ...base, status: "Payment voided", reason: "Payment was voided: COD never collected or returned to origin. Left out of sales.", auto: true }); continue; }
    if (base.total <= 0) { excluded.push({ ...base, status: "Refunded", reason: "Order total is zero after refunds or edits.", auto: true }); continue; }

    const inv = { ...base, pos: posLabel(base.state), lines: [], flags: [] };
    inv.inter = home ? (STATES[base.state] ? STATES[base.state][0] !== home : true) : true;
    if (!inv.pos) { const f = { sev: "bad", kind: "state", order: o.name, title: `${o.name}: delivery state "${base.state || "blank"}" isn't recognised`, text: "Place of supply can't be worked out. It's treated as inter-state (IGST) until the address is fixed in Shopify." }; add(f); inv.flags.push("Unknown state"); }

    let topRate = null, topHsn = "", topVal = -1;
    for (const li of (o.lineItems && o.lineItems.nodes) || []) {
      const qty = li.currentQuantity || 0;
      if (!qty) continue;
      const net = money(li.discountedUnitPriceAfterAllDiscountsSet), mrp = money(li.originalUnitPriceSet);
      const shopTax = Math.round(((li.taxLines || []).reduce((s, t) => s + money(t.priceSet), 0)) * qty / (li.quantity || qty));
      const isTip = !li.product && /^tip$/i.test(String(li.title || "").trim());
      if (li.isGiftCard) {
        inv.lines.push({ kind: "Gift card", title: li.title, variant: li.variantTitle || "", sku: li.sku || "", brand: li.vendor || "", category: "Gift card", hsn: "", qty, mrp, net, value: qty * net, rate: 0, taxable: 0, gst: 0, igst: 0, cgst: 0, sgst: 0, shopTax });
        add({ sev: "info", kind: "giftcard", order: o.name, title: `${o.name}: gift card sold`, text: "Gift cards aren't taxed when sold. GST applies when the card is redeemed. Shown under non-GST supplies." });
        continue;
      }
      if (isTip) { inv.lines.push({ kind: "Tip", title: "Tip", variant: "", sku: "", brand: "-", category: "Tip", qty: 1, mrp: net * qty, net: net * qty, value: net * qty, shopTax }); continue; }
      const m = ctx.hsn && ctx.hsn.get(normTitle(li.title));
      const ptype = (li.product && li.product.productType) || "";
      const category = m ? m.category : (APPAREL_RE.test(ptype + " " + li.title) ? "Apparel" : "Home Decor");
      if (!m && !unknown.has(normTitle(li.title))) unknown.set(normTitle(li.title), { title: li.title, vendor: li.vendor || "", productType: ptype, category });
      let rate;
      if (category === "Apparel") rate = (net * 100 / (100 + st.lowRate)) <= st.threshold * 100 ? st.lowRate : st.highRate;
      else rate = m && m.rate != null && m.rate !== "" ? Number(m.rate) : st.noticeRate;
      const value = qty * net;
      const line = { kind: "Goods", title: li.title, variant: li.variantTitle || "", sku: li.sku || "", brand: li.vendor || "", category, hsn: (m && m.hsn) || "", hsnDesc: (m && m.description) || "", qty, mrp, net, value, rate, shopTax };
      inv.lines.push(line);
      if (rate > topRate || (rate === topRate && value > topVal)) { topRate = rate; topHsn = line.hsn; topVal = value; }
    }
    if (topRate === null) topRate = st.noticeRate;
    const ship = money(o.totalShippingPriceSet);
    if (ship > 0) inv.lines.push({ kind: "Shipping", title: "Shipping charges", variant: "", sku: "", brand: "-", category: "Shipping", qty: 1, mrp: ship, net: ship, value: ship, shopTax: 0 });
    for (const l of inv.lines) {
      if (l.kind === "Shipping" || l.kind === "Tip") { l.rate = topRate; l.hsn = topHsn; }
      if (l.kind !== "Gift card") Object.assign(l, splitTax(l.value, l.rate, inv.inter));
    }
    const sum = k => inv.lines.reduce((s, l) => s + (l[k] || 0), 0);
    Object.assign(inv, { value: sum("value"), taxable: sum("taxable"), gst: sum("gst"), igst: sum("igst"), cgst: sum("cgst"), sgst: sum("sgst"), shopTax: sum("shopTax"),
      tLow: inv.lines.filter(l => l.rate === st.lowRate && l.kind !== "Gift card").reduce((s, l) => s + l.taxable, 0),
      tHigh: inv.lines.filter(l => l.rate === st.highRate && l.kind !== "Gift card").reduce((s, l) => s + l.taxable, 0) });
    if (inv.value !== inv.total) { add({ sev: "bad", kind: "mismatch", order: o.name, title: `${o.name}: invoice ₹${(inv.value / 100).toFixed(2)} doesn't match Shopify's ₹${(inv.total / 100).toFixed(2)}`, text: "Usually a refunded shipping charge or a manual adjustment. Check the order in Shopify before filing." }); inv.flags.push("Total mismatch"); }
    if (base.original !== base.total) { add({ sev: "warn", kind: "edited", order: o.name, title: `${o.name}: edited or partly refunded`, text: `Shopify total went from ₹${(base.original / 100).toFixed(2)} to ₹${(base.total / 100).toFixed(2)}. The invoice uses the items still on the order. If the change happened after the month closed, the CA may want a credit note instead.` }); inv.flags.push("Edited"); }
    if ((o.discountCodes || []).some(c => /test/i.test(c)) || inv.value <= 1000) { add({ sev: "warn", kind: "suspect", order: o.name, action: "dummy", title: `${o.name}: looks like a test order`, text: `₹${(inv.value / 100).toFixed(2)}${(o.discountCodes || []).length ? ` with code ${o.discountCodes.join(", ")}` : ""}. Mark it as dummy if it isn't a real sale.` }); inv.flags.push("Looks like a test"); }
    if (base.pay === "COD" && base.fin !== "PAID") inv.flags.push("COD not yet paid");
    if (/UNFULFILLED|PARTIALLY/.test(base.ful)) inv.flags.push(base.ful === "UNFULFILLED" ? "Not shipped" : "Part shipped");
    invoices.push(inv);
  }

  // invoice numbers: continue the series across locked months of the same financial year
  const periods = (ctx.periods || []).filter(p => p && p.month);
  const lock = periods.find(p => p.month === month);
  let startNo = 1, numbering;
  if (lock && Array.isArray(lock.orders)) {
    const idx = new Map(lock.orders.map((n, i) => [n, i]));
    startNo = lock.firstNo;
    let extra = lock.lastNo;
    for (const inv of invoices) {
      if (idx.has(inv.name)) inv.no = lock.firstNo + idx.get(inv.name);
      else { inv.no = null; add({ sev: "bad", kind: "lock", order: inv.name, title: `${inv.name} isn't in the locked invoice list`, text: `${month} was locked with ${lock.orders.length} invoices. Unlock the month in Settings to renumber, or mark this order as dummy.` }); }
    }
    const missing = lock.orders.filter(n => !invoices.some(i => i.name === n));
    if (missing.length) add({ sev: "bad", kind: "lock", title: `${missing.length} locked invoice${missing.length > 1 ? "s are" : " is"} no longer counted as sales`, text: `${missing.join(", ")}. They were invoiced when the month was locked; the CA will need a credit note or cancellation for them.` });
    numbering = `Locked on ${istDate(lock.lockedAt || new Date().toISOString())}: numbers are fixed.`;
  } else {
    const prev = periods.filter(p => fyOf(p.month) === fy && p.month < month).sort((a, b) => a.month < b.month ? 1 : -1)[0];
    startNo = prev ? prev.lastNo + 1 : 1;
    invoices.forEach((inv, i) => { inv.no = startNo + i; });
    const [y, m] = month.split("-").map(Number);
    const prevMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
    numbering = prev ? `Continues from ${prev.month} (last invoice ${prefix}${String(prev.lastNo).padStart(4, "0")}).` : "Starts at 0001 for this financial year.";
    if (prev && prev.month !== prevMonth)
      add({ sev: "warn", kind: "numbering", title: `${monthName(prevMonth)} isn't locked yet`, text: `Numbering carries on from ${monthName(prev.month)}, the last locked month. If ${monthName(prevMonth)} had sales, calculate and lock it first so the series has no gaps.` });
  }
  for (const inv of invoices) inv.invNo = inv.no == null ? "UNNUMBERED" : `${prefix}${String(inv.no).padStart(4, "0")}`;

  for (const u of unknown.values()) add({ sev: "warn", kind: "hsn", product: u, title: `No HSN for "${u.title}"`, text: `${u.vendor || "Unknown brand"} · treated as ${u.category === "Apparel" ? "apparel (5% / 18% by price)" : `home decor at ${st.noticeRate}%`}. Add its HSN in Settings & HSN.` });
  const blankHsn = new Set();
  for (const inv of invoices) for (const l of inv.lines) if (l.kind === "Goods" && !l.hsn && ctx.hsn && ctx.hsn.has(normTitle(l.title))) blankHsn.add(l.title);
  for (const t of blankHsn) add({ sev: "warn", kind: "hsn", title: `"${t}" has no HSN code yet`, text: "It's on the HSN list without a code. Fill it in under Settings & HSN." });

  // aggregates
  const lines = invoices.flatMap(inv => inv.lines.map(l => ({ ...l, order: inv.name, invNo: inv.invNo, date: inv.date, customer: inv.customer, city: inv.city, state: inv.state, pos: inv.pos, inter: inv.inter, pay: inv.pay, ful: inv.ful })));
  const T = k => invoices.reduce((s, i) => s + (i[k] || 0), 0);
  const gstLines = lines.filter(l => l.kind !== "Gift card");
  const totals = { invoices: invoices.length, value: T("value"), taxable: T("taxable"), gst: T("gst"), igst: T("igst"), cgst: T("cgst"), sgst: T("sgst"), shopTax: T("shopTax"), collected: T("total"),
    discount: gstLines.reduce((s, l) => s + (l.mrp - l.net) * (l.kind === "Goods" ? l.qty : 0), 0),
    nonGst: lines.filter(l => l.kind === "Gift card").reduce((s, l) => s + l.value, 0) };
  const group = (arr, keyFn, init) => { const m = new Map(); for (const x of arr) { const k = keyFn(x); if (!m.has(k)) m.set(k, init(x)); const g = m.get(k); g.value += x.value; g.taxable += x.taxable; g.gst += x.gst; g.igst += x.igst; g.cgst += x.cgst; g.sgst += x.sgst; g.qty += x.kind === "Goods" ? x.qty : 0; g.n = (g.n || 0) + 1; } return [...m.values()]; };
  const z = { value: 0, taxable: 0, gst: 0, igst: 0, cgst: 0, sgst: 0, qty: 0 };
  const byRate = group(gstLines, l => l.rate, l => ({ ...z, rate: l.rate })).sort((a, b) => a.rate - b.rate);
  const byBrand = group(gstLines, l => l.kind === "Goods" ? l.brand || "Unknown" : l.kind === "Shipping" ? "Shipping charges" : "Tips", l => ({ ...z, brand: l.kind === "Goods" ? l.brand || "Unknown" : l.kind === "Shipping" ? "Shipping charges" : "Tips", goods: l.kind === "Goods" })).sort((a, b) => (b.goods - a.goods) || (b.value - a.value));
  const isB2CL = inv => inv.inter && inv.value > st.b2clLimit * 100;
  const b2clInv = invoices.filter(isB2CL);
  const b2csLines = gstLines.filter(l => !b2clInv.some(i => i.name === l.order));
  const b2cs = group(b2csLines, l => `${l.pos}|${l.rate}`, l => ({ ...z, pos: l.pos || "UNKNOWN", rate: l.rate })).sort((a, b) => a.pos < b.pos ? -1 : a.pos > b.pos ? 1 : a.rate - b.rate);
  const b2cl = b2clInv.map(inv => ({ invNo: inv.invNo, date: inv.date, value: inv.value, pos: inv.pos, rates: group(inv.lines.filter(l => l.kind !== "Gift card"), l => l.rate, l => ({ ...z, rate: l.rate })) }));
  const hsn = group(gstLines, l => `${l.hsn || "MISSING"}|${l.rate}`, l => ({ ...z, hsn: l.hsn || "MISSING", rate: l.rate, desc: l.hsnDesc || (l.category === "Apparel" ? "Apparel" : l.category), uqc: l.category === "Apparel" ? "PCS-PIECES" : "NOS-NUMBERS" })).sort((a, b) => a.hsn < b.hsn ? -1 : a.hsn > b.hsn ? 1 : a.rate - b.rate);
  for (const h of hsn) { const g = gstLines.find(l => (l.hsn || "MISSING") === h.hsn && l.rate === h.rate && l.kind === "Goods"); if (g) { h.desc = g.hsnDesc || h.desc; h.uqc = g.category === "Apparel" ? "PCS-PIECES" : "NOS-NUMBERS"; } }
  const interByPos = group(gstLines.filter(l => l.inter), l => l.pos, l => ({ ...z, pos: l.pos || "UNKNOWN" })).sort((a, b) => a.pos < b.pos ? -1 : 1);
  const numbered = invoices.filter(i => i.no != null);
  const docs = { from: numbered.length ? numbered[0].invNo : "", to: numbered.length ? numbered[numbered.length - 1].invNo : "", count: numbered.length };
  const lastNo = numbered.length ? Math.max(...numbered.map(i => i.no)) : startNo - 1;
  const sevRank = { bad: 0, warn: 1, info: 2 };
  flags.sort((a, b) => sevRank[a.sev] - sevRank[b.sev]);
  return { month, fy, prefix, settings: st, startNo, lastNo, lock: lock || null, numbering, invoices, lines, excluded, flags, totals, byRate, byBrand, b2cs, b2cl, hsn, interByPos, docs };
}

if (typeof module !== "undefined") module.exports = { STATES, DEFAULT_SETTINGS, computeReport, fyOf, monthRangeUTC, monthName, normTitle, payMode, splitTax };
