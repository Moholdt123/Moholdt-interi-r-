(function(){
  var dialog=document.getElementById('locationDialog'),field=document.getElementById('postalCode'),error=document.getElementById('postalCodeStatus'),edit=document.getElementById('editLocation');
  if(!dialog||!field)return;
  var committed='',returnFocus=edit;
  function valid(value){return /^[0-9]{4}$/.test(value)}
  function render(){
    var ready=valid(committed);
    document.getElementById('locationCheck').hidden=!ready;
    document.getElementById('locationTitle').textContent=ready?'Jobbsted lagt til · '+committed:'Legg til jobbsted';
    document.getElementById('locationDetail').textContent=ready?'Adressen vurderes av Moholdt før oppdraget avtales.':'Inntil 90 minutters kjøring fra Vikersund. Adressen vurderes manuelt.';
    edit.textContent=ready?'Endre':'Legg til';
    document.getElementById('postalCodeSummary').textContent=committed;
  }
  function open(trigger){
    returnFocus=trigger&&trigger.focus?trigger:edit;
    field.value=committed;error.textContent='';field.removeAttribute('aria-invalid');
    if(!dialog.open)dialog.showModal();field.focus();
  }
  function close(){field.value=committed;dialog.close();returnFocus.focus()}
  document.getElementById('locationForm').addEventListener('submit',function(event){
    event.preventDefault();var value=field.value.trim();
    if(!valid(value)){error.textContent='Fyll inn et postnummer med fire sifre.';field.setAttribute('aria-invalid','true');field.focus();return}
    committed=value;field.value=value;field.removeAttribute('aria-invalid');error.textContent='';render();dialog.close();returnFocus.focus();
  });
  dialog.addEventListener('cancel',function(event){event.preventDefault();close()});
  document.getElementById('closeLocation').addEventListener('click',close);
  edit.addEventListener('click',function(){open(edit)});
  var finalEdit=document.getElementById('editLocationFinal');finalEdit.addEventListener('click',function(){open(finalEdit)});
  window.JobLocation={open:open};
  render();open(edit);
})();