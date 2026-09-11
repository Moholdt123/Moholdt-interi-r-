const rates={floor:280,remove:140,trim:110,wall:520,panel:390,level:260};
const complexity={open:.9,normal:1,complex:1.2};
const area=document.querySelector('#area');
const price=document.querySelector('#price');
const roomType=document.querySelector('#roomType');

function selectedServices(){
  return [...document.querySelectorAll('input[name="service"]:checked')].map(x=>x.value);
}

function calculate(){
  const m2=Math.max(0,Number(area.value)||0);
  const selected=selectedServices();
  if(!m2||!selected.length){price.textContent='Velg arbeid';return null;}
  const factor=complexity[roomType.value]||1;
  let base=selected.reduce((sum,key)=>sum+(rates[key]||0)*m2,0)*factor;
  base=Math.max(base,4500);
  const minimum=base*.9,maximum=base*1.15;
  const format=n=>new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(Math.round(n/500)*500);
  price.textContent=`${format(minimum)} – ${format(maximum)}`;
  return {minimum,maximum,m2,selected};
}

document.querySelector('#estimateBtn').addEventListener('click',calculate);
document.querySelectorAll('#calc input,#calc select').forEach(el=>el.addEventListener('change',calculate));

const fields=['name','phone','email','postcode','description','timing'];
const formStatus=document.querySelector('#formStatus');
const photos=document.querySelector('#photos');
const photoList=document.querySelector('#photoList');

function getInquiry(){
  const estimate=calculate();
  return {
    ...Object.fromEntries(fields.map(id=>[id,document.querySelector(`#${id}`)?.value?.trim()||''])),
    area:area.value,
    roomType:roomType.options[roomType.selectedIndex]?.text||'',
    services:selectedServices(),
    estimate:price.textContent,
    consent:document.querySelector('#consent').checked,
    photoNames:[...photos.files].map(file=>file.name),
    savedAt:new Date().toISOString()
  };
}

function saveDraft(showMessage=true){
  const data=getInquiry();
  localStorage.setItem('moholdtInquiryDraft',JSON.stringify(data));
  if(showMessage){
    formStatus.textContent='Utkast lagret på denne enheten.';
    setTimeout(()=>formStatus.textContent='',3500);
  }
}

function loadDraft(){
  try{
    const saved=JSON.parse(localStorage.getItem('moholdtInquiryDraft')||'null');
    if(!saved)return;
    fields.forEach(id=>{const el=document.querySelector(`#${id}`);if(el&&saved[id])el.value=saved[id];});
    if(saved.area)area.value=saved.area;
    if(saved.consent)document.querySelector('#consent').checked=true;
    calculate();
  }catch(e){console.warn('Kunne ikke lese lagret utkast',e);}
}

function serviceLabel(key){
  return ({floor:'Legge gulv',remove:'Fjerne eksisterende gulv',trim:'Lister og finish',wall:'Gips / veggarbeid',panel:'Smartpanel / himlingspanel',level:'Avretting'})[key]||key;
}

function buildSummary(){
  const d=getInquiry();
  return `Forespørsel – Moholdt Interiør\n\nNavn: ${d.name||'-'}\nTelefon: ${d.phone||'-'}\nE-post: ${d.email||'-'}\nPostnummer: ${d.postcode||'-'}\nØnsket tidspunkt: ${d.timing||'-'}\n\nAreal: ${d.area||'-'} m²\nRomtype: ${d.roomType||'-'}\nArbeid: ${d.services.map(serviceLabel).join(', ')||'-'}\nForeløpig kalkulator-estimat: ${d.estimate||'-'}\n\nProsjektbeskrivelse:\n${d.description||'-'}\n\nBilder valgt: ${d.photoNames.join(', ')||'Ingen'}`;
}

document.querySelector('#saveDraft').addEventListener('click',()=>saveDraft(true));
document.querySelector('#copyInquiry').addEventListener('click',async()=>{
  const summary=buildSummary();
  try{
    await navigator.clipboard.writeText(summary);
    formStatus.textContent='Prosjektbeskrivelsen er kopiert.';
  }catch{
    window.prompt('Kopier teksten under:',summary);
  }
  setTimeout(()=>formStatus.textContent='',3500);
});

photos.addEventListener('change',()=>{
  const files=[...photos.files];
  photoList.innerHTML=files.length?`<strong>${files.length} bilde${files.length===1?'':'r'} valgt:</strong>${files.map(f=>`<span>${f.name}</span>`).join('')}`:'';
});

document.querySelectorAll('#inquiryForm input,#inquiryForm textarea,#inquiryForm select').forEach(el=>{
  if(el.type!=='file')el.addEventListener('change',()=>saveDraft(false));
});

loadDraft();
calculate();