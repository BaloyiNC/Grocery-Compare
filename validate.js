// Usage: node tools/validate.js  - exits with code 1 if the data is not safe to publish
const fs=require("fs");
const cfg=JSON.parse(fs.readFileSync("data/config.json","utf8"));
const ctx={window:{}};new Function("window",fs.readFileSync("data/data.js","utf8"))(ctx.window);
const D=ctx.window.GC_DATA, errs=[], ids=new Set(), codes=new Set(), seen=new Set();
if(!/^\d{4}-\d{2}-\d{2}$/.test(D.updated))errs.push("config.updated must be YYYY-MM-DD");
else if((Date.now()-new Date(D.updated))/864e5>14)errs.push(`Data is older than 14 days (${D.updated}) - refresh is due`);
D.products.forEach(p=>{
  const w=`#${p.id} ${p.n}`;
  if(!Number.isInteger(p.id)||ids.has(p.id))errs.push(`${w}: id missing or duplicated`);ids.add(p.id);
  if(!D.categories.includes(p.c)||p.c==="All")errs.push(`${w}: unknown category "${p.c}"`);
  if(!p.n||!p.s||!p.u)errs.push(`${w}: name, size and unit are required`);
  if(!(p.d>0))errs.push(`${w}: divisor must be above 0`);
  if(p.barcode){
    if(codes.has(p.barcode))errs.push(`${w}: duplicate barcode`);codes.add(p.barcode);
    const b=p.barcode, ds=b.split("").map(Number); // GTIN-8/12/13/14 check digit
    const sum=ds.slice(0,-1).reverse().reduce((a,d,i)=>a+d*(i%2?1:3),0);
    if(!/^\d{8}$|^\d{12,14}$/.test(b)||(10-sum%10)%10!==ds[ds.length-1])errs.push(`${w}: barcode ${b} is not a valid GTIN`);
  }
  const key=[p.brand,p.n,p.s].join("|").toLowerCase();
  if(seen.has(key))errs.push(`${w}: same brand, name and size as another row`);seen.add(key);
  const stocked=Object.keys(p.p);
  if(stocked.length<2)errs.push(`${w}: needs prices at 2 or more stores to compare`);
  stocked.forEach(s=>{if(!D.stores.includes(s))errs.push(`${w}: unknown store ${s}`);if(!(p.p[s]>0))errs.push(`${w}: bad price at ${s}`)});
  Object.keys(p.sp).forEach(s=>{if(p.p[s]==null)errs.push(`${w}: special at ${s} but no regular price`);else if(!(p.sp[s]>0&&p.sp[s]<p.p[s]))errs.push(`${w}: special at ${s} must be below the regular price`)});
});
D.stores.forEach(s=>{if(!(D.branches[s]||[]).length)errs.push(`No branches for ${s}`)});
if(errs.length){console.error(errs.map(e=>" - "+e).join("\n"));process.exit(1)}
console.log(`OK: ${D.products.length} products, ${D.stores.length} stores, updated ${D.updated}`);
