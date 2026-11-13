(function(){
  var KEY='eoe-theme-mode', modes=['light','dark','auto'], labels={light:'Светлая',dark:'Тёмная',auto:'Как в системе'};
  var icons={light:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',dark:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',auto:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/>'};
  function get(){ try{ return localStorage.getItem(KEY)||'light'; }catch(e){ return 'light'; } }
  function apply(m){ var r=document.documentElement; if(m==='auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme',m);
    var b=document.getElementById('theme-btn'); if(b){ b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[m]+'</svg>'; b.appendChild(document.createTextNode(labels[m])); b.title='Тема: '+labels[m]+' (нажми, чтобы сменить)'; } }
  window.__eoeTheme={get:get,apply:apply,next:function(){ var m=modes[(modes.indexOf(get())+1)%3]; try{ localStorage.setItem(KEY,m); }catch(e){} apply(m); }};
  apply(get());
})();
document.addEventListener('click',function(e){ if(e.target.closest&&e.target.closest('#theme-btn')) window.__eoeTheme.next(); });
