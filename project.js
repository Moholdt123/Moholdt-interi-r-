(function(){
  var stage=document.getElementById('roomComparison'),range=document.getElementById('comparisonRange');
  if(!stage||!range)return;
  var activePointer=null;
  function update(value){
    var n=Math.max(0,Math.min(100,Number(value)||0));
    range.value=String(n);stage.style.setProperty('--split',n+'%');
    range.setAttribute('aria-valuetext',Math.round(n)+' prosent førbilde');
    stage.dataset.view=n===100?'before':n===0?'after':'both';
  }
  function position(event){var bounds=stage.getBoundingClientRect();if(bounds.width)update((event.clientX-bounds.left)/bounds.width*100)}
  range.addEventListener('input',function(){update(range.value)});
  stage.addEventListener('pointerdown',function(event){
    if(event.isPrimary===false||(event.button!==undefined&&event.button!==0))return;
    activePointer=event.pointerId;stage.setPointerCapture(event.pointerId);position(event);
  });
  stage.addEventListener('pointermove',function(event){if(event.pointerId===activePointer)position(event)});
  function finish(event){if(event.pointerId===activePointer){activePointer=null;if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId)}}
  stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);
  stage.addEventListener('lostpointercapture',function(){activePointer=null});
  document.getElementById('showBefore').addEventListener('click',function(){update(100)});
  document.getElementById('showAfter').addEventListener('click',function(){update(0)});
  update(range.value);
})();