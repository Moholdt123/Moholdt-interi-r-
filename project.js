(function(){
  var buttons=document.querySelectorAll('[data-project-view]');
  buttons.forEach(function(button){
    button.addEventListener('click',function(){
      var view=button.getAttribute('data-project-view');
      document.getElementById('project-before').hidden=view!=='before';
      document.getElementById('project-after').hidden=view!=='after';
      buttons.forEach(function(item){item.setAttribute('aria-pressed',String(item===button))});
    });
  });
})();