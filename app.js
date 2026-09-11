const form=document.querySelector('#requestForm');
const steps=[...document.querySelectorAll('.wizard-step')];
const progressBar=document.querySelector('#progressBar');
const stepLabel=document.querySelector('#stepLabel');
const photoInput=document.querySelector('#photos');
const photoList=document.querySelector('#photoList');
const status=document.querySelector('#formStatus');
let current=1;

function services(){return [...document.querySelectorAll('input[name="service"]:checked')].map(x=>x.value)}
function showStep(step){current=step;steps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===step));if(step<=4){progressBar.style.width=`${step*25}%`;stepLabel.textContent=`Steg ${step} av 4`;stepLabel.style.display='block'}else{progressBar.style.width='100%';stepLabel.style.display='none'}window.location.hash='foresporsel'}
function value(id){return document.querySelector(`#${id}`)?.value?.trim()||''}
function validateStep(){status.textContent='';if(current===1&&!services().length){alert('Velg minst én type arbeid.');return false}if(current===2&&!value('description')){alert('Skriv kort hva du ønsker hjelp med.');return false}if(current===4){if(!value('name')||!value('phone')){status.textContent='Fyll inn navn og telefon.';return false}if(!document.querySelector('#consent').checked){status.textContent='Kryss av at forespørselen er uforpliktende.';return false}}return true}
function summary(){const s=services();document.querySelector('#summaryBox').innerHTML=`<strong>Oppsummering</strong><span>${s.join(' • ')||'Ingen tjenester valgt'}</span><span>${value('room')||'Rom ikke valgt'}${value('area')?` • ca. ${value('area')} m²`:''}</span><span>${value('postcode')?`Postnummer ${value('postcode')}`:''} ${value('timing')?`• ${value('timing')}`:''}</span>`}

document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',()=>{if(!validateStep())return;if(current===3)summary();showStep(Math.min(current+1,4))}));
document.querySelectorAll('.prev').forEach(b=>b.addEventListener('click',()=>showStep(Math.max(current-1,1))));

photoInput.addEventListener('change',()=>{const files=[...photoInput.files];photoList.innerHTML=files.length?`<strong>${files.length} bilde${files.length===1?'':'r'} valgt</strong>${files.map(f=>`<span>${f.name.replace(/[<>]/g,'')}</span>`).join('')}`:'<span>Ingen bilder valgt ennå.</span>'});

form.addEventListener('submit',e=>{e.preventDefault();if(!validateStep())return;const inquiry={id:Date.now(),customer:value('name'),phone:value('phone'),email:value('email'),postcode:value('postcode'),room:value('room'),area:value('area'),description:value('description'),timing:value('timing'),services:services(),photos:[...photoInput.files].map(f=>f.name),status:'new',createdAt:new Date().toISOString()};const inquiries=JSON.parse(localStorage.getItem('moholdtInquiries')||'[]');inquiries.unshift(inquiry);localStorage.setItem('moholdtInquiries',JSON.stringify(inquiries));const jobs=JSON.parse(localStorage.getItem('moholdtDemoJobs')||'[]');jobs.unshift({id:inquiry.id,customer:inquiry.customer||'Ny kunde',project:`${inquiry.services.join(', ')}${inquiry.area?` • ${inquiry.area} m²`:''}`,status:'new',price:'Ikke tilbudt',date:inquiry.timing||'Ikke avtalt'});localStorage.setItem('moholdtDemoJobs',JSON.stringify(jobs));showStep(5)});

showStep(1);