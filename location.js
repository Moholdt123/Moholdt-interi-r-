(function(){
  var dialog=document.getElementById('locationDialog'),field=document.getElementById('postalCode'),error=document.getElementById('postalCodeStatus'),edit=document.getElementById('editLocation');
  if(!dialog||!field)return;
  // Conservative distance screen, NOT a driving-time calculation.
  // Origin: Kartverket, Vikersundgata 10, 3370 Vikersund.
  var origin={lat:59.96726127572461,lon:9.99674165370662},committed='',state='empty',town='',returnFocus=edit,requestId=0,controller=null;
  var submit=document.querySelector('#locationForm button[type="submit"]');
  function distance(point){
    var rad=Math.PI/180,dlat=(point.lat-origin.lat)*rad,dlon=(point.lon-origin.lon)*rad;
    var a=Math.sin(dlat/2)**2+Math.cos(origin.lat*rad)*Math.cos(point.lat*rad)*Math.sin(dlon/2)**2;
    return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));
  }
  function classify(addresses){
    var points=addresses.filter(function(a){return a.representasjonspunkt&&Number.isFinite(a.representasjonspunkt.lat)&&Number.isFinite(a.representasjonspunkt.lon)});
    if(!points.length)return 'unknown';
    // All returned address samples must be local before showing green.
    if(points.every(function(a){return a.kommunenavn==='MODUM'}))return 'local';
    // Very distant areas only; the band below 180 km remains subject to manual review.
    if(points.every(function(a){return distance(a.representasjonspunkt)>180}))return 'outside';
    return 'review';
  }
  function canProceed(){return (state==='local'||state==='review')&&field.value.trim()===committed}
  function render(){
    var badge=document.querySelector('.location-summary'),icon=document.getElementById('locationCheck'),title=document.getElementById('locationTitle'),detail=document.getElementById('locationDetail');
    badge.dataset.area=state;icon.hidden=state==='empty';icon.textContent=state==='local'?'✓':state==='outside'?'×':'!';
    var place=committed+(town?' · '+town:'');
    title.textContent=state==='local'?'Vi tar oppdrag i ditt område · '+place:state==='outside'?'Utenfor arbeidsområdet · '+place:state==='review'?'Jobbsted må vurderes · '+place:state==='checking'?'Kontrollerer postnummer …':state==='unknown'?'Postnummeret er ikke kontrollert':'Legg til jobbsted';
    detail.textContent=state==='local'?'Tidspunkt og endelig oppdrag avtales med Moholdt.':state==='outside'?'Dette er for langt fra Vikersund. Forespørselen kan ikke sendes.':state==='review'?'Området er ikke endelig godkjent. Moholdt vurderer adressen og kjøretiden.':'Vi kontrollerer poststedet før du går videre.';
    edit.textContent=committed?'Endre':'Legg til';
    document.getElementById('postalCodeSummary').textContent=committed;
    document.querySelectorAll('#requestForm .next, #requestForm button[type="submit"]').forEach(function(button){button.disabled=!canProceed()});
  }
  function open(trigger){
    returnFocus=trigger&&trigger.focus?trigger:edit;field.value=committed;error.textContent='';field.removeAttribute('aria-invalid');
    if(state==='outside')error.textContent='Dette poststedet ligger utenfor arbeidsområdet. Legg inn et annet jobbsted.';
    if(!dialog.open)dialog.showModal();field.focus();
  }
  function cancelRequest(){requestId++;if(controller)controller.abort();submit.disabled=false;submit.textContent='Kontroller postnummer →'}
  function close(){cancelRequest();if(state==='checking')state='unknown';field.value=committed;render();dialog.close();returnFocus.focus()}
  document.getElementById('locationForm').addEventListener('submit',async function(event){
    event.preventDefault();var value=field.value.trim();
    if(!/^[0-9]{4}$/.test(value)){error.textContent='Fyll inn et postnummer med fire sifre.';field.setAttribute('aria-invalid','true');field.focus();return}
    cancelRequest();var thisRequest=requestId;controller=new AbortController();var activeController=controller,signal=activeController.signal;
    committed=value;field.value=value;state='checking';town='';render();field.removeAttribute('aria-invalid');error.textContent='Sjekker poststedet …';submit.disabled=true;submit.textContent='Kontrollerer …';
    var timer=setTimeout(function(){activeController.abort()},12000);
    try{
      var response=await fetch('https://ws.geonorge.no/adresser/v1/sok?postnummer='+encodeURIComponent(value)+'&treffPerSide=10',{signal:signal});
      if(!response.ok)throw new Error('Lookup failed');
      var data=await response.json();if(thisRequest!==requestId)return;
      var addresses=(data.adresser||[]).filter(function(a){return a.postnummer===value});
      if(!addresses.length){state='unknown';error.textContent='Fant ingen jobbadresser med dette postnummeret. Kontroller nummeret; postboksnummer kan ikke brukes.';render();return}
      town=addresses[0].poststed||'';state=classify(addresses);render();
      if(state==='outside'){error.textContent='Beklager, '+town+' ligger for langt unna. Vi tar oppdrag inntil 90 minutters kjøring fra Vikersund. Du kan ikke sende en forespørsel for dette området.';return}
      if(state==='unknown'){error.textContent='Vi kunne ikke kontrollere området. Prøv igjen.';return}
      document.getElementById('postalTown').value=town;
      error.textContent='';dialog.close();returnFocus.focus();
    }catch(err){if(thisRequest!==requestId)return;state='unknown';error.textContent='Områdesjekken er midlertidig utilgjengelig. Prøv igjen om litt.';render()}
    finally{clearTimeout(timer);if(thisRequest===requestId){submit.disabled=false;submit.textContent='Kontroller postnummer →'}}
  });
  field.addEventListener('input',function(){cancelRequest();state='unknown';town='';error.textContent='';render()});
  dialog.addEventListener('cancel',function(event){event.preventDefault();close()});
  document.getElementById('closeLocation').addEventListener('click',close);
  edit.addEventListener('click',function(){open(edit)});
  var finalEdit=document.getElementById('editLocationFinal');finalEdit.addEventListener('click',function(){open(finalEdit)});
  window.JobLocation={open:open,canProceed:canProceed,classify:classify};
  render();open(edit);
})();