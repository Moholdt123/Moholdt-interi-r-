function escapeOffer(value){return String(value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function offerMarkup(d){
  var esc=escapeOffer;
  var paragraph=function(text){return '<p style="margin:8px 0 22px;line-height:1.65;color:#3d483c;white-space:pre-line">'+esc(text)+'</p>'};
  var heading=function(text){return '<h2 style="font:700 13px Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#53644b;margin:26px 0 8px">'+esc(text)+'</h2>'};
  var amount=new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:2}).format(Number(d.price));
  var date=new Intl.DateTimeFormat('nb-NO',{dateStyle:'long'}).format(new Date(d.validUntil+'T12:00:00'));
  return '<div style="max-width:700px;margin:0 auto;border:1px solid #d7d7c9;background:#fffdf7;color:#243427;font:15px/1.6 Arial,sans-serif">'
    +'<div style="padding:30px;background:#27382b;color:#fffdf7"><p style="font:700 16px Arial,sans-serif;letter-spacing:.18em;margin:0">MOHOLDT</p><h1 style="font:36px Georgia,serif;margin:20px 0 10px">Tilbud på arbeid hos deg</h1><p style="margin:0;font-size:14px">'+esc(d.address)+'</p></div>'
    +'<div style="padding:30px"><p style="margin:0 0 12px">Hei '+esc(d.customer)+'!</p>'+paragraph('Takk for forespørselen. Her er tilbudet mitt på arbeidet vi har beskrevet nedenfor.')
    +heading('Dette er inkludert')+'<ul style="padding-left:20px;margin:10px 0 24px">'+d.work.split('\n').filter(function(l){return l.trim()}).map(function(l){return '<li style="margin:7px 0">'+esc(l)+'</li>'}).join('')+'</ul>'
    +'<div style="padding:24px;background:#e9efe6;border:1px solid #c7d3c0"><p style="margin:0;font-size:12px;letter-spacing:.08em">TOTALPRIS</p><p style="font:32px Georgia,serif;margin:8px 0">'+esc(amount)+'</p><p style="margin:0;font-size:13px">'+esc(d.vat)+'</p></div>'
    +heading('Materialer og transport')+paragraph(d.materials)
    +heading('Oppstart og varighet')+paragraph(d.timing)
    +heading('Forutsetninger')+paragraph(d.conditions+'\nEventuelt ekstraarbeid og pris avtales før arbeidet utføres.')
    +heading('Betaling')+paragraph(d.payment)
    +'<div style="border-top:1px solid #d7d7c9;padding-top:22px;margin-top:24px"><strong>Ønsker du å gå videre?</strong>'+paragraph('Svar på denne e-posten for å godta tilbudet eller stille spørsmål. Vi bekrefter oppstart sammen.\nTilbudet gjelder til '+date+'.')+'</div>'
    +paragraph('Vennlig hilsen\n'+d.sender+'\nMoholdt\nTelefon: '+d.senderPhone)+'</div></div>';
}
var offerForm=document.getElementById('offerForm'),preview=document.getElementById('offerPreview'),actions=document.getElementById('actions'),statusEl=document.getElementById('status'),lastOffer=null;
offerForm.addEventListener('input',function(){lastOffer=null;actions.hidden=true;preview.innerHTML='';document.getElementById('empty').hidden=false;statusEl.textContent='Forhåndsvis på nytt etter endringene.'});
offerForm.addEventListener('submit',function(event){
  event.preventDefault();if(!offerForm.reportValidity())return;
  var ids=['customer','customerEmail','address','work','price','vat','materials','timing','validUntil','conditions','payment','sender','senderPhone'],data={};
  ids.forEach(function(id){data[id]=document.getElementById(id).value.trim()});
  if(ids.some(function(id){return !data[id]})){statusEl.textContent='Fyll inn alle feltene før du lager tilbudet.';return}
  if(!Number.isFinite(Number(data.price))||Number(data.price)<=0){statusEl.textContent='Fyll inn en gyldig totalpris.';return}
  var today=new Date();today.setHours(0,0,0,0);var expires=new Date(data.validUntil+'T23:59:59');
  if(!Number.isFinite(expires.getTime())||expires<today){statusEl.textContent='Velg en gyldighetsdato som ikke er passert.';return}
  var html=offerMarkup(data);preview.innerHTML=html;
  var text=preview.innerText;lastOffer={html:html,text:text};actions.hidden=false;document.getElementById('empty').hidden=true;
  document.getElementById('compose').href='mailto:'+encodeURIComponent(data.customerEmail)+'?subject='+encodeURIComponent('Tilbud fra Moholdt – '+data.address)+'&body='+encodeURIComponent(text);
  statusEl.textContent='Utkastet er klart. Kontroller pris, vilkår og mottaker før du sender.';
});
document.getElementById('copy').addEventListener('click',async function(){
  if(!lastOffer)return;
  try{
    if(navigator.clipboard&&window.ClipboardItem){
      await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([lastOffer.html],{type:'text/html'}),'text/plain':new Blob([lastOffer.text],{type:'text/plain'})})]);
      statusEl.textContent='Kopiert med formatering. Lim inn i et svar til kunden i Gmail og kontroller mottakeren.';
    }else if(navigator.clipboard){await navigator.clipboard.writeText(lastOffer.text);statusEl.textContent='Kopiert som ren tekst. Denne nettleseren støtter ikke kopiering med formatering.'}
    else{throw new Error('Clipboard unavailable')}
  }catch(error){statusEl.textContent='Nettleseren tillot ikke kopiering. Marker tilbudet og kopier manuelt, eller lagre det som PDF.'}
});
document.getElementById('print').addEventListener('click',function(){if(lastOffer)window.print()});
