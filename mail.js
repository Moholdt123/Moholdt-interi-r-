/* Bytt recipient her når bedriften får ny e-postadresse.
 * Den nye adressen må aktiveres hos FormSubmit etter første innsending.
 */
(function(root){
  var config={recipient:'moholdt2001@gmail.com',maxPhotoBytes:10000000};
  function fields(inquiry,price){
    var conditions={ready:'Rett og klart for gulv',lay_as_is:'Skjevt – kunden ønsker gulvet lagt som det er',check:'Ønsker kontroll av underlaget',level:'Vet at det må avrettes'};
    var materialStatus={none:'Ikke valgt / usikker',considered:'Har sett på materialer',bought:'Har kjøpt materialer'};
    var area=inquiry.rooms.reduce(function(sum,room){return sum+room.area},0);
    var clean=function(s){return String(s).replace(/[\r\n]/g,' ').slice(0,180)};
    return {
      _subject:clean('Ny forespørsel – '+inquiry.services.join(', ')+' – '+area+' m² – '+inquiry.address.town),
      _template:'table',
      _replyto:inquiry.email,
      name:inquiry.customer,
      email:inquiry.email,
      Telefon:inquiry.phone,
      Jobbadresse:inquiry.address.street+', '+inquiry.address.postalCode+' '+inquiry.address.town,
      Arbeid:inquiry.services.join(', '),
      Rom:inquiry.rooms.map(function(r){return r.type+': '+r.area+' m²'}).join('\n'),
      'Ønsket tidspunkt':inquiry.timing,
      'Kundens prisestimat':inquiry.estimate,
      'Inkludert i estimatet':price.included.join('\n'),
      Underlag:conditions[inquiry.condition]||'Må avklares',
      Materialer:[materialStatus[inquiry.material.status],inquiry.material.name,inquiry.material.link].filter(Boolean).join('\n'),
      'Beskjed fra kunden':inquiry.description||'Ingen ekstra beskjed',
      'Mottatt fra skjema':inquiry.createdAt,
      'Referanse':String(inquiry.id),
      'Til vurdering':'Uforpliktende forespørsel. Kunden er ikke lovet en jobb eller oppstart. Vurder adresse og kjøretid manuelt (inntil 90 minutter fra Vikersund). Kalkulatoren bruker foreløpige priser; endelig pris, materialer, kjøring og eventuell mva. må avklares.'
    };
  }
  function send(inquiry,price,photos){
    var total=0;
    for(var i=0;i<photos.length;i++){total+=photos[i].size;if(!/^image\//.test(photos[i].type))throw new Error('Legg bare ved bildefiler. Fjern andre filtyper før du sender.')}
    if(total>config.maxPhotoBytes)throw new Error('Bildene er større enn 10 MB til sammen. Velg færre eller mindre bilder.');
    var outgoing=document.createElement('form');
    outgoing.method='POST';outgoing.action='https://formsubmit.co/'+encodeURIComponent(config.recipient);
    outgoing.enctype='multipart/form-data';outgoing.hidden=true;
    var data=fields(inquiry,price);
    data._next=new URL('takk.html',root.location.href).href;
    Object.keys(data).forEach(function(key){var input=document.createElement('input');input.type='hidden';input.name=key;input.value=data[key];outgoing.appendChild(input)});
    for(var p=0;p<photos.length;p++){
      var attachment=document.createElement('input');attachment.type='file';attachment.name=p===0?'attachment':'attachment'+(p+1);
      var transfer=new DataTransfer();transfer.items.add(photos[p]);attachment.files=transfer.files;outgoing.appendChild(attachment);
    }
    document.body.appendChild(outgoing);
    try{HTMLFormElement.prototype.submit.call(outgoing)}catch(error){outgoing.remove();throw error}
  }
  root.MoholdtMail={config:config,fields:fields,send:send};
})(window);
