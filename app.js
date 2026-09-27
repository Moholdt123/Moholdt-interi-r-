(function(){
  var form=document.getElementById('requestForm');
  var steps=document.querySelectorAll('.wizard-step');
  var progressBar=document.getElementById('progressBar');
  var stepLabel=document.getElementById('stepLabel');
  var roomsEl=document.getElementById('rooms');
  var packageOptions=document.getElementById('packageOptions');
  var suggestedOptions=document.getElementById('suggestedOptions');
  var cartItems=document.getElementById('cartItems');
  var cartBreakdown=document.getElementById('cartBreakdown');
  var finalEstimate=document.getElementById('finalEstimate');
  var finalNote=document.getElementById('finalNote');
  var finalIncluded=document.getElementById('finalIncluded');
  var photoInput=document.getElementById('photos');
  var photoList=document.getElementById('photoList');
  var status=document.getElementById('formStatus');
  var current=1;
  var roomSequence=0;

  function money(n){return new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(Math.round(n/100)*100)}
  function has(arr,val){return arr.indexOf(val)!==-1}
  function services(){var out=[],nodes=document.querySelectorAll('input[name="service"]:checked');for(var i=0;i<nodes.length;i++)out.push(nodes[i].value);return out}
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function roomTemplate(first){
    var id=++roomSequence,names=['Stue','Soverom','Gang','Kjøkken','Kontor','Annet'],icons=["M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 10H3v9h18v-9h-2M5 10v5h14v-5M5 19v2M19 19v2","M3 18V7M21 18V7M3 10h18v7H3M6 10V6h5v4M13 10V6h5v4M3 17v4M21 17v4","M6 21V3h12v18M3 21h18M14 12h1","M3 10h18v11H3zM3 4h18v6M10 10v11M14 14h3M6 14h1M6 4v3M12 4v3M18 4v3","M3 11h18M5 11v10M19 11v10M8 3h8v6H8zM12 9v2M14 16h5","M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"];
    var options=names.map(function(name,i){return '<label class="room-option"><input type="radio" class="r-type" name="room-type-'+id+'" value="'+name+'"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="'+icons[i]+'"/></svg><b>'+name+'</b><i aria-hidden="true"></i></span></label>'}).join('');
    return '<article class="room-card simple-room"><div class="room-title"><strong>Rom <span class="room-number"></span></strong>'+(first?'':'<button type="button" class="remove-room">Fjern rom</button>')+'</div><fieldset class="room-types"><legend class="room-type-legend">Velg romtype</legend><div class="room-type-grid">'+options+'</div></fieldset><div class="room-area-row"><label for="room-area-'+id+'"><span class="room-area-label">Hvor stort er gulvarealet?</span><small class="room-area-help">Et omtrentlig gulvareal er nok.</small></label><div class="room-area-input"><input id="room-area-'+id+'" class="r-area" type="number" inputmode="decimal" min="0.1" step="0.1" placeholder="20" aria-describedby="room-unit-'+id+'"><span id="room-unit-'+id+'">m²</span></div></div></article>';
  }
  function renumber(){var cards=roomsEl.querySelectorAll('.room-card');for(var i=0;i<cards.length;i++)cards[i].querySelector('.room-number').textContent=i+1}
  function bindRooms(){var fields=roomsEl.querySelectorAll('input,select');for(var i=0;i<fields.length;i++){fields[i].oninput=updateAll;fields[i].onchange=updateAll}var remove=roomsEl.querySelectorAll('.remove-room');for(var j=0;j<remove.length;j++)remove[j].onclick=function(){this.parentNode.parentNode.remove();renumber();updateAll()}}
  function addRoom(first){roomsEl.insertAdjacentHTML('beforeend',roomTemplate(first));renumber();bindRooms();updateAll()}
  function getRooms(){var cards=roomsEl.querySelectorAll('.room-card'),out=[];for(var i=0;i<cards.length;i++)out.push({type:(cards[i].querySelector('.r-type:checked')||{}).value||('Rom '+(i+1)),area:Math.max(0,Number(cards[i].querySelector('.r-area').value)||0)});return out}
  function totalArea(){var rs=getRooms(),sum=0;for(var i=0;i<rs.length;i++)sum+=rs[i].area;return sum}
  function optionChecked(name){var el=document.querySelector('input[name="'+name+'"]');return !!(el&&el.checked)}

  function buildPackageOptions(){
    var selected={},oldInputs=form.querySelectorAll('#packageOptions input, #suggestedOptions input');for(var o=0;o<oldInputs.length;o++)selected[oldInputs[o].name]=oldInputs[o].checked;var s=services(),html='';
    if(has(s,'Gulv'))html+='<div class="package-card"><div class="package-title"><div><strong>Vil du ha hjelp med noe rundt gulvleggingen?</strong><small>Selve gulvleggingen er allerede med i estimatet. Kryss bare av for det ekstra du ønsker hjelp med.</small></div><span>Valgfritt</span></div>'+
      '<label class="package-row"><input type="checkbox" name="opt_demo_floor"><span><b>Fjerne gammelt gulv</b><small>Lar du gulvet være ferdig revet før jeg kommer, betaler du ikke for rivearbeid.</small></span></label>'+
      '<label class="package-row"><input type="checkbox" name="opt_dispose"><span><b>Kjøre bort gammelt gulv og avfall</b><small>Kjører du bort avfallet selv, sparer du kostnaden for bortkjøring.</small></span></label>'+
      '<label class="package-row"><input type="checkbox" name="opt_pickup"><span><b>Hente det nye gulvet</b><small>Har du gulvet klart hjemme, slipper du kostnaden for henting.</small></span></label>'+
      '</div>';
    var suggestions='';
    if(has(s,'Gulv'))suggestions='<label class="package-row"><input type="checkbox" name="opt_skirting"><span><b>Montere nye gulvlister</b><small>Velg hvis du ønsker rommet ferdig listet etter gulvleggingen.</small></span></label>'+
      '<label class="package-row"><input type="checkbox" name="opt_furniture"><span><b>Hjelp til å flytte møbler</b><small>Tømmer du rommet selv før oppstart, kommer det ingen kostnad for møbelflytting.</small></span></label>';
    suggestedOptions.innerHTML=suggestions;
    document.getElementById('suggestedDetails').hidden=!suggestions;

    if(has(s,'Vegger og gips')||has(s,'Panel')||has(s,'Komplett rom'))html+='<div class="package-card"><div class="package-title"><div><strong>Vil du ha hjelp før arbeidet starter?</strong><small>Kryss bare av hvis du ønsker at Moholdt skal gjøre dette også.</small></div><span>Valgfritt</span></div><label class="package-row"><input type="checkbox" name="opt_demo_wall"><span><b>Rive eksisterende vegg/panel</b><small>River du selv på forhånd, betaler du ikke for rivearbeidet.</small></span></label><label class="package-row"><input type="checkbox" name="opt_dispose_other"><span><b>Kjøre bort riveavfall</b><small>Kjører du bort avfallet selv, sparer du kostnaden for bortkjøring.</small></span></label></div>';
    packageOptions.innerHTML=html||'<div class="optional-block"><strong>Ingen ekstra valg nødvendig.</strong><p>Du kan gå rett videre.</p></div>';var inputs=form.querySelectorAll('#packageOptions input, #suggestedOptions input');for(var i=0;i<inputs.length;i++){inputs[i].checked=!!selected[inputs[i].name];inputs[i].onchange=updateAll;}
  }

  function baseCalc(){var area=totalArea(),s=services(),labor=0,lines=[],included=[],review=false;if(!area||!s.length)return {labor:0,lines:[],included:[],review:false};for(var i=0;i<s.length;i++){var service=s[i],amount=0,label=service;if(service==='Gulv'){amount=Math.max(5500,320*area);label='Legging av nytt gulv';included.push('Legging og tilpasning av nytt gulv','Kapping rundt hjørner, dører og avslutninger','Normal opprydding etter arbeidet')}if(service==='Vegger og gips'){amount=520*area;included.push('Gipsing og normalt veggarbeid','Tilpasning og montering','Normal opprydding')}if(service==='Panel'){amount=390*area;included.push('Montering og tilpasning av panel','Normal opprydding')}if(service==='Lister og foringer'){amount=110*area;included.push('Montering og tilpasning av lister/foringer')}if(service==='Komplett rom'){amount=850*area;included.push('Arbeid med flere overflater i rommet','Tilpasning og montering','Normal opprydding')}if(amount){labor+=amount;lines.push([label,amount])}}
    if(has(s,'Gulv')){if(optionChecked('opt_demo_floor')){var d=1200+area*35;labor+=d;lines.push(['Fjerne gammelt gulv',d]);included.push('Fjerning av gammelt gulv')}if(optionChecked('opt_dispose')){var x=900+area*20;labor+=x;lines.push(['Bortkjøring',x]);included.push('Bortkjøring av gammelt gulv/avfall')}if(optionChecked('opt_pickup')){labor+=1000;lines.push(['Henting av gulv',1000]);included.push('Henting av nytt gulv/materialer')}if(optionChecked('opt_skirting')){var sk=1500+area*35;labor+=sk;lines.push(['Montering av gulvlister',sk]);included.push('Montering av nye gulvlister')}if(optionChecked('opt_furniture')){var f=900+area*15;labor+=f;lines.push(['Flytting av møbler',f]);included.push('Flytting av møbler før arbeidet')}}
    if(optionChecked('opt_demo_wall')){var w=1500+area*55;labor+=w;lines.push(['Rivearbeid vegg/panel',w]);included.push('Riving av eksisterende vegg/panel')}if(optionChecked('opt_dispose_other')){var b=1000+area*25;labor+=b;lines.push(['Bortkjøring riveavfall',b]);included.push('Bortkjøring av riveavfall')}var condition=document.querySelector('input[name="condition"]:checked');if(condition&&condition.value!=='ready')review=true;return {labor:labor,lines:lines,included:included,review:review}}
  function estimate(){var c=baseCalc();return {labor:c.labor,low:c.labor*.95,high:c.labor*1.10,lines:c.lines,included:c.included,review:c.review}}
  function roomCopy(selected){
    if(selected.length===1&&selected[0]==='Gulv')return {title:'Hvor skal det nye gulvet legges?',intro:'Velg rommet gulvet skal legges i, og oppgi omtrent hvor mange m² gulv du ønsker hjelp med.',legend:'Hvilket rom skal ha nytt gulv?',area:'Hvor mange m² gulv skal legges?',help:'Oppgi arealet som skal få nytt gulv.',add:'+ Legg til et rom med gulvlegging'};
    if(selected.length===1&&selected[0]==='Komplett rom')return {title:'Hvilke rom vil du fornye?',intro:'Velg romtype og oppgi et omtrentlig gulvareal for hvert rom.',legend:'Velg romtype',area:'Hvor stort er gulvarealet?',help:'Et omtrentlig gulvareal er nok.',add:'+ Legg til et rom'};
    var titles={'Vegger og gips':'Hvor skal veggarbeidet gjøres?','Panel':'Hvor skal panelet monteres?','Lister og foringer':'Hvor skal lister og foringer monteres?'};
    return {title:selected.length===1?(titles[selected[0]]||'Hvilke rom gjelder arbeidet?'):'Hvilke rom gjelder arbeidet?',intro:'Velg romtype og oppgi et omtrentlig gulvareal. Estimatet gjelder tjenestene du har valgt.',legend:'Hvilket rom gjelder arbeidet?',area:'Hvor stort er gulvarealet?',help:'Gulvarealet brukes som grunnlag for det foreløpige estimatet.',add:'+ Legg til et rom'};
  }
  function updateRoomCopy(){
    var copy=roomCopy(services());
    document.getElementById('roomStepTitle').textContent=copy.title;
    document.getElementById('roomStepIntro').textContent=copy.intro;
    document.getElementById('addRoom').textContent=copy.add;
    roomsEl.querySelectorAll('.room-type-legend').forEach(function(el){el.textContent=copy.legend});
    roomsEl.querySelectorAll('.room-area-label').forEach(function(el){el.textContent=copy.area});
    roomsEl.querySelectorAll('.room-area-help').forEach(function(el){el.textContent=copy.help});
  }
  function updateEstimatePreview(e){
    document.getElementById('liveEstimate').textContent=e.labor?money(e.low)+' – '+money(e.high):'–';
    document.getElementById('liveEstimateSummary').textContent=services().join(' + ')+' · '+totalArea()+' m²';
    document.getElementById('liveEstimateNote').textContent=e.review?'Foreløpig estimat. Underlaget må vurderes før endelig pris.':'Foreløpig estimat for arbeidet, uten materialer. Forutsetter normalt, klart underlag. Endelig pris avtales før oppstart.';
    var count=packageOptions.querySelectorAll('input:checked').length;
    document.getElementById('extrasCount').textContent=count?count+' valgt':'Valgfritt';
    var suggestedCount=suggestedOptions.querySelectorAll('input:checked').length;
    document.getElementById('suggestedCount').textContent=suggestedCount?suggestedCount+' valgt':'Valgfritt';
  }
  function updateAll(){updateRoomCopy();updateMaterialSuggestions();var e=estimate(),rs=getRooms(),html='';updateEstimatePreview(e);for(var i=0;i<rs.length;i++)html+='<div class="cart-item"><span><strong>'+esc(rs[i].type)+'</strong>'+(rs[i].area?' • '+rs[i].area+' m²':'')+'</span></div>';cartItems.innerHTML=html||'<p class="empty-cart">Legg inn et rom.</p>';var breakdown='';for(var j=0;j<e.lines.length;j++)breakdown+='<span><em>'+esc(e.lines[j][0])+'</em><strong>'+money(e.lines[j][1])+'</strong></span>';cartBreakdown.innerHTML=breakdown;if(e.labor){var text=money(e.low)+' – '+money(e.high);finalEstimate.textContent=text;finalNote.textContent=e.review?'Prisnivået er veiledende. Skjevhet/usikkert underlag må vurderes før endelig pris.':'Dette er et foreløpig estimat. Endelig pris avtales før oppstart.';}else{finalEstimate.textContent='–';finalNote.textContent='Endelig pris avtales før oppstart.'}var inc='';for(var k=0;k<e.included.length;k++)inc+='<li>✓ '+esc(e.included[k])+'</li>';finalIncluded.innerHTML=inc?'<h4>Dette er inkludert</h4><ul>'+inc+'</ul>':''}
  function showStep(n,scroll){current=n;document.getElementById('foresporsel').classList.toggle('showing-estimate',n===3);document.getElementById('postalCodeSummary').textContent=document.getElementById('postalCode').value.trim();document.querySelector('.request-layout').classList.toggle('final-step',n>=4);if(n===3)buildPackageOptions();for(var i=0;i<steps.length;i++)steps[i].classList.toggle('active',Number(steps[i].getAttribute('data-step'))===n);if(n<=4){progressBar.style.width=(n*25)+'%';stepLabel.textContent='Steg '+n+' av 4';stepLabel.style.display='block'}else{progressBar.style.width='100%';stepLabel.style.display='none'}updateAll();if(scroll!==false){var activeHeading=document.querySelector('.wizard-step.active h3');activeHeading.setAttribute('tabindex','-1');activeHeading.focus({preventScroll:true});document.getElementById('foresporsel').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'})}}
  function validate(){status.textContent='';if(!window.JobLocation||!window.JobLocation.canProceed()){status.textContent='Kontroller jobbstedet før du fortsetter.';if(window.JobLocation)window.JobLocation.open();return false}var postal=document.getElementById('postalCode'),postalStatus=document.getElementById('postalCodeStatus');postalStatus.textContent='';postal.removeAttribute('aria-invalid');if((current===1||current===4)&&!/^\d{4}$/.test(postal.value.trim())){postalStatus.textContent='Fyll inn et postnummer med fire sifre.';postal.setAttribute('aria-invalid','true');if(window.JobLocation)window.JobLocation.open();postal.focus();return false}if(current===1&&!services().length){alert('Velg minst én type arbeid.');return false}if(current===2){var rs=getRooms(),ok=false;for(var i=0;i<rs.length;i++)if(rs[i].area)ok=true;if(!ok){alert('Legg inn ca. størrelse på minst ett rom.');return false}}if(current===4){var addressIds=['streetAddress','postalTown'];for(var a=0;a<addressIds.length;a++){var addressField=document.getElementById(addressIds[a]);if(!addressField.value.trim()){status.textContent='Fyll inn gateadresse og poststed for jobben.';addressField.focus();return false}}}if(current===4&&!document.getElementById('name').value.trim()){status.textContent='Fyll inn navn.';return false}if(current===4){var email=document.getElementById('email');email.value=email.value.trim();email.removeAttribute('aria-invalid');if(!email.value||!email.checkValidity()){status.textContent='Fyll inn en gyldig e-postadresse, for eksempel navn@eksempel.no.';email.setAttribute('aria-invalid','true');email.focus();return false}}if(current===4&&!document.getElementById('phone').value.trim()){status.textContent='Fyll inn telefonnummer.';return false}return true}
  var next=document.querySelectorAll('.next');for(var i=0;i<next.length;i++)next[i].onclick=function(){if(validate())showStep(Math.min(current+1,4))};var prev=document.querySelectorAll('.prev');for(var j=0;j<prev.length;j++)prev[j].onclick=function(){showStep(Math.max(current-1,1))};document.getElementById('addRoom').onclick=function(){addRoom(false)};var globalChecks=document.querySelectorAll('input[name="service"]');for(var g=0;g<globalChecks.length;g++)globalChecks[g].onchange=updateAll;var materialStatus=document.getElementById('materialStatus');var materialFields=document.getElementById('materialFields');var floorProducts=[{"name":"Pergo Trondheim – Fresh Nordic Oak","url":"https://www.obsbygg.no/gulv/laminatgulv/2742124?v=ObsBygg-5401013674601"},{"name":"Pergo Larvik – Calm Shore Oak","url":"https://www.obsbygg.no/gulv/laminatgulv/3035381?v=ObsBygg-5401015244628"},{"name":"Pergo Trondheim – Romantic Natural Oak","url":"https://www.obsbygg.no/gulv/laminatgulv/2742124?v=ObsBygg-5401013674724"}];
  function updateMaterialSuggestions(){
    var statusEl=document.getElementById('materialStatus');
    document.getElementById('floorSuggestions').hidden=!has(services(),'Gulv')||statusEl.value==='bought';
    document.getElementById('materialFields').classList.toggle('hidden',statusEl.value==='none');
    var productName=document.getElementById('materialName').value.trim(),productLink=document.getElementById('materialLink').value.trim();
    document.querySelectorAll('.choose-floor').forEach(function(button){
      var product=floorProducts[Number(button.dataset.product)],chosen=statusEl.value!=='none'&&productName===product.name&&productLink===product.url;
      button.setAttribute('aria-pressed',String(chosen));button.textContent=chosen?'✓ Valgt':'Velg dette gulvet';
    });
    document.getElementById('materialSelection').textContent=statusEl.value!=='none'&&productName?'Produkt i forespørselen: '+productName:'';
  }
  materialStatus.onchange=function(){if(materialStatus.value==='none'){document.getElementById('materialName').value='';document.getElementById('materialLink').value=''}updateMaterialSuggestions()};
  document.querySelectorAll('.choose-floor').forEach(function(button){button.onclick=function(){
    var product=floorProducts[Number(button.dataset.product)];
    materialStatus.value='considered';document.getElementById('materialName').value=product.name;document.getElementById('materialLink').value=product.url;updateMaterialSuggestions();
  }});
  document.getElementById('materialName').addEventListener('input',updateMaterialSuggestions);
  document.getElementById('materialLink').addEventListener('input',updateMaterialSuggestions);var conditionNodes=document.querySelectorAll('input[name="condition"]');for(var c=0;c<conditionNodes.length;c++)conditionNodes[c].onchange=updateAll;photoInput.onchange=function(){photoList.innerHTML=photoInput.files.length?'<strong>'+photoInput.files.length+' bilder valgt</strong>':'<span>Ingen bilder valgt.</span>'};
  form.onsubmit=function(ev){ev.preventDefault();if(current!==4)return;if(!services().length){showStep(1);return}if(!totalArea()){showStep(2);return}if(!validate())return;var p=estimate(),condition=document.querySelector('input[name="condition"]:checked');var inquiry={id:Date.now(),customer:document.getElementById('name').value.trim(),phone:document.getElementById('phone').value.trim(),email:document.getElementById('email').value.trim(),address:{street:document.getElementById('streetAddress').value.trim(),postalCode:document.getElementById('postalCode').value.trim(),town:document.getElementById('postalTown').value.trim()},rooms:getRooms(),services:services(),timing:document.getElementById('timing').value,options:{demoFloor:optionChecked('opt_demo_floor'),dispose:optionChecked('opt_dispose'),pickup:optionChecked('opt_pickup'),skirting:optionChecked('opt_skirting'),furniture:optionChecked('opt_furniture'),demoWall:optionChecked('opt_demo_wall'),disposeOther:optionChecked('opt_dispose_other')},material:{status:materialStatus.value,name:document.getElementById('materialName').value.trim(),link:document.getElementById('materialLink').value.trim()},condition:condition?condition.value:'ready',description:document.getElementById('description').value.trim(),photos:[],estimate:p.labor?money(p.low)+' – '+money(p.high):'Må vurderes',needsReview:p.review,status:'new',createdAt:new Date().toISOString()};for(var i=0;i<photoInput.files.length;i++)inquiry.photos.push(photoInput.files[i].name);try{
      if(!window.MoholdtMail)throw new Error('Innsendingen kunne ikke lastes. Last siden på nytt og prøv igjen.');
      window.MoholdtMail.send(inquiry,p,photoInput.files);
      status.textContent='Du sendes videre til en sikkerhetssjekk. Fullfør den for å sende forespørselen.';
    }catch(err){status.textContent=err.message||'Innsendingen kunne ikke startes. Prøv igjen. Opplysningene står fortsatt i skjemaet.'}
  };

  addRoom(true);showStep(1,false);
})();