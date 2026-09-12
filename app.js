const form=document.querySelector('#requestForm');
const steps=[...document.querySelectorAll('.wizard-step')];
const progressBar=document.querySelector('#progressBar');
const stepLabel=document.querySelector('#stepLabel');
const photoInput=document.querySelector('#photos');
const photoList=document.querySelector('#photoList');
const status=document.querySelector('#formStatus');
const cartItems=document.querySelector('#cartItems');
const cartRoom=document.querySelector('#cartRoom');
const cartArea=document.querySelector('#cartArea');
const cartEstimate=document.querySelector('#cartEstimate');
const cartEstimateNote=document.querySelector('#cartEstimateNote');
const finalEstimate=document.querySelector('#finalEstimate');
let current=1;

const rate={Gulv:280,'Vegger og gips':520,Panel:390,'Lister og foringer':110,'Komplett rom':850};
function services(){return [...document.querySelectorAll('input[name="service"]:checked')].map(x=>x.value)}
function value(id){return document.querySelector(`#${id}`)?.value?.trim()||''}
function money(n){return new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(Math.round(n/500)*500)}
function estimate(){const selected=services(),m2=Math.max(0,Number(value('area'))||0);if(!selected.length||!m2)return null;let base=0;for(const s of selected){if(s==='Avretting')continue;base+=(rate[s]||0)*m2}if(!base)return null;base=Math.max(base,4500);return {low:base*.9,high:base*1.15,hasLevel:selected.includes('Avretting')}}
function updateCart(){const selected=services();cartItems.innerHTML=selected.length?selected.map(s=>`<div class="cart-item"><span>${s}</span><button type="button" data-remove="${s}">Fjern</button></div>`).join(''):'<p class="empty-cart">Velg arbeid for å starte.</p>';cartRoom.textContent=value('room')||'–';cartArea.textContent=value('area')?`${value('area')} m²`:'–';const e=estimate();if(e){const text=`${money(e.low)} – ${money(e.high)}`;cartEstimate.textContent=text;finalEstimate.textContent=text;cartEstimateNote.textContent=e.hasLevel?'Veiledende arbeidsestimat. Avretting er ikke inkludert og vurderes separat.':'Veiledende arbeidsestimat før vurdering.'}else{cartEstimate.textContent='–';finalEstimate.textContent='–';cartEstimateNote.textContent=selected.includes('Avretting')?'Avretting må vurderes separat.':'Velg arbeid og oppgi størrelse.'}document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{const box=[...document.querySelectorAll('input[name="service"]')].find(i=>i.value===b.dataset.remove);if(box)box.checked=false;updateCart()}))}
function showStep(step){current=step;steps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step));if(step<=4){progressBar.style.width=`${step*25}%`;stepLabel.textContent=`Steg ${step} av 4`;stepLabel.style.display='block'}else{progressBar.style.width='100%';stepLabel.style.display='none'}updateCart();window.location.hash='foresporsel'}
function validateStep(){status.textContent='';if(current===1&&!services().length){alert('Velg minst én type arbeid.');return false}if(current===2&&!value('description')){alert('Skriv kort hva du ønsker hjelp med.');return false}if(current===4){if(!value('name')||!value('phone')){status.textContent='Fyll inn navn og telefon.';return false}if(!document.querySelector('#consent').checked){status.textContent='Kryss av at forespørselen er uforpliktende.';return false}}return true}

document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',()=>{if(!validateStep())return;showStep(Math.min(current+1,4))}));
document.querySelectorAll('.prev').forEach(b=>b.addEventListener('click',()=>showStep(Math.max(current-1,1))));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.goto))));
document.querySelector('#cartBack').addEventListener('click',()=>showStep(Math.max(current-1,1)));
document.querySelectorAll('input[name="service"],#room,#area,#timing,#postcode,#description').forEach(el=>el.addEventListener('input',updateCart));

photoInput.addEventListener('change',()=>{const files=[...photoInput.files];photoList.innerHTML=files.length?`<strong>${files.length} bilde${files.length===1?'':'r'} valgt</strong>${files.map(f=>`<span>${f.name.replace(/[<>]/g,'')}</span>`).join('')}`:'<span>Ingen bilder valgt ennå.</span>'});

form.addEventListener('submit',e=>{e.preventDefault();if(!validateStep())return;const ePrice=estimate();const inquiry={id:Date.now(),customer:value('name'),phone:value('phone'),email:value('email'),postcode:value('postcode'),room:value('room'),area:value('area'),description:value('description'),timing:value('timing'),services:services(),photos:[...photoInput.files].map(f=>f.name),estimate:ePrice?`${money(ePrice.low)} – ${money(ePrice.high)}`:'Må vurderes',status:'new',createdAt:new Date().toISOString()};const inquiries=JSON.parse(localStorage.getItem('moholdtInquiries')||'[]');inquiries.unshift(inquiry);localStorage.setItem('moholdtInquiries',JSON.stringify(inquiries));const jobs=JSON.parse(localStorage.getItem('moholdtDemoJobs')||'[]');jobs.unshift({id:inquiry.id,customer:inquiry.customer||'Ny kunde',project:`${inquiry.services.join(', ')}${inquiry.area?` • ${inquiry.area} m²`:''}`,status:'new',price:inquiry.estimate,date:inquiry.timing||'Ikke avtalt'});localStorage.setItem('moholdtDemoJobs',JSON.stringify(jobs));showStep(5)});

updateCart();showStep(1);