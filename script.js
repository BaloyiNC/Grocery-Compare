/* ---------- DATA (generated into data/data.js by tools/import.js) ---------- */
const D=window.GC_DATA;
const STORES=D.stores, DOT=D.colors, CARD=D.cards, CATS=D.categories, UPDATED=D.updated, BR=D.branches, I=D.products;

/* ---------- STATE ---------- */
const $=id=>document.getElementById(id);
const R=v=>"R"+v.toFixed(2);
let S={list:{},stores:[...STORES],branch:{},loyalty:{}};
try{ Object.assign(S,JSON.parse(localStorage.getItem("gc")||"{}")); }catch(e){}
// a corrupted or outdated saved state must never break the page
const isObj=v=>v&&typeof v=="object"&&!Array.isArray(v);
S.list=Object.fromEntries(Object.entries(isObj(S.list)?S.list:{}).map(([k,v])=>[k,Math.min(99,Math.floor(Number(v)))]).filter(([k,v])=>I.some(p=>p.id==k)&&v>0));
S.branch=isObj(S.branch)?S.branch:{}; S.loyalty=isObj(S.loyalty)?S.loyalty:{};
STORES.forEach(s=>{ if(!BR[s][S.branch[s]])S.branch[s]=0; });
S.stores=(Array.isArray(S.stores)?S.stores:[]).filter(s=>STORES.includes(s)); if(!S.stores.length)S.stores=[...STORES];
let cat="All", copyText="";
const save=()=>{ try{localStorage.setItem("gc",JSON.stringify(S));}catch(e){} };

/* ---------- PRICING ---------- */
const fac=s=>BR[s][S.branch[s]][3];
// returns {reg, spec, eff} or null when the store does not stock the item
function price(p,s){
  if(p.p[s]==null)return null;
  const reg=Math.round(p.p[s]*fac(s)*100)/100;
  const spec=p.sp[s]!=null?Math.round(p.sp[s]*fac(s)*100)/100:null;
  return {reg,spec,eff:(S.loyalty[s]&&spec!=null)?spec:reg};
}
function lows(p){
  const v=S.stores.map(s=>price(p,s)).filter(Boolean).map(x=>x.eff);
  return v.length?{min:Math.min(...v),max:Math.max(...v)}:{min:0,max:0};
}

/* ---------- CARDS ---------- */
function card(p){
  const {min,max}=lows(p), inList=S.list[p.id];
  const rowsH=S.stores.map(s=>{
    const x=price(p,s);
    const name=`<span class="st"><i class="dot" style="--c:${DOT[s]}"></i>${s}</span>`;
    if(!x)return `<div class="pr">${name}<span class="v na">Not available</span></div>`;
    const best=x.eff===min&&max>min;
    const val=x.spec!=null
      ? `<span class="was">${R(x.reg)}</span><span class="sp">${R(x.spec)}</span>`
      : `<span class="${best?"best":""}">${R(x.reg)}</span>`;
    const tag=x.spec!=null?`<small class="sp">${CARD[s]} price${S.loyalty[s]?" (applied)":""}</small>`:"";
    return `<div class="pr">${name}<span class="v ${best&&x.spec==null?"best":""}">${val}<small>${R(x.eff/p.d)}${p.u}</small>${tag}</span></div>`;
  }).join("");
  return `<article class="card"><div class="card-top"><div><h3>${p.n}</h3><div class="meta">${p.s} &middot; ${p.c}</div></div>
  <button class="add ${inList?"on":""}" data-add="${p.id}" aria-label="Add ${p.n} to list">${inList?inList:"+"}</button></div>
  <div class="prices">${rowsH}</div>${max>min?`<p class="save">Save up to ${R(max-min)}</p>`:""}</article>`;
}
function renderGrid(){
  const q=$("q").value.trim().toLowerCase(), so=$("sort").value;
  let a=I.filter(p=>(cat=="All"||p.c==cat)&&p.n.toLowerCase().includes(q));
  const sv=p=>{const l=lows(p);return l.max-l.min};
  if(so=="name")a.sort((x,y)=>x.n.localeCompare(y.n));
  if(so=="save")a.sort((x,y)=>sv(y)-sv(x));
  if(so=="low")a.sort((x,y)=>lows(x).min-lows(y).min);
  $("status").textContent=`${a.length} product${a.length==1?"":"s"} shown`;
  $("grid").innerHTML=a.length?a.map(card).join(""):`<p class="empty">No products match. Try a different search or category.</p>`;
}

/* ---------- LIST ---------- */
function renderList(){
  const ids=Object.keys(S.list).map(Number).filter(id=>I.some(p=>p.id==id));
  const items=ids.map(id=>({p:I.find(p=>p.id==id),q:S.list[id]}));
  $("count").textContent=items.reduce((a,i)=>a+i.q,0);
  $("items").innerHTML=items.length?items.map(({p,q})=>`<div class="li"><span>${p.n} <span class="meta">${p.s}</span></span>
   <span class="qty"><button data-q="${p.id}" data-d="-1" aria-label="Less">&minus;</button>${q}<button data-q="${p.id}" data-d="1" aria-label="More">+</button></span></div>`).join("")
   :`<p class="empty">Your list is empty. Tap + on a product to add it.</p>`;
  if(!items.length){ copyText="";$("totals").innerHTML="";$("split").innerHTML="";return; }
  // store totals (only stores that stock every item can win)
  const T=S.stores.map(s=>{
    let t=0,miss=0; items.forEach(({p,q})=>{const x=price(p,s); x?t+=x.eff*q:miss++;});
    return {s,t:Math.round(t*100)/100,miss};
  });
  const full=T.filter(x=>!x.miss), best=full.length?Math.min(...full.map(x=>x.t)):null;
  $("totals").innerHTML="<h4>Total at each store</h4>"+T.map(x=>{
    const win=!x.miss&&x.t===best;
    const d=x.miss?`Missing ${x.miss} item${x.miss>1?"s":""}`:win?"Cheapest single store":`+${R(x.t-best)} more`;
    return `<div class="tot ${win?"best":""}"><span><i class="dot" style="--c:${DOT[x.s]}"></i> ${x.s}<span class="d">${BR[x.s][S.branch[x.s]][0]} &middot; ${d}</span></span><b>${R(x.t)}</b></div>`;
  }).join("");
  // split shop
  const by={}; let st=0, ok=true;
  items.forEach(({p,q})=>{
    let b=null; S.stores.forEach(s=>{const x=price(p,s); if(x&&(!b||x.eff<b.e))b={s,e:x.eff};});
    if(!b){ok=false;return;} st+=b.e*q; (by[b.s]=by[b.s]||[]).push(`${p.n}${q>1?" x"+q:""}`);
  });
  st=Math.round(st*100)/100; const diff=best!=null?Math.round((best-st)*100)/100:0;
  $("split").innerHTML=`<h4>Split your shop</h4><div class="split"><b class="best">${R(st)}</b> if you buy each item at its cheapest store${diff>0.005?`, saving ${R(diff)} versus the best single store`:""}.
   <ul>${Object.keys(by).map(s=>`<li><b>${s}:</b> ${by[s].join(", ")}</li>`).join("")}</ul></div>`;
  copyText="My grocery list\n"+items.map(({p,q})=>`- ${p.n} (${p.s}) x${q}`).join("\n")
   +"\n\nTotals:\n"+T.map(x=>`${x.s} (${BR[x.s][S.branch[x.s]][0]}): ${x.miss?"missing "+x.miss+" item(s)":R(x.t)}`).join("\n")
   +`\n\nSplit your shop: ${R(st)}\n`+Object.keys(by).map(s=>`${s}: ${by[s].join(", ")}`).join("\n")
   +`\n\nPrices last updated ${UPDATED}.`;
}

/* ---------- CONTROLS ---------- */
function renderChips(){
  $("cats").innerHTML=CATS.map(c=>`<button class="chip" data-cat="${c}" aria-pressed="${c==cat}">${c}</button>`).join("");
  $("stores").innerHTML=STORES.map(s=>`<button class="chip" data-st="${s}" aria-pressed="${S.stores.includes(s)}"><i class="dot" style="--c:${DOT[s]}"></i>${s}</button>`).join("");
}
function renderBranches(){
  $("brbody").innerHTML=STORES.map(s=>`<div class="brrow"><span><i class="dot" style="--c:${DOT[s]}"></i> ${s}</span>
   <select data-br="${s}" aria-label="${s} branch">${BR[s].map((b,i)=>`<option value="${i}" ${S.branch[s]==i?"selected":""}>${b[0]}</option>`).join("")}</select>
   <label><input type="checkbox" data-loy="${s}" ${S.loyalty[s]?"checked":""}> I have ${CARD[s]}</label></div>`).join("");
}
function renderUpdated(){
  const age=Math.floor((Date.now()-new Date(UPDATED+"T00:00:00"))/864e5);
  const d=new Date(UPDATED+"T00:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"});
  $("upd").innerHTML=`Prices last updated: ${d}. Updated every 2 weeks.${age>14?` <span class="warn">These prices are ${age} days old and may have changed.</span>`:""} Purple prices need that store's loyalty card.`;
}
const refresh=()=>{save();renderChips();renderGrid();renderList();};

function keepFocus(fn){
  const a=document.activeElement;
  const k=a&&a.dataset?Object.entries(a.dataset).map(([n,v])=>`[data-${n.replace(/[A-Z]/g,m=>"-"+m.toLowerCase())}="${v}"]`).join(""):"";
  fn(); if(k){ const e=document.querySelector(k); if(e)e.focus(); }
}
document.addEventListener("click",e=>{
  const t=e.target.closest("button"); if(!t)return;
  keepFocus(()=>{
  if(t.dataset.add){ const id=t.dataset.add; S.list[id]=Math.min(99,(S.list[id]||0)+1); refresh(); }
  else if(t.dataset.q){ const id=t.dataset.q; S.list[id]=Math.min(99,(S.list[id]||0)+Number(t.dataset.d)); if(S.list[id]<=0)delete S.list[id]; refresh(); }
  else if(t.dataset.cat){ cat=t.dataset.cat; renderChips(); renderGrid(); }
  else if(t.dataset.st){ const s=t.dataset.st,i=S.stores.indexOf(s); if(i>-1){ if(S.stores.length>1)S.stores.splice(i,1); } else S.stores.push(s); S.stores.sort((a,b)=>STORES.indexOf(a)-STORES.indexOf(b)); refresh(); }
  });
});
$("q").addEventListener("input",renderGrid);
$("sort").addEventListener("change",renderGrid);
$("jump").onclick=()=>$("panel").scrollIntoView({behavior:window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
$("br").addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.br)S.branch[t.dataset.br]=Number(t.value);
  if(t.dataset.loy)S.loyalty[t.dataset.loy]=t.checked;
  refresh();
});
$("geo").onclick=()=>{
  const m=$("geomsg");
  if(!navigator.geolocation){m.textContent="Location is not available in this browser. Pick branches above.";return;}
  m.textContent="Finding your nearest branches...";
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude:a,longitude:o}=pos.coords;
    const km=(la,lo)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(la-a)/2)**2+Math.cos(r(a))*Math.cos(r(la))*Math.sin(r(lo-o)/2)**2;return 12742*Math.asin(Math.sqrt(h));};
    STORES.forEach(s=>{ let b=0; BR[s].forEach((x,i)=>{ if(km(x[1],x[2])<km(BR[s][b][1],BR[s][b][2]))b=i; }); S.branch[s]=b; });
    m.textContent="Nearest branches selected."; renderBranches(); refresh();
  },()=>{m.textContent="Could not get your location. Pick your branches above instead.";},{timeout:10000});
};
$("copy").onclick=async()=>{
  if(!copyText)return;
  let ok=false;
  try{ await navigator.clipboard.writeText(copyText); ok=true; }catch(e){
    try{ const ta=document.createElement("textarea"); ta.value=copyText; document.body.appendChild(ta); ta.select(); ok=document.execCommand("copy"); ta.remove(); }catch(e2){}
  }
  $("copy").textContent=ok?"Copied":"Copy failed";
  setTimeout(()=>$("copy").textContent="Copy list",1500);
};
$("clear").onclick=()=>{ if(Object.keys(S.list).length&&confirm("Remove every item from your list?")){ S.list={}; refresh(); } };

renderBranches(); renderUpdated(); refresh();
