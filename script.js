/* ---------- DATA (generated into data/data.js by tools/import.js) ---------- */
const D=window.GC_DATA;
if(!D){
  const g=document.getElementById("grid");
  if(g)g.innerHTML='<p class="empty">The price data could not be loaded. Refresh the page. If this keeps happening, run npm run build-data.</p>';
  throw new Error("GC_DATA is missing: data/data.js did not load");
}
const STORES=D.stores, DOT=D.colors, CARD=D.cards, CATS=D.categories, UPDATED=D.updated, BR=D.branches||{}, I=D.products;
const CATALOGUE_OFFERS=D.dataMode==="catalogue-offers";
const PAGE=60;       // cards drawn at once, keeps search and sort fast with a big catalogue
const FAR_KM=75;     // a branch further than this from the user is treated as "none nearby"

/* ---------- STATE ---------- */
const $=id=>document.getElementById(id);
const R=v=>"R"+v.toFixed(2);
// product text goes into innerHTML and attributes, so escape it
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const todayStr=()=>{const n=new Date();return n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0");};
let TODAY=todayStr();
let S={list:{},stores:[...STORES],branch:{},loyalty:{}};
try{ Object.assign(S,JSON.parse(localStorage.getItem("gc")||"{}")); }catch(e){}
// a corrupted or outdated saved state must never break the page
const isObj=v=>v&&typeof v=="object"&&!Array.isArray(v);
const rawList=isObj(S.list)?S.list:{};
S.list={};
I.forEach(p=>{ const v=Math.min(99,Math.floor(Number(rawList[p.id]))); if(v>0)S.list[p.id]=v; });
S.branch=isObj(S.branch)?S.branch:{}; S.loyalty=isObj(S.loyalty)?S.loyalty:{};
STORES.forEach(s=>{
  const b=Number(S.branch[s]);
  S.branch[s]=!CATALOGUE_OFFERS&&Number.isInteger(b)&&b>=0&&b<(BR[s]||[]).length?b:0;
  S.loyalty[s]=!CATALOGUE_OFFERS&&S.loyalty[s]===true;
});
S.stores=(Array.isArray(S.stores)?S.stores:[]).filter(s=>STORES.includes(s)); if(!S.stores.length)S.stores=[...STORES];
let cat="All", copyText="", shown=PAGE;
const save=()=>{ try{localStorage.setItem("gc",JSON.stringify(S));}catch(e){} };
const HAY=new Map(I.map(p=>[p,[p.n,p.brand,p.s,p.c].filter(Boolean).join(" ").toLowerCase()]));

/* ---------- PRICING ---------- */
const fac=s=>CATALOGUE_OFFERS?1:BR[s][S.branch[s]][3];
const branchName=s=>CATALOGUE_OFFERS?"Catalogue offer":BR[s][S.branch[s]][0];
// a special counts only while its optional end date (p.su[store], YYYY-MM-DD) has not passed
const live=(p,s)=>p.sp&&p.sp[s]!=null&&!(p.su&&p.su[s]&&p.su[s]<TODAY);
// returns {reg, spec, eff, until} or null when the store does not stock the item
function price(p,s){
  const offer=p.of&&p.of[s];
  if(offer){
    if(offer.until&&offer.until<TODAY)return null;
    return {reg:p.p[s],spec:null,eff:p.p[s],until:offer.until,source:offer.source,offer:true};
  }
  if(p.p[s]==null)return null;
  const f=fac(s), reg=Math.round(p.p[s]*f*100)/100, on=live(p,s);
  const spec=on?Math.round(p.sp[s]*f*100)/100:null;
  return {reg,spec,eff:(S.loyalty[s]&&spec!=null)?spec:reg,until:on&&p.su?p.su[s]:null};
}
function lows(p){
  const v=S.stores.map(s=>price(p,s)).filter(Boolean).map(x=>x.eff);
  return v.length?{min:Math.min(...v),max:Math.max(...v)}:{min:0,max:0};
}
const shortDate=d=>new Date(d+"T00:00:00").toLocaleDateString("en-ZA",{day:"numeric",month:"short"});

/* ---------- CARDS ---------- */
function card(p){
  const {min,max}=lows(p), inList=S.list[p.id];
  const rowsH=S.stores.map(s=>{
    const x=price(p,s);
    const name=`<span class="st"><i class="dot" style="--c:${DOT[s]}"></i><span>${s}<small>${esc(branchName(s))}</small></span></span>`;
    if(!x)return `<div class="pr">${name}<span class="v na">${CATALOGUE_OFFERS?"No listed offer":"Not available"}</span></div>`;
    const best=x.eff===min&&max>min;
    if(x.offer){
      const source=`<small class="offer-note">Offer until ${shortDate(x.until)} · <a href="${esc(x.source)}" target="_blank" rel="noopener noreferrer">Source</a></small>`;
      return `<div class="pr">${name}<span class="v">${R(x.eff)}${source}</span></div>`;
    }
    const val=x.spec!=null
      ? `<span class="was">${R(x.reg)}</span><span class="sp">${R(x.spec)}</span>`
      : `<span class="${best?"best":""}">${R(x.reg)}</span>`;
    const tag=x.spec!=null?`<small class="sp">${CARD[s]} price${S.loyalty[s]?" (applied)":""}${x.until?", until "+shortDate(x.until):""}</small>`:"";
    const top=best&&x.spec!=null?`<small class="best">Cheapest</small>`:"";
    return `<div class="pr">${name}<span class="v ${best&&x.spec==null?"best":""}">${val}<small>${R(x.eff/p.d)}${esc(p.u)}</small>${tag}${top}</span></div>`;
  }).join("");
  const label=inList?`${esc(p.n)}: ${inList} in list. Add one more`:`Add ${esc(p.n)} to list`;
  return `<article class="card"><div class="card-top"><div><h3>${esc(p.n)}</h3><div class="meta">${esc(p.s)} &middot; ${esc(p.c)}</div></div>
  <button class="add ${inList?"on":""}" data-add="${p.id}" aria-label="${label}">${inList?inList:"+"}</button></div>
  <div class="prices">${rowsH}</div>${max>min?`<p class="save">Save up to ${R(max-min)}</p>`:""}</article>`;
}
function renderGrid(){
  TODAY=todayStr();
  const t=$("q").value.trim().toLowerCase().split(/\s+/).filter(Boolean), so=$("sort").value;
  let a=I.filter(p=>(cat=="All"||p.c==cat)&&t.every(w=>HAY.get(p).includes(w)));
  const L=new Map(a.map(p=>[p,lows(p)]));   // work out each product's prices once, not once per comparison
  if(so=="name")a.sort((x,y)=>x.n.localeCompare(y.n));
  if(so=="save")a.sort((x,y)=>(L.get(y).max-L.get(y).min)-(L.get(x).max-L.get(x).min));
  if(so=="low")a.sort((x,y)=>L.get(x).min-L.get(y).min);
  const part=a.slice(0,shown), left=a.length-part.length;
  $("status").textContent=left?`Showing ${part.length} of ${a.length} products`:`${a.length} product${a.length==1?"":"s"} shown`;
  $("grid").innerHTML=a.length
    ? part.map(card).join("")+(left?`<div class="more"><button class="btn ghost" data-more="1">Show more (${left} left)</button></div>`:"")
    : `<p class="empty">No products match. Try a different search or category.</p>`;
}
// a new search, category or sort starts again from the first page
const newView=()=>{ shown=PAGE; renderGrid(); };

/* ---------- LIST ---------- */
function renderList(){
  TODAY=todayStr();
  const ids=Object.keys(S.list).map(Number).filter(id=>I.some(p=>p.id==id));
  const items=ids.map(id=>({p:I.find(p=>p.id==id),q:S.list[id]}));
  $("count").textContent=items.reduce((a,i)=>a+i.q,0);
  $("items").innerHTML=items.length?items.map(({p,q})=>`<div class="li"><span>${esc(p.n)} <span class="meta">${esc(p.s)}</span></span>
   <span class="qty"><button data-q="${p.id}" data-d="-1" aria-label="Remove one ${esc(p.n)}">&minus;</button>${q}<button data-q="${p.id}" data-d="1" aria-label="Add one ${esc(p.n)}">+</button><button data-rm="${p.id}" aria-label="Remove ${esc(p.n)} from list">&times;</button></span></div>`).join("")
   :`<p class="empty">Your list is empty. Tap + on a product to add it.</p>`;
  if(!items.length){ copyText="";$("totals").innerHTML="";$("split").innerHTML="";return; }
  // store totals (only stores that stock every item can win)
  const T=S.stores.map(s=>{
    let t=0,miss=0; items.forEach(({p,q})=>{const x=price(p,s); x?t+=x.eff*q:miss++;});
    return {s,t:Math.round(t*100)/100,miss};
  });
  const full=T.filter(x=>!x.miss), best=full.length?Math.min(...full.map(x=>x.t)):null;
  $("totals").innerHTML=(CATALOGUE_OFFERS?"<h4>Listed offer subtotal by store</h4>":"<h4>Total at each store</h4>")+T.map(x=>{
    const win=!x.miss&&x.t===best;
    const d=x.miss?`${CATALOGUE_OFFERS?"No listed price for":"Missing"} ${x.miss} item${x.miss>1?"s":""}`:win?"Cheapest single store":`+${R(x.t-best)} more`;
    return `<div class="tot ${win?"best":""}"><span><i class="dot" style="--c:${DOT[x.s]}"></i> ${x.s}<span class="d">${esc(branchName(x.s))} &middot; ${d}</span></span><b>${R(x.t)}</b></div>`;
  }).join("")+(full.length?"":`<p class="note">${CATALOGUE_OFFERS?"No selected store has a listed offer for every item. The split below only totals offers found in the current catalogue listings.":"No selected store stocks every item on your list. The split below shows where to buy each one."}</p>`);
  // split shop
  const by={}, gone=[]; let st=0;
  items.forEach(({p,q})=>{
    let b=null; S.stores.forEach(s=>{const x=price(p,s); if(x&&(!b||x.eff<b.e))b={s,e:x.eff};});
    if(!b){gone.push(p.n);return;} st+=b.e*q; (by[b.s]=by[b.s]||[]).push(`${p.n}${q>1?" x"+q:""}`);
  });
  st=Math.round(st*100)/100; const diff=best!=null?Math.round((best-st)*100)/100:0;
  $("split").innerHTML=`<h4>Split your shop</h4><div class="split"><b class="best">${R(st)}</b> ${CATALOGUE_OFFERS?"for the listed offers":"if you buy each item at its cheapest store"}${!CATALOGUE_OFFERS&&diff>0.005?`, saving ${R(diff)} versus the best single store`:""}.
   <ul>${Object.keys(by).map(s=>`<li><b>${s}:</b> ${esc(by[s].join(", "))}</li>`).join("")}</ul>
   ${gone.length?`<p class="note">${CATALOGUE_OFFERS?"No current offer listed for":"Left out because no selected store stocks"} ${gone.length>1?"these items":"this item"}: ${esc(gone.join(", "))}.</p>`:""}</div>`;
  const cards=S.stores.filter(s=>S.loyalty[s]).map(s=>CARD[s]);
  copyText="My grocery list\n"+items.map(({p,q})=>`- ${p.n} (${p.s}) x${q}`).join("\n")
   +"\n\nTotals:\n"+T.map(x=>`${x.s} (${branchName(x.s)}): ${x.miss?"missing "+x.miss+" item(s)":R(x.t)}`).join("\n")
   +`\n\nSplit your shop: ${R(st)}\n`+Object.keys(by).map(s=>`${s}: ${by[s].join(", ")}`).join("\n")
   +(gone.length?`\n${CATALOGUE_OFFERS?"No current offer listed":"Not stocked"} at any selected store: ${gone.join(", ")}`:"")
   +(cards.length?`\n\nLoyalty prices included for: ${cards.join(", ")}.`:"")
   +`\n\nPrices last updated ${UPDATED}.`;
}

/* ---------- CONTROLS ---------- */
function renderChips(){
  $("cats").innerHTML=CATS.map(c=>`<button class="chip" data-cat="${esc(c)}" aria-pressed="${c==cat}">${esc(c)}</button>`).join("");
  $("stores").innerHTML=STORES.map(s=>`<button class="chip" data-st="${s}" aria-pressed="${S.stores.includes(s)}"><i class="dot" style="--c:${DOT[s]}"></i>${s}</button>`).join("");
}
// branch options for one store, narrowed by what the user typed (suburb or town is part of the branch name)
function brOpts(s,q){
  const t=q.toLowerCase().split(/\s+/).filter(Boolean), cur=S.branch[s];
  const hits=BR[s].map((b,i)=>i).filter(i=>t.every(w=>BR[s][i][0].toLowerCase().includes(w)));
  const list=hits.includes(cur)?hits:[cur,...hits];
  return (t.length&&!hits.length?`<option disabled>No branch matches your search</option>`:"")
    +list.map(i=>`<option value="${i}" ${cur==i?"selected":""}>${esc(BR[s][i][0])}</option>`).join("");
}
function renderBranches(){
  if(CATALOGUE_OFFERS){ $("br").hidden=true; return; }
  $("brbody").innerHTML=STORES.map(s=>`<div class="brrow"><span><i class="dot" style="--c:${DOT[s]}"></i> ${s}</span>
   <span class="brpick"><input type="search" class="brfind" data-brs="${s}" placeholder="Search suburb or town" aria-label="Search ${s} branches" autocomplete="off">
   <select data-br="${s}" aria-label="${s} branch">${brOpts(s,"")}</select></span>
   <label><input type="checkbox" data-loy="${s}" ${S.loyalty[s]?"checked":""}> I have ${CARD[s]}</label></div>`).join("");
}
function renderUpdated(){
  if(CATALOGUE_OFFERS){
    const saving=$('sort').querySelector('[value="save"]');
    if(saving)saving.hidden=true;
    const low=$('sort').querySelector('[value="low"]');
    if(low)low.textContent="Lowest listed offer";
  }
  const t=new Date(UPDATED+"T00:00:00"), ok=!isNaN(t), age=ok?Math.floor((Date.now()-t)/864e5):0;
  const d=ok?t.toLocaleDateString("en-ZA",{day:"numeric",month:"long",year:"numeric"}):"unknown";
  $("upd").innerHTML=CATALOGUE_OFFERS
    ?`Catalogue offers captured: ${d}. Offer prices are not regular shelf prices, product sizes may be missing, and offers may not apply at every local branch. Verify the linked catalogue before shopping.`
    :`Prices last updated: ${d}. Updated every 2 weeks, so specials can change before the next update. Purple prices need that store's loyalty card.`
    +(!ok?` <span class="warn">The update date is missing, so these prices may be out of date.</span>`
      :age>14?` <span class="warn">These prices are ${age} days old and may have changed.</span>`:"");
}
const refresh=()=>{save();renderChips();renderGrid();renderList();};

// put keyboard focus back on the same button after the page redraws it
function keepFocus(fn){
  const key=b=>JSON.stringify(Object.assign({},b.dataset));
  const a=document.activeElement, k=a&&a.dataset?key(a):"{}", inList=!!(a&&a.closest&&a.closest("#items"));
  fn();
  if(k!=="{}"){ const e=[...document.querySelectorAll("button")].find(b=>key(b)===k); if(e){e.focus();return;} }
  if(inList){ const f=document.querySelector("#items button")||$("jump"); f.focus(); }   // the item was removed, so land somewhere sensible
}
document.addEventListener("click",e=>{
  const t=e.target.closest("button"); if(!t)return;
  keepFocus(()=>{
  if(t.dataset.add){ const id=t.dataset.add; S.list[id]=Math.min(99,(S.list[id]||0)+1); refresh(); }
  else if(t.dataset.q){ const id=t.dataset.q; S.list[id]=Math.min(99,(S.list[id]||0)+Number(t.dataset.d)); if(S.list[id]<=0)delete S.list[id]; refresh(); }
  else if(t.dataset.rm){ delete S.list[t.dataset.rm]; refresh(); }
  else if(t.dataset.more){ shown+=PAGE; renderGrid(); }
  else if(t.dataset.cat){ cat=t.dataset.cat; shown=PAGE; renderChips(); renderGrid(); }
  else if(t.dataset.st){ const s=t.dataset.st,i=S.stores.indexOf(s); if(i>-1){ if(S.stores.length>1)S.stores.splice(i,1); } else S.stores.push(s); S.stores.sort((a,b)=>STORES.indexOf(a)-STORES.indexOf(b)); refresh(); }
  });
});
$("q").addEventListener("input",newView);
$("sort").addEventListener("change",newView);
$("jump").onclick=()=>$("panel").scrollIntoView({behavior:window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
$("br").addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.br)S.branch[t.dataset.br]=Number(t.value);
  else if(t.dataset.loy)S.loyalty[t.dataset.loy]=t.checked;
  else return;
  refresh();
});
// typing in a branch search box narrows that store's list without redrawing the box
$("br").addEventListener("input",e=>{
  const t=e.target, s=t.dataset&&t.dataset.brs; if(!s)return;
  const sel=[...$("brbody").querySelectorAll("select")].find(x=>x.dataset.br===s);
  if(sel)sel.innerHTML=brOpts(s,t.value);
});
$("geo").onclick=()=>{
  const m=$("geomsg");
  if(!navigator.geolocation){m.textContent="Location is not available in this browser. Pick branches above.";return;}
  m.textContent="Finding your nearest branches...";
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude:a,longitude:o}=pos.coords;
    const km=(la,lo)=>{const r=x=>x*Math.PI/180,h=Math.sin(r(la-a)/2)**2+Math.cos(r(a))*Math.cos(r(la))*Math.sin(r(lo-o)/2)**2;return 12742*Math.asin(Math.sqrt(h));};
    const far=[];
    STORES.forEach(s=>{
      let b=0,bd=Infinity; BR[s].forEach((x,i)=>{ const dk=km(x[1],x[2]); if(dk<bd){bd=dk;b=i;} });
      if(bd<=FAR_KM)S.branch[s]=b; else far.push(s);   // too far away: keep the branch they had
    });
    const list=far.length>1?far.slice(0,-1).join(", ")+" or "+far[far.length-1]:far[0];
    m.textContent=!far.length?"Nearest branches selected."
      : far.length==STORES.length?`None of these stores has a branch within ${FAR_KM} km of you, so your branches stay as they are. Pick one above if you like.`
      : `Nearest branches selected. There is no ${list} branch within ${FAR_KM} km of you, so ${far.length>1?"those stores keep":"that store keeps"} the branch shown. Pick another above if you like.`;
    renderBranches(); refresh();
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
