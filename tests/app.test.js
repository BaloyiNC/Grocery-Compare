const {JSDOM}=require("jsdom"),fs=require("fs"),P=require("path").join(__dirname,"..")+"/";
function fixtureData(){
  const stores=["Checkers","Pick n Pay","Spar","Woolworths"];
  const products=[
    {id:1,n:"Full cream milk",c:"Dairy",s:"2 L",d:2,u:"/L",brand:"Sample Brand",p:{"Checkers":34.99,"Pick n Pay":35.99,"Spar":36.49,"Woolworths":37.99},sp:{"Checkers":29.99}},
    {id:2,n:"Low fat milk",c:"Dairy",s:"2 L",d:2,u:"/L",brand:"Sample Brand",p:{"Checkers":33.99,"Pick n Pay":34.49,"Spar":35.99,"Woolworths":36.99}},
    {id:3,n:"Plain yoghurt",c:"Dairy",s:"1 kg",d:1,u:"/kg",brand:"Sample Brand",p:{"Checkers":39.99,"Pick n Pay":42.99,"Spar":41.99,"Woolworths":44.99}},
    {id:4,n:"Cheddar cheese",c:"Dairy",s:"400 g",d:4,u:"/100 g",brand:"Sample Brand",p:{"Checkers":69.99,"Pick n Pay":72.99,"Spar":74.99,"Woolworths":79.99}},
    {id:5,n:"Free range eggs",c:"Dairy",s:"18 pack",d:18,u:"/egg",brand:"Sample Farm",p:{"Checkers":79.99,"Pick n Pay":82.99,"Spar":84.99,"Woolworths":89.99}},
    {id:6,n:"White bread",c:"Bakery",s:"700 g",d:7,u:"/100 g",brand:"Sample Bakery",p:{"Checkers":18.99,"Pick n Pay":19.99,"Spar":20.49}},
  ];
  for(let id=7;id<=26;id++)products.push({id,n:`Sample item ${id}`,c:"Pantry",s:"1 pack",d:1,u:"/pack",brand:`Sample Brand ${id}`,p:{"Checkers":10+id,"Pick n Pay":11+id,"Spar":12+id,"Woolworths":13+id}});
  return {
    stores,colors:{"Checkers":"#00a9dd","Pick n Pay":"#5856de","Spar":"#bd4be5","Woolworths":"#2f2f2f"},
    cards:{"Checkers":"Xtra Savings","Pick n Pay":"Smart Shopper","Spar":"Rewards","Woolworths":"WRewards"},
    categories:["All","Dairy","Bakery","Pantry"],updated:"2026-10-31",
    branches:{
      "Checkers":[["Sample CBD",-33.9249,18.4241,1.02],["Sample Sea Point",-33.9172,18.3892,1]],
      "Pick n Pay":[["Sample CBD",-33.925,18.424,1],["Sample Claremont",-33.9806,18.4652,1.03]],
      "Spar":[["Sample CBD",-33.9252,18.4243,.99],["Sample Observatory",-33.9367,18.467,1.02]],
      "Woolworths":[["Sample CBD",-33.9251,18.4242,1.01],["Sample Claremont",-33.9808,18.465,1.04]]
    },
    products
  };
}
function boot(store,patch,useFixture=true){
  const dom=new JSDOM(fs.readFileSync(P+"index.html","utf8").replace(/<script src[^>]*><\/script>/g,"").replace(/<link[^>]*>/g,""),{runScripts:"outside-only",url:"https://x.test/"});
  const w=dom.window; if(store)w.localStorage.setItem("gc",store);
  w.eval(fs.readFileSync(P+"data/data.js","utf8")); if(useFixture)w.GC_DATA=fixtureData(); if(patch)patch(w.GC_DATA); w.eval(fs.readFileSync(P+"script.js","utf8").replace(/^const /gm,"var ").replace(/^let /gm,"var "));
  return w;
}
let fails=0;const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)fails++;};
{
  const real=boot(null,null,false), d=real.document;
  ok(real.GC_DATA.dataMode==="catalogue-offers"&&real.GC_DATA.sampleData===false&&real.GC_DATA.products.length===34,"loads dated My Catalogue offer data instead of demo prices");
  ok(d.getElementById("br").hidden&&/catalogue offers/i.test(d.getElementById("upd").textContent),"hides unsupported branch and loyalty controls and explains offer limits");
  ok(d.querySelector('#sort [value="save"]').hidden&&d.querySelector('#sort [value="low"]').textContent==="Lowest listed offer","does not offer unsupported savings sorting in catalogue mode");
  ok(!!d.querySelector('#grid [data-add="1"]')&&/Source/.test(d.querySelector('#grid [data-add="1"]').closest(".card").textContent),"displays source links for listed catalogue offers");
  const expired=boot(null,D=>{D.products[0].of.Checkers.until="2000-01-01";},false);
  ok(/No listed offer/.test(expired.document.querySelector('#grid [data-add="1"]').closest(".card").textContent),"does not show an expired catalogue offer");
}
let w=boot(), d=w.document, $=id=>d.getElementById(id);
ok($("grid").querySelectorAll(".card").length==26,"renders 26 cards");
const add=$("grid").querySelector('[data-add="1"]'); add.focus(); add.click();
ok($("count").textContent=="1","add updates badge");
ok(d.activeElement.dataset.add=="1","focus kept on add button after re-render");
d.querySelector('[data-add="1"]').click(); ok(JSON.parse(w.localStorage.getItem("gc")).list[1]==2,"qty saved to localStorage");
const minus=d.querySelector('[data-q="1"][data-d="-1"]'); minus.focus(); minus.click();
ok(d.activeElement.dataset.q=="1","focus kept on qty button");
for(let i=0;i<120;i++)d.querySelector('[data-add="1"]').click(); ok(JSON.parse(w.localStorage.getItem("gc")).list[1]==99,"quantity capped at 99");
ok(/Missing 1 item/.test($("totals").textContent)==false,"milk list has no missing items");
d.querySelector('[data-add="6"]').click(); // white bread, not at Woolworths
ok(/Missing 1 item/.test($("totals").textContent),"store missing an item flagged, not ranked");
ok(/Not available/.test($("grid").innerHTML),"card shows Not available");
["Checkers","Pick n Pay","Spar"].forEach(s=>d.querySelector(`[data-st="${s}"]`).click());
d.querySelector('[data-st="Woolworths"]').click();
ok(JSON.parse(w.localStorage.getItem("gc")).stores.join()=="Woolworths","last selected store cannot be turned off");
w.confirm=()=>true; $("clear").click(); ok($("count").textContent=="0"&&$("totals").innerHTML=="","clear list empties everything");
$("q").value="zzzz"; $("q").dispatchEvent(new w.Event("input")); ok(/No products match/.test($("grid").innerHTML)&&$("status").textContent.startsWith("0 "),"empty search state + status");
w=boot('{"list":{"1":"abc","999":3,"2":-4,"3":2.7},"stores":"oops","branch":{"Spar":42},"loyalty":null}'); d=w.document;
ok(d.getElementById("count").textContent=="2","corrupted storage sanitised (only id 3 x2 kept)");
w=boot("not json{{"); ok(w.document.querySelectorAll(".card").length==26,"invalid JSON in storage does not break page");
w=boot(); d=w.document; d.querySelector('[data-add="1"]').click();
const sp=d.querySelector('[data-loy="Checkers"]'); sp.checked=true; sp.dispatchEvent(new w.Event("change",{bubbles:true}));
const tt=d.getElementById("totals").textContent.replace(/\s+/g," ");console.log(tt.slice(0,160));ok(/Checkers.*R30\.59/.test(tt),"loyalty toggle applies Checkers special (29.99 x 1.02 = 30.59)");

/* ---------- sprint 5, 6, 7, 8 additions ---------- */
{
  const fire=(w,el,type)=>el.dispatchEvent(new w.Event(type,{bubbles:true}));
  const money=(v)=>"R"+v.toFixed(2);
  // sprint 5: branch name under each store in the price rows, search by suburb/town, nothing-nearby handling
  w=boot(); d=w.document; const GD=w.GC_DATA, ck=GD.branches.Checkers;
  ok(d.querySelector("#grid .pr .st").textContent.includes(ck[0][0]),"price rows show the selected branch name");
  const find=d.querySelector('[data-brs="Checkers"]'), sel=d.querySelector('select[data-br="Checkers"]');
  const last=ck.length-1; find.value=ck[last][0].toUpperCase(); fire(w,find,"input");
  ok([...sel.options].some(o=>o.textContent==ck[last][0]),"branch search finds a branch (any letter case)");
  find.value="zzzz nothing"; fire(w,find,"input");
  ok(/No branch matches/.test(sel.innerHTML)&&sel.value==="0","branch search with no match says so and keeps the current branch");
  find.value=""; fire(w,find,"input"); sel.value=String(last); fire(w,sel,"change");
  ok(JSON.parse(w.localStorage.getItem("gc")).branch.Checkers==last,"chosen branch is saved");
  ok(d.querySelector("#grid .pr .st").textContent.includes(ck[last][0]),"row shows the newly chosen branch");
  let here={latitude:0,longitude:0}; Object.defineProperty(w.navigator,"geolocation",{value:{getCurrentPosition:(f)=>f({coords:here})}});
  d.getElementById("geo").click();
  ok(/within 75 km/.test(d.getElementById("geomsg").textContent)&&JSON.parse(w.localStorage.getItem("gc")).branch.Checkers==last,"no branch nearby: message shown and the branch is kept");
  here={latitude:ck[0][1],longitude:ck[0][2]};
  d.getElementById("geo").click();
  ok(JSON.parse(w.localStorage.getItem("gc")).branch.Checkers==0,"use my location picks the nearest Checkers branch");

  // sprint 6: specials respect their end date
  const reg1=(f)=>Math.round(GD.products[0].p.Checkers*f*100)/100, f0=ck[0][3];
  w=boot('{"loyalty":{"Checkers":true}}',D=>{D.products[0].su={Checkers:"2000-01-01"};}); d=w.document;
  ok(!/Xtra Savings price/.test(d.getElementById("grid").textContent),"expired special is hidden on the card");
  d.querySelector('[data-add="1"]').click();
  ok(d.getElementById("totals").textContent.includes(money(reg1(f0))),"expired special is not used in totals");
  w=boot('{"loyalty":{"Checkers":true}}',D=>{D.products[0].su={Checkers:"2999-12-31"};}); d=w.document;
  ok(/Xtra Savings price \(applied\), until/.test(d.getElementById("grid").textContent),"live special shows its end date");
  d.querySelector('[data-add="1"]').click();
  ok(d.getElementById("totals").textContent.includes(money(Math.round(29.99*f0*100)/100)),"live special is used in totals");

  // sprint 7: freshness
  w=boot(null,D=>{D.updated="2020-01-01";}); d=w.document;
  ok(/days old/.test(d.querySelector("#upd .warn").textContent),"old data shows a warning banner");
  w=boot(null,D=>{D.updated="not a date";}); d=w.document;
  ok(!!d.querySelector("#upd .warn")&&!/NaN/.test(d.getElementById("upd").textContent),"bad update date warns without showing NaN");
  w=boot(); ok(/specials can change/.test(w.document.getElementById("upd").textContent)&&!w.document.querySelector("#upd .warn"),"fresh data: specials note, no warning");

  // sprint 8: safety and edge cases
  w=boot('{"list":{"01":3,"1":2},"branch":{"Checkers":"constructor"}}'); d=w.document;
  ok(d.getElementById("count").textContent=="2"&&!/NaN|undefined/.test(d.body.textContent),"odd saved keys and branch values never show NaN");
  w=boot(null,D=>{D.products[0].n='Milk "Fresh" <b>&</b>';}); d=w.document;
  const mc=d.querySelector('[data-add="1"]').closest(".card"); ok(!mc.querySelector("h3 b")&&mc.querySelector("h3").textContent.includes('"Fresh" <b>&</b>'),"product names are escaped, not run as HTML");
  ok(d.querySelector('[data-add="1"]').getAttribute("aria-label")=='Add Milk "Fresh" <b>&</b> to list',"quotes in a name do not break the screen reader label");
  w=boot(null,D=>{D.categories.push('Odd "cat"');}); d=w.document;
  const chip=[...d.querySelectorAll("[data-cat]")].pop(); chip.focus(); chip.click();
  ok(d.activeElement.dataset.cat=='Odd "cat"',"focus survives a category with a quote in its name");
  w=boot('{"list":{"1":99}}'); d=w.document; const rm=d.querySelector('[data-rm="1"]'); rm.focus(); rm.click();
  ok(d.getElementById("count").textContent=="0","remove button clears an item in one tap");
  ok(d.activeElement.id=="jump","keyboard focus lands on a real control after the last item is removed");
  w=boot(); d=w.document; d.querySelector('[data-add="1"]').click();
  ok(/Remove one/.test(d.querySelector('[data-q="1"][data-d="-1"]').getAttribute("aria-label"))&&/Add one/.test(d.querySelector('[data-q="1"][data-d="1"]').getAttribute("aria-label")),"quantity buttons name the product for screen readers");
  w=boot(); d=w.document; d.querySelector('[data-add="6"]').click(); // white bread: not at Woolworths
  ["Checkers","Pick n Pay","Spar"].forEach(s=>d.querySelector(`[data-st="${s}"]`).click());
  ok(/No selected store stocks every item/.test(d.getElementById("totals").textContent)&&/Left out because no selected store stocks this item/.test(d.getElementById("split").textContent),"when no store has everything, the page says so and names what was left out");
  w=boot(); d=w.document; d.querySelector('[data-add="1"]').click(); d.querySelector('[data-add="6"]').click();
  const loy=d.querySelector('[data-loy="Checkers"]'); loy.checked=true; fire(w,loy,"change");
  ok(!/NaN|undefined/.test(d.getElementById("totals").textContent+d.getElementById("split").textContent)&&/Missing 1 item/.test(d.getElementById("totals").textContent),"loyalty on with a list that has a gap: no NaN, gap still flagged");
  let g=null; try{ const dom=new JSDOM(fs.readFileSync(P+"index.html","utf8").replace(/<script src[^>]*><\/script>/g,"").replace(/<link[^>]*>/g,""),{runScripts:"outside-only"}); try{dom.window.eval(fs.readFileSync(P+"script.js","utf8"));}catch(e){} g=dom.window.document.getElementById("grid").textContent; }catch(e){}
  ok(/price data could not be loaded/.test(g||""),"missing data file shows a clear message");
  // search: brand and several words
  w=boot(); d=w.document; const q=d.getElementById("q"); q.value="full milk"; fire(w,q,"input");
  ok(d.querySelectorAll(".card").length>=1&&/Full cream milk/.test(d.getElementById("grid").textContent),"search matches several words in any order");
  // performance with a big catalogue
  const big=(D)=>{const b=D.products.slice();for(let i=0;i<4000;i++){const c=JSON.parse(JSON.stringify(b[i%b.length]));c.id=1000+i;c.n=c.n+" "+i;c.barcode=null;D.products.push(c);}};
  let t0=Date.now(); w=boot(null,big); d=w.document; const bootMs=Date.now()-t0;
  ok(d.querySelectorAll(".card").length==60&&/Show more \(\d+ left\)/.test(d.getElementById("grid").textContent),"big catalogue draws one page of 60 cards with a Show more button");
  t0=Date.now(); const so=d.getElementById("sort"); so.value="save"; fire(w,so,"change"); so.value="low"; fire(w,so,"change"); q.value="milk"; const q2=d.getElementById("q"); q2.value="milk"; fire(w,q2,"input");
  const opMs=Date.now()-t0;
  console.log(`  timing with ~4,000 products: first load ${bootMs} ms, two sorts and a search ${opMs} ms`);
  ok(bootMs<3000&&opMs<1500,"big catalogue loads and sorts quickly");
  w=boot(null,big); d=w.document; d.querySelector('[data-more="1"]').click();
  ok(d.querySelectorAll(".card").length==120,"Show more adds another page");
}
console.log(fails?fails+" FAILED":"all passed");
if(fails)process.exitCode=1;
