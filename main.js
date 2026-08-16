
document.addEventListener("DOMContentLoaded",()=>{
 const risk=()=>{const b=+document.querySelector("#riskBalance")?.value||0,p=+document.querySelector("#riskPercent")?.value||0; const o=document.querySelector("#riskOut"); if(o)o.textContent="$"+(b*p/100).toFixed(2)};
 const rr=()=>{const r=+document.querySelector("#rrRisk")?.value||1,w=+document.querySelector("#rrReward")?.value||0; const o=document.querySelector("#rrOut"); if(o)o.textContent="1 : "+(w/r).toFixed(2)};
 const pips=()=>{const e=+document.querySelector("#entry")?.value||0,x=+document.querySelector("#exit")?.value||0;const o=document.querySelector("#pipsOut");if(o)o.textContent=Math.round(Math.abs(x-e)*100)+" pips"};
 const pos=()=>{const r=+document.querySelector("#posRisk")?.value||0,s=+document.querySelector("#posSL")?.value||1;const o=document.querySelector("#posOut");if(o)o.textContent=(r/(s*10)).toFixed(2)+" lot"};
 [["riskBalance",risk],["riskPercent",risk],["rrRisk",rr],["rrReward",rr],["entry",pips],["exit",pips],["posRisk",pos],["posSL",pos]].forEach(([id,fn])=>document.querySelector("#"+id)?.addEventListener("input",fn));
 risk();rr();pips();pos();
});
