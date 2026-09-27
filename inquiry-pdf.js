/* Small self-contained PDF writer: no customer data sent to a PDF service. */
(function(root){
  function literal(value){
    return String(value==null?'':value).normalize('NFC').replace(/[–—−]/g,'-').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/[\u0000-\u001f]/g,' ').split('').map(function(char){
      var n=char.charCodeAt(0);if(char==='('||char===')'||char==='\\')return '\\'+char;
      if(n>=32&&n<=126)return char;
      if(n>=160&&n<=255)return '\\'+n.toString(8).padStart(3,'0');
      return '?';
    }).join('');
  }
  function create(inquiry){
    var data=root.MoholdtMail.fields(inquiry,{included:inquiry.pdfIncluded||[]}),pages=[],commands=[],y=0,pageNumber=0;
    function text(value,x,top,size,bold,color){commands.push((color||'0.16 0.20 0.16')+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf 1 0 0 1 '+x+' '+(842-top)+' Tm ('+literal(value)+') Tj ET')}
    function box(x,top,w,h,color){commands.push(color+' rg '+x+' '+(842-top-h)+' '+w+' '+h+' re f')}
    function finish(){if(commands.length){text('MOHOLDT  |  Uforpliktende jobbforespørsel',44,808,9,false,'0.40 0.44 0.40');text(String(pageNumber),535,808,9);pages.push(commands.join('\n'))}}
    function page(){finish();commands=[];pageNumber++;box(0,0,595,88,'0.17 0.26 0.19');text('MOHOLDT',44,40,20,true,'1 1 1');text('JOBBFORESPØRSEL',44,63,9,false,'0.84 0.89 0.82');text('Ref. '+inquiry.id,390,43,10,false,'1 1 1');y=116}
    function ensure(height){if(y+height>776)page()}
    function wrap(value,max){
      var lines=[];String(value||'').split(/\r?\n/).forEach(function(paragraph){
        var line='';paragraph.split(/\s+/).forEach(function(word){
          while(word.length>max){if(line){lines.push(line);line=''}lines.push(word.slice(0,max));word=word.slice(max)}
          if((line+' '+word).trim().length>max){lines.push(line);line=word}else line=(line+' '+word).trim();
        });lines.push(line);
      });return lines;
    }
    function paragraph(value,size){size=size||10;wrap(value,Math.floor(507/(size*.60))).forEach(function(line){ensure(size+5);text(line,44,y,size,false);y+=size+5})}
    function section(title,value){if(!value)return;ensure(65);box(44,y-14,507,25,'0.92 0.94 0.89');text(title,52,y+3,11,true);y+=27;paragraph(value);y+=17}
    page();text('Ny jobbforespørsel',44,y,18,true);y+=25;
    paragraph(new Intl.DateTimeFormat('nb-NO',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Oslo'}).format(new Date(inquiry.createdAt)),10);y+=14;
    box(44,y-10,507,77,'0.92 0.94 0.89');text('SAMLET VEILEDENDE ESTIMAT',58,y+9,9,true);text(inquiry.estimate||'Må vurderes',58,y+38,24,true);y+=85;
    paragraph('Dette er en forespørsel, ikke et bindende tilbud. Endelig pris, omfang og tidspunkt avtales med kunden. Materialer kommer i tillegg til arbeidsestimatet.');y+=14;
    section('Kunde',data.Kunde);section('Jobbadresse',data.Jobbadresse);
    if(inquiry.projects&&inquiry.projects.length){
      section('Prosjektoversikt',inquiry.projects.map(function(job,index){return (index+1)+'. '+job.services.join(' + ')+' | '+job.estimate}).join('\n'));
      Object.keys(data).filter(function(key){return key.indexOf('Jobb ')===0}).forEach(function(key){page();section(key,data[key])});
    }else{
      section('Ønsket tidspunkt',inquiry.timing);
      ['Arbeid','Materialer','Gulvlister','Henting','Underlag','Hindringer','Beskjed'].forEach(function(key){section(key,data[key])});
    }
    section('Vedlegg',inquiry.photos&&inquiry.photos.length?inquiry.photos.join('\n'):'Ingen bilder vedlagt.');
    section('Prisforbehold',data.Merknad);finish();
    var objects=[null,'<< /Type /Catalog /Pages 2 0 R >>','', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'],kids=[];
    pages.forEach(function(stream){var id=objects.length;kids.push(id+' 0 R');objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+(id+1)+' 0 R >>');objects.push('<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream')});
    objects[2]='<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+pages.length+' >>';
    var output='%PDF-1.4\n',offsets=[0];for(var i=1;i<objects.length;i++){offsets[i]=output.length;output+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}
    var xref=output.length;output+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
    for(var j=1;j<objects.length;j++)output+=String(offsets[j]).padStart(10,'0')+' 00000 n \n';
    output+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    return new File([output],'Moholdt-foresporsel-'+String(inquiry.id).replace(/[^a-zA-Z0-9-]/g,'')+'.pdf',{type:'application/pdf'});
  }
  root.MoholdtPDF={create:create};
})(window);
