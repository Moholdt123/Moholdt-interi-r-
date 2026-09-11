const rates={floor:280,remove:140,trim:110,wall:520,panel:390};
const area=document.querySelector('#area');
const price=document.querySelector('#price');
function calculate(){
 const m2=Math.max(0,Number(area.value)||0);
 const selected=[...document.querySelectorAll('input[name="service"]:checked')].map(x=>x.value);
 if(!m2||!selected.length){price.textContent='Velg arbeid';return;}
 const base=selected.reduce((sum,key)=>sum+rates[key]*m2,0);
 const minimum=base*.9, maximum=base*1.15;
 const format=n=>new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(Math.round(n/500)*500);
 price.textContent=`${format(minimum)} – ${format(maximum)}`;
}
document.querySelector('#estimateBtn').addEventListener('click',calculate);
document.querySelectorAll('#calc input').forEach(el=>el.addEventListener('change',calculate));
calculate();