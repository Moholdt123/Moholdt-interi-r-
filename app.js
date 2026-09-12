(function(){
  var form=document.getElementById('requestForm');
  var steps=document.querySelectorAll('.wizard-step');
  var progressBar=document.getElementById('progressBar');
  var stepLabel=document.getElementById('stepLabel');
  var roomsEl=document.getElementById('rooms');
  var cartItems=document.getElementById('cartItems');
  var cartBreakdown=document.getElementById('cartBreakdown');
  var cartEstimate=document.getElementById('cartEstimate');
  var cartEstimateNote=document.getElementById('cartEstimateNote');
  var finalEstimate=document.getElementById('finalEstimate');
  var materialInfo=document.getElementById('materialInfo');
  var photoInput=document.getElementById('photos');
  var photoList=document.getElementById('photoList');
  var status=document.getElementById('formStatus');
  var current=1;
  var roomSeq=0;

  function money(n){return new Intl.NumberFormat('nb-NO',{style:'currency',currency:'NOK',maximumFractionDigits:0}).format(Math.round(n/100)*100)}
  function globalServices(){var a=[],nodes=document.querySelectorAll('input[name="service"]:checked');for(var i=0;i<nodes.length;i++)a.push(nodes[i].value);return a}
  function has(arr,val){return arr.indexOf(val)!==-1}
  function selectedValues(root,selector){var out=[],nodes=root.querySelectorAll(selector+':checked');for(var i=0;i<nodes.length;i++)out.push(nodes[i].value);return out}

  function roomTemplate(first){
    var defaults=globalServices();
    var services=['Gulv','Vegger og gips','Panel','Lister og foringer','Avretting','Komplett rom'];
    var s='';
    s+='<article class="room-card">';
    s+='<div class="room-title"><strong>Rom <span class="room-number"></span></strong>'+(first?'':'<button type="button" class="remove-room">Fjern</button>')+'</div>';
    s+='<div class="field-grid"><label>Type rom<select class="r-type"><option value="">Velg romtype</option><option>Stue</option><option>Soverom</option><option>Gang</option><option>Kjøkken</option><option>Kontor</option><option>Annet</option></select></label><label>Ca. størrelse<input class="r-area" type="number" min="1" placeholder="f.eks. 20 m²"></label></div>';
    s+='<div class="room-services">';
    for(var i=0;i<services.length;i++)s+='<label><input class="r-service" type="checkbox" value="'+services[i]+'" '+(has(defaults,services[i])?'checked':'')+'><span>'+services[i]+'</span></label>';
    s+='</div>';
    s+='<label class="full-label">Hvordan er eksisterende gulv/vegger?<select class="r-condition"><option value="ready">Normalt / klart for arbeid</option><option value="uneven">Jeg vet at noe er skjevt</option><option value="unsure">Usikker</option></select></label>';
    s+='<div class="uncertain-note">Ved skjevhet eller usikkert underlag prises eventuell oppretting etter vurdering/befaring.</div>';
    s+='<h4>Skal noe rives først?</h4><div class="demo-grid"><label><input class="r-demo" type="checkbox" value="wall"><span>Veggplater / panel</span></label><label><input class="r-demo" type="checkbox" value="ceiling"><span>Himling</span></label><label><input class="r-demo" type="checkbox" value="floor"><span>Gammelt gulv</span></label><label><input class="r-demo" type="checkbox" value="trim"><span>Lister</span></label></div>';
    s+='<label class="full-label">Omfang av riving<select class="r-demo-size"><option value="none">Ingen / lite</option><option value="some">Noe riving</option><option value="large">Mye / hele rommet</option></select></label>';
    s+='<div class="floor-room-options"><h4>Gulv</h4><label class="full-label">Hvem kjøper gulvet?<select class="r-floor-source"><option value="customer">Jeg kjøper gulvet selv</option><option value="moholdt">Moholdt ordner gulvet</option></select></label><div class="demo-grid"><label><input class="r-extra" type="checkbox" value="dispose"><span>Bortkjøring</span></label><label><input class="r-extra" type="checkbox" value="furniture"><span>Flytte møbler</span></label><label><input class="r-extra" type="checkbox" value="skirting"><span>Montere gulvlister</span></label><label><input class="r-extra" type="checkbox" value="pickup"><span>Hente gulv</span></label></div><label class="full-label">Pris på valgt gulv <small>(valgfritt – kun materialinfo)</small><input class="r-floor-price" type="number" min="0" placeholder="kr/m²"></label></div>';
    s+='<label class="full-label">Kort beskrivelse<textarea class="r-description" rows="3" placeholder="Hva ønsker du gjort i dette rommet?"></textarea></label>';
    s+='</article>';
    return s;
  }

  function renumber(){var cards=roomsEl.querySelectorAll('.room-card');for(var i=0;i<cards.length;i++)cards[i].querySelector('.room-number').textContent=i+1}
  function bindRoomEvents(){
    var fields=roomsEl.querySelectorAll('input,select,textarea');
    for(var i=0;i<fields.length;i++){fields[i].oninput=updateCart;fields[i].onchange=updateCart}
    var remove=roomsEl.querySelectorAll('.remove-room');
    for(var j=0;j<remove.length;j++)remove[j].onclick=function(){this.parentNode.parentNode.remove();renumber();updateCart()};
  }
  function addRoom(first){roomSeq++;roomsEl.insertAdjacentHTML('beforeend',roomTemplate(first));renumber();bindRoomEvents();updateCart()}

  function getRooms(){
    var cards=roomsEl.querySelectorAll('.room-card'),out=[];
    for(var i=0;i<cards.length;i++){
      var r=cards[i];
      out.push({
        number:i+1,
        type:r.querySelector('.r-type').value||('Rom '+(i+1)),
        area:Math.max(0,Number(r.querySelector('.r-area').value)||0),
        services:selectedValues(r,'.r-service'),
        condition:r.querySelector('.r-condition').value,
        demo:selectedValues(r,'.r-demo'),
        demoSize:r.querySelector('.r-demo-size').value,
        extras:selectedValues(r,'.r-extra'),
        floorSource:r.querySelector('.r-floor-source').value,
        floorPrice:Math.max(0,Number(r.querySelector('.r-floor-price').value)||0),
        description:r.querySelector('.r-description').value.trim()
      });
    }
    return out;
  }

  function calcRoom(r){
    var result={labor:0,material:0,lines:[],review:false};
    if(!r.area||!r.services.length)return result;
    result.review=r.condition!=='ready'||has(r.services,'Avretting');
    for(var i=0;i<r.services.length;i++){
      var service=r.services[i],amount=0;
      if(service==='Avretting')continue;
      if(service==='Gulv')amount=Math.max(5500,320*r.area);
      if(service==='Vegger og gips')amount=520*r.area;
      if(service==='Panel')amount=390*r.area;
      if(service==='Lister og foringer')amount=110*r.area;
      if(service==='Komplett rom')amount=850*r.area;
      if(amount){result.labor+=amount;result.lines.push([service==='Gulv'?'Gulvlegging':service,amount])}
    }
    if(r.demo.length){
      if(r.demoSize==='large'){result.review=true;result.lines.push(['Større riving','Må vurderes'])}
      else{var demoAmount=1200+r.demo.length*450+r.area*(r.demoSize==='some'?45:20);result.labor+=demoAmount;result.lines.push(['Rivearbeid',demoAmount])}
    }
    if(has(r.services,'Gulv')){
      for(var j=0;j<r.extras.length;j++){
        var x=r.extras[j],extraAmount=0,label='';
        if(x==='dispose'){label='Bortkjøring';extraAmount=900+20*r.area}
        if(x==='furniture'){label='Flytte møbler';extraAmount=900+15*r.area}
        if(x==='skirting'){label='Montering gulvlister';extraAmount=1500+35*r.area}
        if(x==='pickup'){label='Hente gulv';extraAmount=1000}
        if(extraAmount){result.labor+=extraAmount;result.lines.push([label,extraAmount])}
      }
      if(r.floorSource==='moholdt'&&r.floorPrice)result.material=r.floorPrice*r.area*1.08;
    }
    return result;
  }

  function estimate(){
    var rooms=getRooms(),details=[],labor=0,material=0,review=false;
    for(var i=0;i<rooms.length;i++){var c=calcRoom(rooms[i]);labor+=c.labor;material+=c.material;if(c.review)review=true;details.push({room:rooms[i],calc:c})}
    return {labor:labor,material:material,review:review,details:details,low:labor*.95,high:labor*1.10};
  }

  function updateCart(){
    var e=estimate(),rooms=getRooms(),html='';
    for(var i=0;i<rooms.length;i++)html+='<div class="cart-item"><span><strong>'+rooms[i].type+'</strong>'+(rooms[i].area?' • '+rooms[i].area+' m²':'')+'</span></div>';
    cartItems.innerHTML=html||'<p class="empty-cart">Legg inn et rom.</p>';
    var breakdown='';
    for(var j=0;j<e.details.length;j++){
      var d=e.details[j];if(!d.calc.lines.length)continue;
      breakdown+='<div class="break-room"><b>'+d.room.type+'</b>';
      for(var k=0;k<d.calc.lines.length;k++){var line=d.calc.lines[k];breakdown+='<span><em>'+line[0]+'</em><strong>'+(typeof line[1]==='number'?money(line[1]):line[1])+'</strong></span>'}
      if(d.calc.review)breakdown+='<small>⚠ Oppretting/omfang må vurderes før endelig pris.</small>';
      breakdown+='</div>';
    }
    cartBreakdown.innerHTML=breakdown;
    if(e.labor){var text=money(e.low)+' – '+money(e.high);cartEstimate.textContent=text;finalEstimate.textContent=text;cartEstimateNote.textContent=e.review?'Arbeidsestimat. Deler av jobben må vurderes før fastpris.':'Arbeid og tjenester. Endelig pris bekreftes før avtale.'}
    else{cartEstimate.textContent='–';finalEstimate.textContent='–';cartEstimateNote.textContent='Oppgi størrelse og arbeid.'}
    materialInfo.innerHTML=e.material?'<span>Materialer – kun til orientering</span><strong>Gulv ca. '+money(e.material)+'</strong><small>Ca. 8 % kapp/svinn er med. Materialpris påvirker ikke Moholdts pris for arbeid.</small>':'';
  }

  function showStep(n){
    current=n;
    for(var i=0;i<steps.length;i++)steps[i].classList.toggle('active',Number(steps[i].getAttribute('data-step'))===n);
    if(n<=4){progressBar.style.width=(n*25)+'%';stepLabel.textContent='Steg '+n+' av 4';stepLabel.style.display='block'}else{progressBar.style.width='100%';stepLabel.style.display='none'}
    updateCart();
    window.location.hash='foresporsel';
  }
  function validate(){
    status.textContent='';
    if(current===1&&!globalServices().length){alert('Velg minst én type arbeid.');return false}
    if(current===2){var rs=getRooms(),ok=false;for(var i=0;i<rs.length;i++)if(rs[i].area&&rs[i].services.length)ok=true;if(!ok){alert('Legg inn minst ett rom med størrelse og arbeid.');return false}}
    if(current===4&&!document.getElementById('name').value.trim()){status.textContent='Fyll inn navn.';return false}
    if(current===4&&!document.getElementById('phone').value.trim()){status.textContent='Fyll inn telefonnummer.';return false}
    return true;
  }

  var next=document.querySelectorAll('.next');for(var i=0;i<next.length;i++)next[i].onclick=function(){if(validate())showStep(Math.min(current+1,4))};
  var prev=document.querySelectorAll('.prev');for(var j=0;j<prev.length;j++)prev[j].onclick=function(){showStep(Math.max(current-1,1))};
  var gotoButtons=document.querySelectorAll('[data-goto]');for(var k=0;k<gotoButtons.length;k++)gotoButtons[k].onclick=function(){showStep(Number(this.getAttribute('data-goto')))};
  document.getElementById('cartBack').onclick=function(){showStep(Math.max(current-1,1))};
  document.getElementById('addRoom').onclick=function(){addRoom(false)};
  var globalChecks=document.querySelectorAll('input[name="service"]');for(var g=0;g<globalChecks.length;g++)globalChecks[g].onchange=function(){var first=roomsEl.querySelector('.room-card');if(first){var roomChecks=first.querySelectorAll('.r-service');var selected=globalServices();for(var z=0;z<roomChecks.length;z++)roomChecks[z].checked=has(selected,roomChecks[z].value)}updateCart()};
  photoInput.onchange=function(){photoList.innerHTML=photoInput.files.length?'<strong>'+photoInput.files.length+' bilder valgt</strong>':'<span>Ingen bilder valgt.</span>'};
  form.onsubmit=function(ev){ev.preventDefault();if(!validate())return;var p=estimate(),inquiry={id:Date.now(),customer:document.getElementById('name').value.trim(),phone:document.getElementById('phone').value.trim(),rooms:getRooms(),timing:document.getElementById('timing').value,photos:[],estimate:p.labor?money(p.low)+' – '+money(p.high):'Må vurderes',materialEstimate:p.material?money(p.material):null,needsReview:p.review,status:'new',createdAt:new Date().toISOString()};for(var i=0;i<photoInput.files.length;i++)inquiry.photos.push(photoInput.files[i].name);var q=JSON.parse(localStorage.getItem('moholdtInquiries')||'[]');q.unshift(inquiry);localStorage.setItem('moholdtInquiries',JSON.stringify(q));showStep(5)};

  addRoom(true);
  showStep(1);
})();