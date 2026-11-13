(function(){
  function start(D){
  var T=D.themes;
  function el(tag,cls,txt){ var n=document.createElement(tag); if(cls) n.className=cls; if(txt!=null) n.textContent=txt; return n; }
  function nums(str){ var out=[]; String(str).replace(/(\d+)\s*[–-]\s*(\d+)|(\d+)/g,function(m,a,b,c){ if(a){ for(var i=+a;i<=+b;i++) out.push(i);} else out.push(+c); return m; }); return out; }
  function chOf(q){ var n=nums(q.ch); return n[0]; }
  var CUR=D.current.ch, MAXCH=D.chapters.length;

  // header
  document.getElementById('bar').style.width=D.current.pct+'%';
  document.getElementById('pct').textContent='≈'+Math.round(D.current.pct)+'% · гл. '+CUR+' из 55';
  var pill=document.getElementById('where-pill'); pill.textContent='Читаю: гл. '+CUR+' · '+D.current.note;
  pill.addEventListener('click',function(){ go('chapter',CUR); });

  // quote card
  function quoteCard(q){
    var c=el('article','q'+(q.themes.indexOf('claude')>-1?' claude':''));
    c.appendChild(el('blockquote',null,'«'+q.text+'»'));
    var m=el('div','meta'); m.appendChild(el('span',null,q.ch+(q.loc?' · Loc '+q.loc:(q.sec?' · '+q.sec:''))));
    q.themes.forEach(function(t){ m.appendChild(el('span',t==='claude'?'tag claude':'tag',T[t]||t)); }); c.appendChild(m);
    if(q.context||q.comment){
      var d=el('details','more'); d.appendChild(el('summary',null,'Контекст и комментарий')); var w=el('div','notes');
      if(q.context){ var p=el('p'); p.appendChild(el('b',null,'Контекст. ')); p.appendChild(document.createTextNode(q.context)); w.appendChild(p); }
      if(q.comment){ var p2=el('p'); p2.appendChild(el('b',null,'Комментарий. ')); p2.appendChild(document.createTextNode(q.comment)); w.appendChild(p2); }
      d.appendChild(w); c.appendChild(d);
    }
    return c;
  }
  function meaningCard(x){
    var c=el('article','card mcard'+(x.wide?' wide':'')); c.appendChild(el('h3',null,x.title)); c.appendChild(el('span','where',x.where));
    if(x.quote) c.appendChild(el('blockquote',null,'«'+x.quote+'»'));
    if(x.facts){ c.appendChild(el('span','rl','Что видно в тексте')); var fl=el('ul','facts'); x.facts.forEach(function(f){ var li=el('li'); li.appendChild(el('span','kind '+f.kind,f.kind==='fact'?'Факт':'Трактовка')); li.appendChild(el('span',null,f.text)); fl.appendChild(li); }); c.appendChild(fl); }
    c.appendChild(el('span','rl','Возможные прочтения'));
    var ol=el('ol'); x.readings.forEach(function(r){ ol.appendChild(el('li',null,r)); }); c.appendChild(ol);
    if(x.caveat) c.appendChild(el('p','caveat',x.caveat));
    return c;
  }
  var sorted=D.quotes.slice().sort(function(a,b){ return a.ord-b.ord; });

  // CHAPTER view
  var chState=CUR;
  var chips=document.getElementById('ch-chips');
  D.chapters.forEach(function(c){
    var b=el('button','chip'+(c.n===CUR?' now':''),'Гл. '+c.n); b.type='button'; b.id='chip-ch-'+c.n;
    b.addEventListener('click',function(){ go('chapter',c.n); }); chips.appendChild(b);
  });
  function renderChapter(n){
    chState=n; var c=D.chapters[n-1];
    Array.prototype.forEach.call(chips.children,function(b,i){ b.setAttribute('aria-pressed',i+1===n?'true':'false'); });
    var act=document.getElementById('chip-ch-'+n); if(act&&act.scrollIntoView) act.scrollIntoView({block:'nearest',inline:'center'});
    document.getElementById('ch-eyebrow').textContent='Глава '+n+(n===CUR?' · читаю сейчас':'');
    document.getElementById('ch-title').textContent=c.title;
    var su=document.getElementById('ch-summary'); su.textContent=''; c.summary.forEach(function(s){ su.appendChild(el('li',null,s)); });
    var bd=document.getElementById('ch-boundary'); bd.hidden=!(n===CUR); bd.textContent='Дальше этого места дневник не заглядывает: '+D.current.note+'.';
    var ctx=(D.context||[]).filter(function(x){ return nums(x.ch)[0]===n; })[0];
    var cl=document.getElementById('ch-ctx'); cl.textContent='';
    document.getElementById('ch-ctx-block').hidden=!ctx;
    if(ctx) ctx.items.forEach(function(it){ var li=el('li'); li.appendChild(el('span','kind '+it.kind,it.kind==='fact'?'Факт':'Трактовка')); li.appendChild(el('span',null,it.text)); cl.appendChild(li); });
    var qs=sorted.filter(function(q){ return chOf(q)===n; }); var ql=document.getElementById('ch-quotes'); ql.textContent='';
    document.getElementById('ch-q-block').hidden=!qs.length; qs.forEach(function(q){ ql.appendChild(quoteCard(q)); });
    var ms=(D.meanings||[]).filter(function(x){ return nums(x.where).indexOf(n)>-1; }); var ml=document.getElementById('ch-mean'); ml.textContent='';
    document.getElementById('ch-m-block').hidden=!ms.length; ms.forEach(function(x){ ml.appendChild(meaningCard(x)); });
    document.getElementById('ch-prev').disabled=n<=1; document.getElementById('ch-next').disabled=n>=MAXCH;
  }
  document.getElementById('ch-prev').addEventListener('click',function(){ go('chapter',chState-1); });
  document.getElementById('ch-next').addEventListener('click',function(){ go('chapter',chState+1); });

  // QUOTES view
  var active='all';
  try{ var sv=localStorage.getItem('eoe-theme'); if(sv&&(sv==='all'||T[sv])) active=sv; }catch(e){}
  var qchips=document.getElementById('q-chips'), qlist=document.getElementById('qlist');
  function count(k){ return k==='all'?D.quotes.length:D.quotes.filter(function(q){return q.themes.indexOf(k)>-1;}).length; }
  function renderQuotes(){
    qchips.textContent='';
    ['all'].concat(Object.keys(T)).forEach(function(k){ var n=count(k); if(!n) return;
      var b=el('button','chip',k==='all'?'Все':T[k]); b.type='button'; b.id='qchip-'+k; b.appendChild(el('span','n',String(n)));
      b.setAttribute('aria-pressed',k===active?'true':'false');
      b.addEventListener('click',function(){ active=k; try{localStorage.setItem('eoe-theme',k);}catch(e){} renderQuotes(); });
      qchips.appendChild(b); });
    qlist.textContent='';
    sorted.filter(function(q){ return active==='all'||q.themes.indexOf(active)>-1; }).forEach(function(q){ qlist.appendChild(quoteCard(q)); });
  }
  renderQuotes();

  // MEANINGS view
  var mn=document.getElementById('mean'); (D.meanings||[]).forEach(function(x){ mn.appendChild(meaningCard(x)); });
  var db=document.getElementById('deb');
  (D.debates||[]).forEach(function(x){
    var c=el('article','card'); c.appendChild(el('span','eyebrow',x.part)); c.appendChild(el('h3',null,x.topic));
    x.voices.forEach(function(v){ var r=el('div','voice'); r.appendChild(el('b',null,v[0])); r.appendChild(el('span',null,v[1])); c.appendChild(r); });
    c.appendChild(el('p','dq','Вопрос клубу: '+x.question)); db.appendChild(c);
  });
  var qsl=document.getElementById('qs'); D.questions.forEach(function(q){ var li=el('li'); li.appendChild(el('h3',null,q.q)); li.appendChild(el('p',null,q.d)); qsl.appendChild(li); });

  // PEOPLE view
  var at=document.getElementById('att');
  (D.attitudes||[]).forEach(function(a){ var c=el('article','card acard'); c.appendChild(el('h3',null,a.who)); var ul=el('ul');
    a.entries.forEach(function(e){ var li=el('li'); li.appendChild(el('span',null,e.date+' · '+e.where)); li.appendChild(document.createTextNode(e.text)); ul.appendChild(li); });
    c.appendChild(ul); at.appendChild(c); });
  var hy=document.getElementById('hyp');
  (D.hypotheses||[]).forEach(function(h){ var tr=el('tr'); tr.appendChild(el('td','m',h.date+' · '+h.where)); tr.appendChild(el('td',null,h.text)); var td=el('td'); td.style.width='1%'; td.appendChild(el('span','st',h.status)); tr.appendChild(td); hy.appendChild(tr); });
  var cl=document.getElementById('cast-list'), cq=document.getElementById('cast-q');
  function renderCast(){ var f=(cq.value||'').trim().toLowerCase(); cl.textContent=''; var any=false;
    D.cast.forEach(function(g){ var rows=g.people.filter(function(p){ return !f||(p[0]+' '+p[1]).toLowerCase().indexOf(f)>-1; }); if(!rows.length) return; any=true;
      var w=el('div','cast-group'); w.appendChild(el('h3',null,g.group)); var sc=el('div','scroll'); var t=el('table','plain'); var tb=el('tbody');
      rows.forEach(function(p){ var tr=el('tr'); tr.appendChild(el('td','k',p[0])); tr.appendChild(el('td',null,p[1])); tr.appendChild(el('td','m',p[2])); tb.appendChild(tr); });
      t.appendChild(tb); sc.appendChild(t); w.appendChild(sc); cl.appendChild(w); });
    if(!any) cl.appendChild(el('p','empty','Никого не нашлось. Попробуй имя или роль: «брат», «салун».')); }
  cq.addEventListener('input',renderCast); renderCast();

  // STORY view
  var ll=document.getElementById('lines');
  (D.storylines||[]).forEach(function(L){ var a=el('article','card line'); var h=el('div','hd'); h.appendChild(el('h3',null,L.title)); h.appendChild(el('span','chs',L.chapters)); a.appendChild(h);
    var ol=el('ol'); L.beats.forEach(function(b){ ol.appendChild(el('li',null,b)); }); a.appendChild(ol);
    var n=el('p','now'); n.appendChild(el('b',null,'Где остановились: ')); n.appendChild(document.createTextNode(L.now)); a.appendChild(n); ll.appendChild(a); });
  var lane={valley:'var(--valley)',ham:'var(--poppy)',tra:'var(--lupine)'}; var tl=document.getElementById('tl');
  D.timeline.forEach(function(e){ var li=el('li'); li.style.setProperty('--c',lane[e.lane]||'var(--muted)');
    var w=el('div','when',e.when); if(e.note) w.appendChild(el('small',null,e.note));
    var wt=el('div','what'); wt.appendChild(document.createTextNode(e.text)); wt.appendChild(el('span','src',e.src));
    li.appendChild(w); li.appendChild(el('div','dot')); li.appendChild(wt); tl.appendChild(li); });
  var lr=document.getElementById('logrows'); D.log.slice().reverse().forEach(function(r){ var tr=el('tr'); [r.date,r.where,r.what].forEach(function(v){ tr.appendChild(el('td',null,v)); }); lr.appendChild(tr); });

  // routing: #chapter, #ch-3, #quotes, #meanings, #people, #story
  var tabs=['chapter','quotes','meanings','people','story'];
  function show(tab,n){
    tabs.forEach(function(t){ document.getElementById('v-'+t).hidden=(t!==tab); });
    Array.prototype.forEach.call(document.querySelectorAll('nav.tabbar a'),function(a){ if(a.dataset.tab===tab) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    if(tab==='chapter') renderChapter(Math.min(Math.max(n||chState,1),MAXCH));
  }
  function parse(){ var h=(location.hash||'').slice(1); var m=h.match(/^ch-(\d+)$/); if(m) return ['chapter',+m[1]]; if(tabs.indexOf(h)>-1) return [h,null]; return ['chapter',CUR]; }
  function go(tab,n){ var h=tab==='chapter'&&n?'ch-'+n:tab; if(location.hash.slice(1)===h){ show(tab,n); } else { location.hash=h; } window.scrollTo(0,0); }
  window.addEventListener('hashchange',function(){ var r=parse(); show(r[0],r[1]); window.scrollTo(0,0); });
  var r0=parse(); show(r0[0],r0[1]);
}
  fetch('data.json',{cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(start).catch(function(e){ var m=document.createElement('p'); m.className='wrap empty'; m.textContent='Не удалось загрузить данные дневника ('+e.message+'). Обнови страницу.'; document.querySelector('main').prepend(m); });
})();
