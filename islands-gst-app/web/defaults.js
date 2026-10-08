// Islands GST Desk: starting data for The Islands.
// Written to the store's app data the first time the app opens. After that, edit everything inside the app
// (Settings & HSN tab); this file is only read again if the saved copy is deleted.

const ISLANDS_DEFAULTS = {
  settings: { legalName: "", gstin: "", homeState: "DL", prefix: "TI/{FY}/", threshold: 2500, lowRate: 5, highRate: 18, noticeRate: 18, b2clLimit: 100000 },

  // Suggested HSN per product (CA to confirm). Apparel rates follow the price rule; rate here applies to other products.
  hsn: [
  {
    "product": "Mr Beast Cyber Grid Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Dual Panther Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Neon Panther Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Split Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Sketch Panther Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Drip Panther Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Bolt Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Tonal Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Mr Beast Money Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Kids - Bolt Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Kids - Sketch Panther Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "Kids - Cyber Grid Tee",
    "brand": "MrBeast",
    "category": "Apparel",
    "hsn": "6109",
    "rate": null,
    "description": "T-shirts, knitted",
    "note": ""
  },
  {
    "product": "TETRAPOD",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "7616",
    "rate": 18,
    "description": "Other articles of aluminium",
    "note": ""
  },
  {
    "product": "THE UNTITLED BOOK",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "7616",
    "rate": 18,
    "description": "Other articles of aluminium",
    "note": ""
  },
  {
    "product": "CARD BAR",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "8304",
    "rate": 18,
    "description": "Desk equipment of base metal",
    "note": ""
  },
  {
    "product": "CARD BAR - SILVER SURFER",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "8304",
    "rate": 18,
    "description": "Desk equipment of base metal",
    "note": ""
  },
  {
    "product": "PERPETUAL CALENDAR",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "8304",
    "rate": 18,
    "description": "Desk equipment of base metal",
    "note": "Mixed material. Could also go under wood articles (4421)."
  },
  {
    "product": "CARD BAR REFILL",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "4823",
    "rate": 18,
    "description": "Other paper/paperboard cut to size",
    "note": "Paper stationery can carry a lower rate than 18%. Please check."
  },
  {
    "product": "HEARTS AND CROSSES TRAY",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "3926",
    "rate": 18,
    "description": "Other articles of plastics",
    "note": ""
  },
  {
    "product": "YOLO AGARBATTI HOLDER",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "3926",
    "rate": 18,
    "description": "Other articles of plastics",
    "note": ""
  },
  {
    "product": "UNTITLED-01",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "8306",
    "rate": 18,
    "description": "Statuettes and other ornaments of base metal",
    "note": "Ornaments of base metal (8306) may carry a lower rate than 18%. Please check."
  },
  {
    "product": "CAN'T STOP WONT STOP",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "8310",
    "rate": 18,
    "description": "Sign-plates of base metal",
    "note": ""
  },
  {
    "product": "SPRING STAND",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "7326",
    "rate": 18,
    "description": "Other articles of iron or steel",
    "note": ""
  },
  {
    "product": "SPRING STAND - BLACK",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "7326",
    "rate": 18,
    "description": "Other articles of iron or steel",
    "note": ""
  },
  {
    "product": "SERVING LOOKS - HAND MIRROR",
    "brand": "Notice",
    "category": "Home Decor",
    "hsn": "7009",
    "rate": 18,
    "description": "Glass mirrors, framed",
    "note": ""
  }
],

  // Orders that look real in Shopify but aren't sales.
  dummy: [
  {
    "order": "#ISLANDER1003111620",
    "reason": "Internal ₹10 test order with code TEST199. Not a real sale."
  },
  {
    "order": "#ISLANDER1004111620",
    "reason": "Internal ₹10 test order with code TEST199. Not a real sale."
  },
  {
    "order": "#ISLANDER1005111620",
    "reason": "Internal ₹10 test order with code TEST199. Not a real sale."
  },
  {
    "order": "#ISLANDER1030111620",
    "reason": "75-Tetrapod draft order. Not a real sale."
  }
],

  // Months already filed. September 2026 used invoices TI/26-27/0001 to 0042, so October continues at 0043.
  periods: [
  {
    "month": "2026-09",
    "prefix": "TI/26-27/",
    "firstNo": 1,
    "lastNo": 42,
    "count": 42,
    "orders": [
      "#ISLANDER1007111620",
      "#ISLANDER1008111620",
      "#ISLANDER1009111620",
      "#ISLANDER1010111620",
      "#ISLANDER1011111620",
      "#ISLANDER1012111620",
      "#ISLANDER1013111620",
      "#ISLANDER1014111620",
      "#ISLANDER1015111620",
      "#ISLANDER1017111620",
      "#ISLANDER1018111620",
      "#ISLANDER1019111620",
      "#ISLANDER1020111620",
      "#ISLANDER1022111620",
      "#ISLANDER1023111620",
      "#ISLANDER1025111620",
      "#ISLANDER1026111620",
      "#ISLANDER1028111620",
      "#ISLANDER1031111620",
      "#ISLANDER1032111620",
      "#ISLANDER1033111620",
      "#ISLANDER1034111620",
      "#ISLANDER1035111620",
      "#ISLANDER1036111620",
      "#ISLANDER1037111620",
      "#ISLANDER1038111620",
      "#ISLANDER1039111620",
      "#ISLANDER1040111620",
      "#ISLANDER1041111620",
      "#ISLANDER1042111620",
      "#ISLANDER1043111620",
      "#ISLANDER1044111620",
      "#ISLANDER1045111620",
      "#ISLANDER1046111620",
      "#ISLANDER1047111620",
      "#ISLANDER1048111620",
      "#ISLANDER1049111620",
      "#ISLANDER1050111620",
      "#ISLANDER1051111620",
      "#ISLANDER1052111620",
      "#ISLANDER1053111620",
      "#ISLANDER1054111620"
    ],
    "taxable": 52043.68,
    "gst": 6669.07,
    "igst": 5946.08,
    "cgst": 361.53,
    "sgst": 361.46,
    "invoiceValue": 58712.75,
    "lockedAt": "2026-10-08T10:00:00Z"
  }
]
};

if (typeof module !== "undefined") module.exports = { ISLANDS_DEFAULTS };
