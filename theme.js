(function(){
  var KEY='eoe-theme-mode';
  var T={
    light:{name:'Светлая',hint:'белый фон',bg:'#f5f5f5',ink:'#1a1a1a'},
    sepia:{name:'Сепия',hint:'светлый кофе',bg:'#efe7dd',ink:'#3a2f28'},
    gray:{name:'Серая',hint:'мягкий контраст',bg:'#e2e2df',ink:'#2a2a2a'},
    dark:{name:'Тёмная',hint:'чёрный фон',bg:'#121212',ink:'#e8e8e8'},
    night:{name:'Ночная сепия',hint:'читать в темноте',bg:'#1c1711',ink:'#e4d6bc'},
    auto:{name:'Как в системе',hint:'светлая или тёмная',bg:'linear-gradient(135deg,#f5f5f5 50%,#121212 50%)',ink:'#777'}
  };
  var order=['light','sepia','gray','dark','night','auto'];
  function get(){ try{ var m=localStorage.getItem(KEY); return T[m]?m:'light'; }catch(e){ return 'light'; } }
  function apply(m){
    var r=document.documentElement; if(m==='auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme',m);
    var mc=document.querySelector('meta[name="theme-color"]'); if(mc) mc.setAttribute('content',m==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'#121212':'#f5f5f5'):T[m].bg);
    var b=document.getElementById('theme-btn'); if(b){ b.textContent=''; var sw=document.createElement('span'); sw.className='tsw'; sw.style.cssText='width:14px;height:14px;border-radius:50%;border:1px solid var(--rule);background:'+T[m].bg; b.appendChild(sw); b.appendChild(document.createTextNode(T[m].name)); b.title='Тема: '+T[m].name; }
    var menu=document.getElementById('theme-menu'); if(menu) Array.prototype.forEach.call(menu.children,function(x){ x.setAttribute('aria-checked',x.dataset.m===m?'true':'false'); });
  }
  function set(m){ try{ localStorage.setItem(KEY,m); }catch(e){} apply(m); }
  function build(){
    var b=document.getElementById('theme-btn'); if(!b||document.getElementById('theme-menu')) return;
    var w=document.createElement('div'); w.className='theme-wrap'; b.parentNode.insertBefore(w,b); w.appendChild(b);
    b.setAttribute('aria-haspopup','true'); b.setAttribute('aria-expanded','false');
    var menu=document.createElement('div'); menu.id='theme-menu'; menu.className='theme-menu'; menu.setAttribute('role','menu'); menu.hidden=true;
    order.forEach(function(k){ var o=document.createElement('button'); o.type='button'; o.dataset.m=k; o.setAttribute('role','menuitemradio');
      o.innerHTML='<span class="sw" style="background:'+T[k].bg+';color:'+T[k].ink+'">Аа</span><span>'+T[k].name+'<small>'+T[k].hint+'</small></span>'; menu.appendChild(o); });
    w.appendChild(menu);
  }
  function toggle(open){ var menu=document.getElementById('theme-menu'), b=document.getElementById('theme-btn'); if(!menu) return; menu.hidden=!open; b.setAttribute('aria-expanded',open?'true':'false'); }
  build(); apply(get());
  document.addEventListener('click',function(e){
    var t=e.target.closest?e.target:null; if(!t) return;
    var opt=t.closest('#theme-menu button'); if(opt){ set(opt.dataset.m); toggle(false); return; }
    if(t.closest('#theme-btn')){ var menu=document.getElementById('theme-menu'); toggle(menu.hidden); return; }
    if(!t.closest('#theme-menu')) toggle(false);
  });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') toggle(false); });
  window.__eoeTheme={get:get,apply:apply,set:set};
})();
