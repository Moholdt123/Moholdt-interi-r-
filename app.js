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
const cartBreakdown=document.querySelector('#cartBreakdown');
const cartEstimate=document.querySelector('#cartEstimate');
const cartEstimateNote=document.querySelector('#cartEstimateNote');
const finalEstimate=document.querySelector('#finalEstimate');
const floorOptions=document.querySelector('#floorOptions');
let current=1;

const rate={'Vegger og gips':520,Panel:390,'Lister og foringer':110,'Komplett rom':850};
const floorExtras={removeOldFloor:{label:'Fjerne gammelt gulv',base:1000,perM2:75},disposeOldFloor:{label:'Bortkjøring av gammelt gulv',base:900,perM2:20},moveFurniture:{label:'Flytte møbler',base:900,perM2:15},newSkirting:{label:'Nye gulvlister',base:1200,perM2:65},pickupFloor:{label:'Hente gulv',base:1000,perM2:0}};
function services(){return [...document.querySelectorAll('input[name="service"]:checked')].map(x=>x.value)}
function value(id){return document.querySelector(`#${id}`)?.value?.trim()||''}
function checked(id){return !!document.querySelector(`#${id}`)?.checked}
function round100(n){return Math.round(n/100)*100}
function money(n){return new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(round100(n))}
function floorBase(m2){if(!m2)return 0;const calculated=320*m2;return Math.max(5500,calculated)}
function estimate(){const selected=services(),m2=Math.max(0,Number(value('area'))||0);if(!selected.length||!m2)return null;let labor=0,material=0,lines=[];for(const s of selected){if(s==='Avretting')continue;if(s==='Gulv'){const b=floorBase(m2);labor+=b;lines.push({label:'Gulvlegging',amount:b})}else{const amount=(rate[s]||0)*m2;labor+=amount;if(amount)lines.push({label:s,amount})}}if(selected.includes('Gulv')){for(const [id,x] of Object.entries(floorExtras)){if(checked(id)){const amount=x.base+x.perM2*m2;labor+=amount;lines.push({label:x.label,amount})}}const floorPrice=Math.max(0,Number(value('floorPrice'))||0);if(floorPrice){material=floorPrice*m2*1.08;lines.push({label:'Gulv/materialer ca.',amount:material,material:true})}}if(!labor&&!material)return null;labor=Math.max(labor,selected.some(s=>s!=='Avretting')?5500:0);const total=labor+material;return {low:total*.95,high:total*1.1,labor,material,lines,hasLevel:selected.includes('Avretting')}}
function updateFloorOptions(){floorOptions.hidden=!services().includes('Gulv')}
function updateCart(){const selected=services();updateFloorOptions();cartItems.innerHTML=selected.length?selected.map(s=>`<div class="cart-item"><span>${s}</span><button type="button" data-remove="${s}">Fjern</button></div>`).join(''):'<p class="empty-cart">Velg arbeid for å starte.</p>';cartRoom.textContent=value('room')||'–';cartArea.textContent=value('area')?`${value('area')} m²`:'–';const e=estimate();if(e){cartBreakdown.innerHTML=e.lines.map(x=>`<div><span>${x.label}</span><strong>${x.material?'ca. ':''}${money(x.amount)}</strong></div>`).join('');const text=`${money(e.low)} – ${money(e.high)}`;cartEstimate.textContent=text;finalEstimate.textContent=text;cartEstimateNote.textContent=e.hasLevel?'Foreløpig total. Avretting må vurderes separat.':'Arbeid og valgte tillegg. Endelig pris avtales etter vurdering.'}else{cartBreakdown.innerHTML='';cartEstimate.textContent='–';finalEstimate.textContent='–';cartEstimateNote.textContent=selected.includes('Avretting')?'Avretting må vurderes separat.':'Velg arbeid og oppgi størrelse.'}document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{const box=[...document.querySelectorAll('input[name="service"]')].find(i=>i.value===b.dataset.remove);if(box)box.checked=false;updateCart()}))}
function showStep(step){current=step;steps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step));if(step<=4){progressBar.style.width=`${step*25}%`;stepLabel.textContent=`Steg ${step} av 4`;stepLabel.style.display='block'}else{progressBar.style.width='100%';stepLabel.style.display='none'}updateCart();window.location.hash='foresporsel'}
function validateStep(){status.textContent='';if(current===1&&!services().length){alert('Velg minst én type arbeid.');return false}if(current===2&&!value('description')){alert('Skriv kort hva du ønsker hjelp med.');return false}if(current===4&&!value('name')){status.textContent='Fyll inn navn.';return false}if(current===4&&!value('phone')){status.textContent='Fyll inn telefonnummer så jeg kan kontakte deg.';return false}return true}

document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',()=>{if(!validateStep())return;showStep(Math.min(current+1,4))}));
document.querySelectorAll('.prev').forEach(b=>b.addEventListener('click',()=>showStep(Math.max(current-1,1))));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.goto))));
document.querySelector('#cartBack').addEventListener('click',()=>showStep(Math.max(current-1,1)));
document.querySelectorAll('input[name="service"],#room,#area,#timing,#description,#removeOldFloor,#disposeOldFloor,#moveFurniture,#newSkirting,#pickupFloor,#floorPrice').forEach(el=>el.addEventListener('input',updateCart));
photoInput.addEventListener('change',()=>{const files=[...photoInput.files];photoList.innerHTML=files.length?`<strong>${files.length} bilde${files.length===1?'':'r'} valgt</strong>${files.map(f=>`<span>${f.name.replace(/[<>]/g,'')}</span>`).join('')}`:'<span>Ingen bilder valgt ennå.</span>'});
form.addEventListener('submit',e=>{e.preventDefault();if(!validateStep())return;const ePrice=estimate();const inquiry={id:Date.now(),customer:value('name'),phone:value('phone'),room:value('room'),area:value('area'),description:value('description'),timing:value('timing'),services:services(),floorOptions:Object.fromEntries(Object.keys(floorExtras).map(id=>[id,checked(id)])),floorPrice:value('floorPrice'),photos:[...photoInput.files].map(f=>f.name),estimate:ePrice?`${money(ePrice.low)} – ${money(ePrice.high)}`:'Må vurderes',status:'new',createdAt:new Date().toISOString()};const inquiries=JSON.parse(localStorage.getItem('moholdtInquiries')||'[]');inquiries.unshift(inquiry);localStorage.setItem('moholdtInquiries',JSON.stringify(inquiries));const jobs=JSON.parse(localStorage.getItem('moholdtDemoJobs')||'[]');jobs.unshift({id:inquiry.id,customer:inquiry.customer||'Ny kunde',project:`${inquiry.services.join(', ')}${inquiry.area?` • ${inquiry.area} m²`:''}`,status:'new',price:inquiry.estimate,date:inquiry.timing||'Ikke avtalt'});localStorage.setItem('moholdtDemoJobs',JSON.stringify(jobs));showStep(5)});
updateCart();showStep(1);