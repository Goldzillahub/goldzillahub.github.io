
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k, fallback){ try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch{return fallback}},
  set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};

const seedResults = [
  {id:1,group:1,date:"2026-08-13",side:"BUY",title:"London Buy Level",pips:400,r:2.4,status:"win"},
  {id:2,group:1,date:"2026-08-12",side:"SELL",title:"New York Sell Level",pips:330,r:2.0,status:"win"},
  {id:3,group:2,date:"2026-08-11",side:"BUY",title:"First Buy Level",pips:180,r:1.8,status:"win"},
  {id:4,group:2,date:"2026-08-10",side:"SELL",title:"First Sell Level",pips:-55,r:-1,status:"loss"},
  {id:5,group:1,date:"2026-08-09",side:"SELL",title:"Second Sell Level",pips:220,r:2,status:"win"}
];
const seedLevels = [
  {id:1,date:"2026-08-16",session:"London",type:"BUY",level:2375,sl:2370,tp1:2385,tp2:2395,status:"win",pips:200},
  {id:2,date:"2026-08-16",session:"London",type:"BUY",level:2365,sl:2360,tp1:2375,tp2:2385,status:"pending",pips:0},
  {id:3,date:"2026-08-16",session:"New York",type:"SELL",level:2398,sl:2403,tp1:2388,tp2:2378,status:"loss",pips:-150},
  {id:4,date:"2026-08-15",session:"New York",type:"SELL",level:2410,sl:2415,tp1:2400,tp2:2390,status:"win",pips:330}
];
const seedJournal = [
  {id:1,date:"2026-08-13",session:"London",side:"BUY",entry:2400,sl:2395,tp:2410,result:"win",pips:1000,r:2,grade:"A+"},
  {id:2,date:"2026-08-12",session:"New York",side:"SELL",entry:2430,sl:2435,tp:2420,result:"win",pips:1000,r:2,grade:"A"},
  {id:3,date:"2026-08-11",session:"London",side:"BUY",entry:2410,sl:2405,tp:2405,result:"loss",pips:-500,r:-1,grade:"B"}
];
const seedAnnouncements = [
  {id:1,date:"2026-08-16",title:"London Session Levels",body:"New levels will be updated before London session. Stay focused and manage risk."},
  {id:2,date:"2026-08-15",title:"Risk Reminder",body:"Always use fixed risk. One trade should never decide your week."}
];

let results = store.get("gz_results", seedResults);
let levels = store.get("gz_levels", seedLevels);
let journal = store.get("gz_journal", seedJournal);
let announcements = store.get("gz_announcements", seedAnnouncements);
let settings = store.get("gz_settings", {group1:"#",group2:"#"});
let admin = sessionStorage.getItem("gz_admin")==="1";

function fmt(v,n=2){return Number(v||0).toFixed(n)}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function saveAll(){store.set("gz_results",results);store.set("gz_levels",levels);store.set("gz_journal",journal);store.set("gz_announcements",announcements)}
function calcStats(){
  const total=journal.length,wins=journal.filter(x=>x.result==="win").length,losses=journal.filter(x=>x.result==="loss").length;
  const wr=total?wins/total*100:0,totalR=journal.reduce((a,b)=>a+Number(b.r||0),0);
  const winR=journal.filter(x=>x.r>0).reduce((a,b)=>a+b.r,0), lossR=Math.abs(journal.filter(x=>x.r<0).reduce((a,b)=>a+b.r,0));
  const pf=lossR?winR/lossR:winR; const exp=total?totalR/total:0;
  return {total,wins,losses,wr,totalR,pf,exp,best:Math.max(0,...journal.map(x=>Number(x.r||0))),worst:Math.min(0,...journal.map(x=>Number(x.r||0)))}
}
function statCardsHTML(s){
 return [
  ["list","TOTAL TRADES",s.total],
  ["target","WIN RATE",`${fmt(s.wr)}%`],
  ["trophy","WINS",s.wins],
  ["circle-x","LOSSES",s.losses],
  ["circle-dot","TOTAL R",`${s.totalR>=0?"+":""}${fmt(s.totalR)}R`],
  ["zap","BEST TRADE",`${fmt(s.best)}R`]
 ].map(x=>`<div class="stat-card"><div class="stat-top"><div class="stat-icon"><i data-lucide="${x[0]}"></i></div><div><small>${x[1]}</small><strong>${x[2]}</strong></div></div></div>`).join("")
}
function render(){
 const s=calcStats();
 $("#statsCards").innerHTML=statCardsHTML(s); $("#statsPageCards").innerHTML=statCardsHTML(s);
 $("#metricWinRate").textContent=fmt(s.wr)+"%";$("#metricR").textContent=(s.totalR>=0?"+":"")+fmt(s.totalR)+"R";$("#metricPF").textContent=fmt(s.pf);$("#metricExp").textContent=(s.exp>=0?"+":"")+fmt(s.exp)+"R";
 $("#sumTrades").textContent=s.total;$("#sumWR").textContent=fmt(s.wr)+"%";$("#sumR").textContent=(s.totalR>=0?"+":"")+fmt(s.totalR)+"R";$("#sumBest").textContent="+"+fmt(s.best)+"R";$("#sumWorst").textContent=fmt(s.worst)+"R";$("#sumAvg").textContent=fmt(s.exp)+"R";
 $("#recentTrades").innerHTML=results.slice(0,5).map(r=>`<div class="trade-row"><div class="trade-main"><span class="side-tag ${r.side.toLowerCase()}">${r.side}</span><div><strong>${r.title}</strong><small>Group ${r.group} • ${r.date}</small></div></div><div class="trade-pnl"><strong class="${r.pips>=0?"green":"red-text"}">${r.pips>=0?"+":""}${r.pips} pips</strong><small>${r.r>=0?"+":""}${fmt(r.r)}R</small></div></div>`).join("");
 const levelRows=levels.slice(0,4).map(levelRow).join("");$("#dashboardLevels").innerHTML=levelRows;$("#levelsTable").innerHTML=levels.map(fullLevelRow).join("");
 renderResults("all"); renderJournal(); renderAnnouncements(); renderBars(s);
 $("#journalStats").innerHTML=statCardsHTML(s).slice(0,4);
 $("#group1Link").href=settings.group1||"#";$("#group2Link").href=settings.group2||"#";$("#group1Input").value=settings.group1||"";$("#group2Input").value=settings.group2||"";
 document.body.classList.toggle("admin-unlocked",admin);
 $("#adminStatus").textContent=admin?"Admin mode unlocked. You can edit public content.":"Admin mode is locked.";
 lucide.createIcons();
}
function levelRow(x){return `<tr><td><span class="side-tag ${x.type.toLowerCase()}">${x.type}</span></td><td>${x.level}</td><td>${x.sl}</td><td>${x.tp1}</td><td>${x.tp2}</td><td><span class="status ${x.status}">${x.status.toUpperCase()}</span></td><td class="${x.pips>0?"green":x.pips<0?"red-text":""}">${x.pips?`${x.pips>0?"+":""}${x.pips}`:"—"}</td></tr>`}
function fullLevelRow(x){return `<tr><td>${x.date}</td><td>${x.session}</td>${levelRow(x).replace("<tr>","").replace("</tr>","")}<td class="admin-only"><button class="ghost-btn" onclick="deleteLevel(${x.id})">Delete</button></td></tr>`}
function renderResults(group){
 let data=group==="all"?results:results.filter(r=>String(r.group)===String(group));
 $("#resultsGrid").innerHTML=data.map(r=>`<article class="card result-card"><div class="result-shot"></div><div class="result-body"><div class="result-title"><h3>${r.title}</h3><span class="side-tag ${r.side.toLowerCase()}">${r.side}</span></div><div class="result-meta"><span>Group ${r.group}</span><span>${r.date}</span><span>${r.r>=0?"+":""}${fmt(r.r)}R</span></div><div class="result-pips ${r.pips<0?"red-text":""}">${r.pips>=0?"+":""}${r.pips} PIPS</div>${admin?`<button class="ghost-btn" style="margin-top:12px" onclick="deleteResult(${r.id})">Delete</button>`:""}</div></article>`).join("") || `<div class="card"><p class="muted">No results yet.</p></div>`;
 lucide.createIcons()
}
function renderJournal(){
 $("#journalGrid").innerHTML=journal.map(t=>`<article class="card result-card"><div class="result-body"><div class="result-title"><h3>${t.side} • ${t.session}</h3><span class="status ${t.result}">${t.result.toUpperCase()}</span></div><div class="result-meta"><span>${t.date}</span><span>Grade ${t.grade}</span><span>${t.pips>=0?"+":""}${t.pips} pips</span></div><div class="result-pips ${t.r<0?"red-text":""}">${t.r>=0?"+":""}${fmt(t.r)}R</div><button class="ghost-btn" style="margin-top:12px" onclick="deleteTrade(${t.id})">Delete</button></div></article>`).join("");
}
function renderAnnouncements(){
 $("#announcementGrid").innerHTML=announcements.map(a=>`<article class="card"><p class="eyebrow">${a.date}</p><h3>${a.title}</h3><p class="muted">${a.body}</p>${admin?`<button class="ghost-btn" onclick="deleteAnnouncement(${a.id})">Delete</button>`:""}</article>`).join("")
}
function renderBars(s){
 const arr=[["Wins",s.wins,s.total?s.wins/s.total*100:0],["Losses",s.losses,s.total?s.losses/s.total*100:0],["A / A+ Grades",journal.filter(x=>["A","A+"].includes(x.grade)).length,s.total?journal.filter(x=>["A","A+"].includes(x.grade)).length/s.total*100:0],["Profitable R",Math.max(0,s.totalR),Math.min(100,Math.max(0,s.totalR*10))]];
 $("#barList").innerHTML=arr.map(x=>`<div class="bar-line"><span>${x[0]}</span><div class="bar-track"><div class="bar-fill" style="width:${x[2]}%"></div></div><strong>${typeof x[1]==="number"?fmt(x[1],x[0]==="Profitable R"?1:0):x[1]}</strong></div>`).join("")
}
function showPage(name){
 $$(".page").forEach(p=>p.classList.remove("active"));$("#page-"+name).classList.add("active");
 $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===name));
 $("#pageTitle").textContent=({dashboard:"Dashboard","group-results":"Group Results",levels:"Daily Levels",journal:"Trading Journal",calculators:"Calculators",statistics:"Statistics",announcements:"Announcements",admin:"Admin Panel"})[name]||name;
 $("#sidebar").classList.remove("open"); window.scrollTo({top:0,behavior:"smooth"});
}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$$("[data-page-link]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.pageLink)));
$("#menuBtn").onclick=()=>$("#sidebar").classList.toggle("open");

function openModal(title,body,onSubmit){
 $("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modal").showModal();lucide.createIcons();
 $("#modalForm").onsubmit=e=>{e.preventDefault();onSubmit(new FormData(e.currentTarget));$("#modal").close();render();toast("Saved successfully")};
}
$("#closeModal").onclick=$("#cancelModal").onclick=()=>$("#modal").close();

$("#addLevelBtn").onclick=()=>openModal("Add Daily Level",`<div class="form-grid">
<label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></label>
<label>Session<select name="session"><option>London</option><option>New York</option><option>Pre-London</option></select></label>
<label>Type<select name="type"><option>BUY</option><option>SELL</option></select></label>
<label>Level<input name="level" type="number" step=".01" required></label>
<label>Stop Loss<input name="sl" type="number" step=".01" required></label>
<label>TP1<input name="tp1" type="number" step=".01" required></label>
<label>TP2<input name="tp2" type="number" step=".01"></label>
<label>Status<select name="status"><option>pending</option><option>win</option><option>loss</option></select></label>
<label>Pips<input name="pips" type="number" value="0"></label></div>`,fd=>{levels.unshift({id:Date.now(),...Object.fromEntries(fd),level:+fd.get("level"),sl:+fd.get("sl"),tp1:+fd.get("tp1"),tp2:+fd.get("tp2"),pips:+fd.get("pips")});saveAll()});
$("#addResultBtn").onclick=()=>openModal("Add Group Result",`<div class="form-grid">
<label>Group<select name="group"><option value="1">Group 1</option><option value="2">Group 2</option></select></label>
<label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
<label>Side<select name="side"><option>BUY</option><option>SELL</option></select></label>
<label>Title<input name="title" value="Gold Level Result"></label>
<label>Pips<input name="pips" type="number"></label>
<label>R Multiple<input name="r" type="number" step=".1"></label></div>`,fd=>{results.unshift({id:Date.now(),...Object.fromEntries(fd),group:+fd.get("group"),pips:+fd.get("pips"),r:+fd.get("r"),status:+fd.get("pips")>=0?"win":"loss"});saveAll()});
$("#addTradeBtn").onclick=()=>openModal("Add Journal Trade",`<div class="form-grid">
<label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label>
<label>Session<select name="session"><option>London</option><option>New York</option><option>Pre-London</option></select></label>
<label>Side<select name="side"><option>BUY</option><option>SELL</option></select></label>
<label>Entry<input name="entry" type="number" step=".01"></label>
<label>SL<input name="sl" type="number" step=".01"></label>
<label>TP / Exit<input name="tp" type="number" step=".01"></label>
<label>Result<select name="result"><option>win</option><option>loss</option><option>breakeven</option></select></label>
<label>Pips<input name="pips" type="number"></label>
<label>R Multiple<input name="r" type="number" step=".1"></label>
<label>Grade<select name="grade"><option>A++</option><option>A+</option><option>A</option><option>B</option><option>C</option></select></label></div>`,fd=>{journal.unshift({id:Date.now(),...Object.fromEntries(fd),entry:+fd.get("entry"),sl:+fd.get("sl"),tp:+fd.get("tp"),pips:+fd.get("pips"),r:+fd.get("r")});saveAll()});
$("#addAnnouncementBtn").onclick=()=>openModal("Add Announcement",`<div class="form-grid"><label>Date<input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></label><label>Title<input name="title"></label><label class="span-2">Message<textarea name="body" rows="5"></textarea></label></div>`,fd=>{announcements.unshift({id:Date.now(),...Object.fromEntries(fd)});saveAll()});

window.deleteLevel=id=>{if(confirm("Delete this level?")){levels=levels.filter(x=>x.id!==id);saveAll();render()}};
window.deleteResult=id=>{if(confirm("Delete this result?")){results=results.filter(x=>x.id!==id);saveAll();render()}};
window.deleteTrade=id=>{if(confirm("Delete this trade?")){journal=journal.filter(x=>x.id!==id);saveAll();render()}};
window.deleteAnnouncement=id=>{if(confirm("Delete this announcement?")){announcements=announcements.filter(x=>x.id!==id);saveAll();render()}};

$$(".filter-btn").forEach(b=>b.onclick=()=>{$$(".filter-btn").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderResults(b.dataset.group)});
$("#adminLoginBtn").onclick=()=>{if($("#adminPassword").value==="goldzilla"){admin=true;sessionStorage.setItem("gz_admin","1");render();toast("Admin unlocked")}else toast("Wrong password — demo password: goldzilla")};
$("#saveSettingsBtn").onclick=()=>{settings={group1:$("#group1Input").value||"#",group2:$("#group2Input").value||"#"};store.set("gz_settings",settings);render();toast("WhatsApp links updated")};

function calculators(){
 const risk=()=>$("#riskAmount").textContent="$"+fmt((+$("#riskBalance").value||0)*(+$("#riskPercent").value||0)/100);
 ["riskBalance","riskPercent"].forEach(id=>$("#"+id).addEventListener("input",risk));
 const rr=()=>$("#rrOutput").textContent="1 : "+fmt((+$("#rrReward").value||0)/(+$("#rrRisk").value||1));["rrRisk","rrReward"].forEach(id=>$("#"+id).addEventListener("input",rr));
 const pips=()=>$("#pipsOutput").textContent=Math.round(Math.abs((+$("#pipsExit").value||0)-(+$("#pipsEntry").value||0))*100)+" pips";["pipsEntry","pipsExit"].forEach(id=>$("#"+id).addEventListener("input",pips));
 const pos=()=>$("#posOutput").textContent=fmt((+$("#posRisk").value||0)/((+$("#posSL").value||1)*10),2);["posRisk","posSL"].forEach(id=>$("#"+id).addEventListener("input",pos));
 risk();rr();pips();pos();
}
$$("[data-calc]").forEach(b=>b.onclick=()=>{showPage("calculators");setTimeout(()=>document.querySelector(".calc-card").scrollIntoView({behavior:"smooth"}),100)});
setInterval(()=>{$("#clock").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})},1000);
setInterval(()=>{let p=2394.85+(Math.random()-.5)*2;$("#fakePrice").textContent=p.toFixed(2)},3000);
$("#themeBtn").onclick=()=>toast("Goldzilla dark theme is active");
calculators();render();
