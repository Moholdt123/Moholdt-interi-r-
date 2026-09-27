(function(){
  var el=function(id){return document.getElementById(id)};
  var parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  var value=function(type){return Number(parts.filter(function(p){return p.type===type})[0].value)};
  var today=new Date(value('year'),value('month')-1,value('day'),12);
  var month=new Date(today.getFullYear(),today.getMonth(),1,12),selected='',blocked=new Set(),loaded=false;
  var monthFormat=new Intl.DateTimeFormat('nb-NO',{month:'long',year:'numeric'});
  var dayFormat=new Intl.DateTimeFormat('nb-NO',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  function key(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
  function render(){
    el('calendarMonth').textContent=monthFormat.format(month);
    el('previousMonth').disabled=month.getFullYear()===today.getFullYear()&&month.getMonth()===today.getMonth();
    var offset=(month.getDay()+6)%7,days=new Date(month.getFullYear(),month.getMonth()+1,0,12).getDate(),html='';
    for(var cell=0;cell<Math.ceil((offset+days)/7)*7;cell++){
      if(cell%7===0)html+='<tr>';
      var number=cell-offset+1;
      if(number<1||number>days)html+='<td></td>';
      else{
        var date=new Date(month.getFullYear(),month.getMonth(),number,12),id=key(date),past=id<key(today),busy=blocked.has(id),chosen=id===selected;
        html+='<td><button type="button" data-date="'+id+'" class="'+(busy?'date-busy':past?'date-past':'date-available')+'" aria-label="'+dayFormat.format(date)+(busy?', opptatt':'')+'" aria-pressed="'+chosen+'"'+(past||busy||!loaded?' disabled':'')+'>'+number+(busy?'<small>Opptatt</small>':'')+'</button></td>';
      }
      if(cell%7===6)html+='</tr>';
    }
    el('calendarDays').innerHTML=html;
    el('busyLegend').hidden=blocked.size===0;
  }
  function preference(text){
    selected='';el('timing').dataset.date='';el('timing').value=text;el('dateSelection').textContent='Ønsket tidspunkt: '+text;
    el('dateFlexible').setAttribute('aria-pressed',String(text==='Fleksibelt'));
    el('dateSoon').setAttribute('aria-pressed',String(text==='Så snart som mulig'));render();
  }
  el('dateFlexible').onclick=function(){preference('Fleksibelt')};
  el('dateSoon').onclick=function(){preference('Så snart som mulig')};
  el('previousMonth').onclick=function(){if(this.disabled)return;month=new Date(month.getFullYear(),month.getMonth()-1,1,12);render()};
  el('nextMonth').onclick=function(){month=new Date(month.getFullYear(),month.getMonth()+1,1,12);render()};
  el('calendarDays').onclick=function(event){
    var button=event.target.closest('button[data-date]');if(!button||button.disabled||!loaded)return;
    var id=button.dataset.date;if(blocked.has(id)||id<key(today))return;
    selected=id;el('timing').dataset.date=id;var p=id.split('-'),date=new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),12);
    el('timing').value='Ønsket oppstart: '+dayFormat.format(date);
    el('dateSelection').textContent=el('timing').value;
    el('dateFlexible').setAttribute('aria-pressed','false');el('dateSoon').setAttribute('aria-pressed','false');render();
    var chosen=el('calendarDays').querySelector('[data-date="'+id+'"]');if(chosen)chosen.focus({preventScroll:true});
  };
  window.addEventListener('project-timing',function(event){
    var detail=event.detail;
    preference(typeof detail==='string'?detail:(detail&&detail.text)||'Fleksibelt');
    if(detail&&detail.date&&/^\d{4}-\d{2}-\d{2}$/.test(detail.date)){
      if(detail.date<key(today)||blocked.has(detail.date)){preference('Fleksibelt');el('dateSelection').textContent='Tidligere ønsket dato er passert eller opptatt. Velg en ny dato.';return}
      var p=detail.date.split('-');selected=detail.date;el('timing').dataset.date=selected;month=new Date(Number(p[0]),Number(p[1])-1,1,12);render();
    }
  });
  render();
  fetch('availability.json',{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('calendar');return response.json()}).then(function(data){
    if(!Array.isArray(data.blockedDates)||!data.blockedDates.every(function(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)}))throw new Error('calendar');
    blocked=new Set(data.blockedDates);loaded=true;
    el('calendarAvailability').textContent=blocked.size?'Røde dager er opptatt. Andre datoer kan ønskes, men må bekreftes av Moholdt.':'Ingen opptatte dager er registrert ennå. Velg gjerne en ønsket dato – Moholdt bekrefter tilgjengeligheten.';
    render();
  }).catch(function(){el('calendarAvailability').textContent='Kalenderen kunne ikke lastes. Velg Fleksibelt eller Så snart som mulig, eller last siden på nytt.';});
})();
