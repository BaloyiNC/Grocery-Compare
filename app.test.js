const {JSDOM}=require("jsdom"),fs=require("fs"),P=require("path").join(__dirname,"..")+"/";
function boot(store){
  const dom=new JSDOM(fs.readFileSync(P+"index.html","utf8").replace(/<script src[^>]*><\/script>/g,"").replace(/<link[^>]*>/g,""),{runScripts:"outside-only",url:"https://x.test/"});
  const w=dom.window; if(store)w.localStorage.setItem("gc",store);
  w.eval(fs.readFileSync(P+"data/data.js","utf8")); w.eval(fs.readFileSync(P+"script.js","utf8").replace(/^const /gm,"var ").replace(/^let /gm,"var "));
  return w;
}
let fails=0;const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)fails++;};
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
console.log(fails?fails+" FAILED":"all passed");
