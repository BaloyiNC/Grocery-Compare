// Usage: node tools/validate.js  - exits with code 1 if the data is not safe to publish
const fs=require("fs");
const cfg=JSON.parse(fs.readFileSync("data/config.json","utf8"));
const ctx={window:{}};new Function("window",fs.readFileSync("data/data.js","utf8"))(ctx.window);
const D=ctx.window.GC_DATA, errs=[], warns=[], ids=new Set(), codes=new Set(), seen=new Set();
if(!/^\d{4}-\d{2}-\d{2}$/.test(D.updated))errs.push("config.updated must be YYYY-MM-DD");
else if(new Date(D.updated)-Date.now()>864e5)errs.push(`config.updated (${D.updated}) is in the future`);
else if((Date.now()-new Date(D.updated))/864e5>14){
  const message=`Data is older than 14 days (${D.updated}) - refresh is due`;
  if(D.sampleData===true)warns.push(`${message}; sample data does not block the build`);
  else errs.push(message);
}
const today=new Date().toISOString().slice(0,10);
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
  const stocked=Object.keys(p.p||{});
  if(!stocked.length)errs.push(`${w}: needs at least one listed price`);
  stocked.forEach(s=>{if(!D.stores.includes(s))errs.push(`${w}: unknown store ${s}`);if(!(p.p[s]>0))errs.push(`${w}: bad price at ${s}`)});
  Object.keys(p.of||{}).forEach(s=>{
    const offer=p.of[s];
    if(!D.stores.includes(s)||p.p[s]==null)errs.push(`${w}: offer metadata has no matching price at ${s}`);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(offer.until)||isNaN(new Date(offer.until)))errs.push(`${w}: offer end date for ${s} must be YYYY-MM-DD`);
    if(!/^https:\/\/my-catalogue\.co\.za\//.test(offer.source))errs.push(`${w}: offer source for ${s} must be a My Catalogue URL`);
    else if(offer.until<today)warns.push(`${w}: offer at ${s} ended on ${offer.until}`);
  });
  Object.keys(p.su||{}).forEach(s=>{ // optional end date of a special: YYYY-MM-DD, last day it is valid
    if(p.sp[s]==null)errs.push(`${w}: end date for ${s} but no special there`);
    else if(!/^\d{4}-\d{2}-\d{2}$/.test(p.su[s])||isNaN(new Date(p.su[s])))errs.push(`${w}: special end date for ${s} must be YYYY-MM-DD`);
    else if(p.su[s]<today)warns.push(`${w}: special at ${s} ended on ${p.su[s]} (the app hides it)`);
  });
  Object.keys(p.sp||{}).forEach(s=>{if(p.p[s]==null)errs.push(`${w}: special at ${s} but no regular price`);else if(!(p.sp[s]>0&&p.sp[s]<p.p[s]))errs.push(`${w}: special at ${s} must be below the regular price`)});
});
D.stores.forEach(s=>{
  if(D.dataMode==="catalogue-offers")return;
  const bs=D.branches[s]||[], names=new Set();
  if(!bs.length)errs.push(`No branches for ${s}`);
  bs.forEach((b,i)=>{ // branch = [name, latitude, longitude, price factor]; the first one is the default
    const [n,la,lo,f]=b||[];
    if(!n||typeof n!=="string")errs.push(`${s} branch ${i}: name is required (put the suburb or town in it so search works)`);
    else if(names.has(n))warns.push(`${s} branch ${i}: duplicate name "${n}"`);
    names.add(n);
    if(!(Number.isFinite(la)&&Math.abs(la)<=90&&Number.isFinite(lo)&&Math.abs(lo)<=180))errs.push(`${s} branch "${n}": bad coordinates`);
    if(!(Number.isFinite(f)&&f>0))errs.push(`${s} branch "${n}": price factor must be above 0`);
  });
});
D.categories.filter(c=>c!=="All"&&!D.products.some(p=>p.c===c)).forEach(c=>warns.push(`Category "${c}" has no products yet`));
if(warns.length)console.warn("Warnings:\n"+warns.map(e=>" - "+e).join("\n"));
if(errs.length){console.error(errs.map(e=>" - "+e).join("\n"));process.exit(1)}
console.log(`OK: ${D.products.length} products, ${D.stores.length} stores, updated ${D.updated}`);
