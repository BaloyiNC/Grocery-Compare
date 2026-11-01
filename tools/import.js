const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const config = JSON.parse(fs.readFileSync(path.join(dataDir, "config.json"), "utf8"));
const csv = fs.readFileSync(path.join(dataDir, "products.csv"), "utf8").replace(/^\uFEFF/, "");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.length === 0) {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      row.push(cell);
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
      cell = "";
      if (char === "\r" && text[i + 1] === "\n") i++;
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error("Unclosed quoted field in data/products.csv");
  row.push(cell);
  if (row.some(value => value !== "")) rows.push(row);
  return rows;
}

const [header, ...records] = parseCsv(csv);
if (!header || !header.includes("id")) {
  throw new Error("data/products.csv must have a header row containing an id column");
}

const columns = new Map(header.map((name, index) => [name.trim(), index]));
const value = (row, column) => {
  const index = columns.get(column);
  return index == null ? "" : (row[index] || "").trim();
};
const requiredColumns = ["id", "name", "category", "size", "divisor", "unit", "brand"];
if (config.dataMode === "catalogue-offers") {
  requiredColumns.push("store", "offer_price", "offer_until", "source_url");
} else {
  requiredColumns.push("barcode");
}
for (const column of requiredColumns) {
  if (!columns.has(column)) throw new Error(`data/products.csv is missing required column "${column}"`);
}
if (config.dataMode !== "catalogue-offers") {
  for (const store of config.stores) {
    if (!columns.has(`price:${store}`)) {
      throw new Error(`data/products.csv is missing the price:${store} column`);
    }
  }
}
records.forEach((row, index) => {
  if (row.length !== header.length) {
    throw new Error(`data/products.csv line ${index + 2} has ${row.length} columns; expected ${header.length}`);
  }
});

const products = records.map((row, index) => {
  const line = index + 2;
  const product = {
    id: Number(value(row, "id")),
    n: value(row, "name"),
    c: value(row, "category"),
    s: value(row, "size"),
    d: Number(value(row, "divisor")),
    u: value(row, "unit"),
    brand: value(row, "brand"),
    p: {},
    sp: {},
    su: {}
  };
  if (config.dataMode === "catalogue-offers") {
    const store = value(row, "store");
    const price = Number(value(row, "offer_price"));
    const until = value(row, "offer_until");
    const source = value(row, "source_url");
    if (!config.stores.includes(store) || !(price > 0) || !until || !source) {
      throw new Error(`Invalid catalogue offer on data/products.csv line ${line}`);
    }
    product.p[store] = price;
    product.of = { [store]: { until, source } };
  } else {
    const barcode = value(row, "barcode");
    if (barcode) product.barcode = barcode;

    for (const store of config.stores) {
      const price = value(row, `price:${store}`);
      const special = value(row, `special:${store}`);
      const until = value(row, `until:${store}`);
      if (price) product.p[store] = Number(price);
      if (special) product.sp[store] = Number(special);
      if (until) product.su[store] = until;
    }
  }

  if (!Number.isInteger(product.id) || !product.n || !product.c || !product.s || !product.u || !product.brand || !(product.d > 0)) {
    throw new Error(`Invalid required product value on data/products.csv line ${line}`);
  }
  if (Object.values(product.p).some(price => !Number.isFinite(price))) {
    throw new Error(`Invalid price on data/products.csv line ${line}`);
  }
  if (Object.values(product.sp).some(price => !Number.isFinite(price))) {
    throw new Error(`Invalid special price on data/products.csv line ${line}`);
  }
  if (!Object.keys(product.sp).length) delete product.sp;
  if (!Object.keys(product.su).length) delete product.su;
  return product;
});

const output = {
  stores: config.stores,
  colors: config.colors,
  cards: config.cards,
  categories: config.categories,
  updated: config.updated,
  sampleData: config.sampleData === true,
  dataMode: config.dataMode || "retail-prices",
  branches: config.branches || {},
  products
};
const js = `window.GC_DATA = ${JSON.stringify(output, null, 2)};\n`;
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "data.js"), js);
console.log(`Imported ${products.length} products from data/products.csv`);
