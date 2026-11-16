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
  var TOTAL=55, cpGrid=document.getElementById('cp-grid'), cpOpen=document.getElementById('cp-open');
  for(var k=1;k<=TOTAL;k++){ (function(k){ var rd=k<=MAXCH; var b=el('button','cp-cell'+(k===CUR?' now':''),String(k)); b.type='button'; b.id='cp-'+k;
    if(rd){ b.title=D.chapters[k-1].title; b.addEventListener('click',function(){ setGrid(false); go('chapter',k); }); } else { b.disabled=true; b.title='Ещё не прочитано'; }
    cpGrid.appendChild(b); })(k); }
  function setGrid(v){ cpGrid.hidden=!v; cpOpen.setAttribute('aria-expanded',v?'true':'false'); }
  cpOpen.addEventListener('click',function(){ setGrid(cpGrid.hidden); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') setGrid(false); });
  document.getElementById('cp-prev').addEventListener('click',function(){ go('chapter',chState-1); });
  document.getElementById('cp-next').addEventListener('click',function(){ go('chapter',chState+1); });
  function renderChapter(n){
    chState=n; var c=D.chapters[n-1];
    Array.prototype.forEach.call(cpGrid.children,function(b,i){ if(i+1===n) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current'); });
    document.getElementById('cp-label').textContent='Глава '+n+' из '+TOTAL;
    document.getElementById('cp-prev').disabled=n<=1; document.getElementById('cp-next').disabled=n>=MAXCH;
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
  var cl=document.getElementById('cast-list'), cq=document.getElementById('cast-q');
  var PROF=(D.profiles||[]), PID={}; PROF.forEach(function(p){ PID[p.id]=p; });
  function chLinks(str,box){ nums(str).filter(function(n){ return n<=CUR; }).forEach(function(n){ var b=el('a','chl','гл. '+n); b.href='#ch-'+n; box.appendChild(b); }); }
  var GCLS={'Гамильтоны':'g-ham','Траски':'g-tra','Эймсы и Бостон':'g-ames','Эймсы':'g-ames','Остальные':'g-oth','Салинас: Ряд':'g-row'};
  var jump=document.getElementById('cast-jump');
  D.cast.forEach(function(g,i){ var b=el('a','chip',g.group); b.href='#people'; b.addEventListener('click',function(e){ e.preventDefault(); var t=document.getElementById('cg-'+i); if(t) t.scrollIntoView({block:'start',behavior:'smooth'}); }); b.appendChild(el('span','n',String(g.people.length))); jump.appendChild(b); });
  function renderCast(){ var f=(cq.value||'').trim().toLowerCase(); cl.textContent=''; var any=false;
    D.cast.forEach(function(g,gi){ var rows=g.people.filter(function(p){ return !f||(p[0]+' '+p[1]).toLowerCase().indexOf(f)>-1; }); if(!rows.length) return; any=true;
      var w=el('section','cg '+(GCLS[g.group]||'g-oth')); w.id='cg-'+gi; var hd=el('header','cg-h'); hd.appendChild(el('h3',null,g.group)); hd.appendChild(el('span','n',rows.length+' '+(rows.length===1?'персонаж':'персонажей'))); w.appendChild(hd);
      var ul=el('ul','cp-list');
      rows.forEach(function(p){ var li=el('li','cp'), id=p[3]||null; var nm=id?el('a','cp-n',p[0]):el('span','cp-n',p[0]); if(id) nm.href='#p-'+id; li.appendChild(nm);
        li.appendChild(el('p','cp-d',p[1])); var c=el('div','cp-c'); chLinks(p[2],c); li.appendChild(c); ul.appendChild(li); });
      w.appendChild(ul); cl.appendChild(w); });
    if(!any) cl.appendChild(el('p','empty','Никого не нашлось. Попробуй имя или роль: «брат», «салун».')); }
  // карточки главных героев, по семьям
  (function(){ var pg=document.getElementById('prof-grid'); if(!pg) return; var groups=[];
    PROF.forEach(function(p){ if(groups.indexOf(p.group)<0) groups.push(p.group); });
    groups.forEach(function(gname){ var w=el('section','pg '+(GCLS[gname]||'g-oth')); w.appendChild(el('h3','pg-h',gname)); var grid=el('div','pg-grid');
      PROF.filter(function(p){ return p.group===gname; }).forEach(function(p){ var a=el('a','card pcard'); a.href='#p-'+p.id; a.appendChild(el('b',null,p.name)); a.appendChild(el('span',null,p.short)); grid.appendChild(a); });
      w.appendChild(grid); pg.appendChild(w); }); })();
  cq.addEventListener('input',renderCast); renderCast();

  // STORY view
  var ll=document.getElementById('lines');
  (D.storylines||[]).forEach(function(L,i){ var a=el('article','card line'); a.id='line-'+i; var h=el('div','hd'); h.appendChild(el('h3',null,L.title)); h.appendChild(el('span','chs',L.chapters)); a.appendChild(h);
    var ol=el('ol'); L.beats.forEach(function(b){ ol.appendChild(el('li',null,b)); }); a.appendChild(ol);
    var n=el('p','now'); n.appendChild(el('b',null,'Где остановились: ')); n.appendChild(document.createTextNode(L.now)); a.appendChild(n); ll.appendChild(a); });

  // карта линий и героев по главам
  function swim(box,rows){ if(!box) return; var cols='minmax(0,1fr)'; var head=el('div','sw-row sw-head'); head.appendChild(el('span','sw-l',''));
    var hc=el('div','sw-cells'); hc.style.setProperty('--n',CUR); for(var c=1;c<=CUR;c++){ hc.appendChild(el('span','sw-n',(c===1||c%5===0||c===CUR)?String(c):'')); } head.appendChild(hc); box.appendChild(head);
    rows.forEach(function(r){ var row=el('div','sw-row'+(r.cls?' '+r.cls:'')); var lab=el('a','sw-l nolink',r.label); lab.href=r.href; if(r.onclick) lab.addEventListener('click',r.onclick); row.appendChild(lab);
      var cells=el('div','sw-cells'); cells.style.setProperty('--n',CUR); var on=nums(r.chs);
      for(var c=1;c<=CUR;c++){ if(on.indexOf(c)>-1){ var x=el('a','sw-c on'); x.href='#ch-'+c; x.title='гл. '+c; x.setAttribute('aria-label',r.label+', гл. '+c); cells.appendChild(x); } else cells.appendChild(el('span','sw-c')); }
      row.appendChild(cells); box.appendChild(row); }); }
  swim(document.getElementById('swim-lines'),(D.storylines||[]).map(function(L,i){ return {label:L.title,chs:L.chapters,href:'#story',onclick:function(e){ e.preventDefault(); var t=document.getElementById('line-'+i); if(t) t.scrollIntoView({block:'start',behavior:'smooth'}); }}; }));
  swim(document.getElementById('swim-people'),(D.profiles||[]).filter(function(p){ return !p.nolink||p.id==='narrator'; }).map(function(p){ return {label:p.name,chs:p.chs,href:'#p-'+p.id}; }));
  var lane={valley:'var(--valley)',ham:'var(--poppy)',tra:'var(--lupine)',ames:'var(--muted)'}; var tl=document.getElementById('tl');
  D.timeline.forEach(function(e){ var li=el('li'); li.style.setProperty('--c',lane[e.lane]||'var(--muted)');
    var w=el('div','when',e.when); if(e.note) w.appendChild(el('small',null,e.note));
    var wt=el('div','what'); wt.appendChild(document.createTextNode(e.text)); wt.appendChild(el('span','src',e.src));
    li.appendChild(w); li.appendChild(el('div','dot')); li.appendChild(wt); tl.appendChild(li); });
  var lr=document.getElementById('logrows'); D.log.slice().reverse().forEach(function(r){ var tr=el('tr'); [r.date,r.where,r.what].forEach(function(v){ tr.appendChild(el('td',null,v)); }); lr.appendChild(tr); });

  // WORLD view
  function worldCard(x){
    var c=el('article','card wcard'); var top=el('div','wtop'); top.appendChild(el('span','when',x.when));
    if(x.ch&&x.ch!=='—'){ nums(x.ch).forEach(function(n){ if(n>CUR) return; var b=el('a','chl','гл. '+n); b.href='#ch-'+n; top.appendChild(b); }); }
    c.appendChild(top); c.appendChild(el('h3',null,x.title)); c.appendChild(el('p',null,x.text));
    if(x.novel){ var p=el('p','novel'); p.appendChild(el('b',null,'В романе. ')); p.appendChild(document.createTextNode(x.novel)); c.appendChild(p); }
    if(x.img) c.insertBefore(figure(x.img),c.firstChild);
    return c;
  }
  // картинки: Wikimedia Commons, Special:FilePath отдаёт превью нужной ширины
  var COM='https://commons.wikimedia.org/wiki/';
  function figure(im){
    var f=el('figure','wimg'), a=el('a'), page=COM+'File:'+encodeURIComponent(im.file.replace(/ /g,'_'));
    a.href=im.full||im.src||page; a.addEventListener('click',function(e){ e.preventDefault(); openLb(im,page); });
    var img=el('img'); img.loading='lazy'; img.decoding='async'; img.alt=im.cap||''; img.src=im.src||(COM+'Special:FilePath/'+encodeURIComponent(im.file)+'?width=640');
    img.addEventListener('error',function(){ f.remove(); }); a.appendChild(img); f.appendChild(a);
    var fc=el('figcaption'); if(im.cap) fc.appendChild(el('span',null,im.cap)); var cr=el('a','credit',im.credit||'Wikimedia Commons'); cr.href=page; cr.target='_blank'; cr.rel='noopener'; fc.appendChild(cr); f.appendChild(fc);
    return f;
  }
  // просмотр картинки поверх страницы
  var lb=null;
  function openLb(im,page){
    if(!lb){ lb=el('div','lb'); lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
      lb.innerHTML='<button class="lb-x" type="button" aria-label="Закрыть">✕</button><img alt=""><div class="lb-cap"><span></span><a target="_blank" rel="noopener"></a></div>';
      lb.addEventListener('click',function(e){ if(e.target.closest('a')) return; closeLb(); });
      document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!lb.hidden) closeLb(); });
      document.body.appendChild(lb); }
    var img=lb.querySelector('img'); img.src=im.full||im.src; img.alt=im.cap||'';
    lb.querySelector('.lb-cap span').textContent=im.cap||''; var cr=lb.querySelector('.lb-cap a'); cr.textContent=im.credit||'Wikimedia Commons'; cr.href=page;
    lb.hidden=false; document.documentElement.style.overflow='hidden';
  }
  function closeLb(){ lb.hidden=true; lb.querySelector('img').removeAttribute('src'); document.documentElement.style.overflow=''; }
  // карты: SVG из img/, вставляем инлайн, чтобы работали цвета темы
  var svgCache={};
  function loadSvg(url,box){
    (svgCache[url]=svgCache[url]||fetch(url).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); }))
      .then(function(t){ box.innerHTML=t; box.dispatchEvent(new Event('svgready')); }).catch(function(){ box.textContent='Карта не загрузилась.'; });
  }
  function mapBlock(M){
    var blk=el('div','block map-block'); blk.id='map-'+M.id; var hd=el('header'); hd.appendChild(el('h3',null,M.title)); if(M.lead) hd.appendChild(el('p','lead',M.lead)); blk.appendChild(hd);
    var wrap=el('div','map-wrap'), box=el('div','map-svg'); wrap.appendChild(box);
    var ol=el('ol','map-legend');
    M.points.forEach(function(p){ var li=el('li'); li.dataset.n=p.n; li.tabIndex=0; li.appendChild(el('span','pin',String(p.n)));
      var t=el('div'); t.appendChild(el('b',null,p.name)); t.appendChild(document.createTextNode(' '+p.text));
      var cs=nums(p.ch).filter(function(n){ return n<=CUR; }); if(cs.length){ var w=el('span','chs'); cs.forEach(function(n){ var b=el('a','chl','гл. '+n); b.href='#ch-'+n; w.appendChild(b); }); t.appendChild(w); }
      li.appendChild(t); ol.appendChild(li); });
    wrap.appendChild(ol); blk.appendChild(wrap);
    function hl(n){ Array.prototype.forEach.call(box.querySelectorAll('.map-pin'),function(g){ g.classList.toggle('on',g.dataset.n===String(n)); });
      Array.prototype.forEach.call(ol.children,function(li){ li.classList.toggle('on',li.dataset.n===String(n)); }); }
    ol.addEventListener('click',function(e){ var li=e.target.closest('li'); if(li&&!e.target.closest('a')) hl(li.dataset.n); });
    ol.addEventListener('keydown',function(e){ var li=e.target.closest('li'); if(li&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); hl(li.dataset.n); } });
    box.addEventListener('click',function(e){ var g=e.target.closest&&e.target.closest('.map-pin'); if(!g) return; hl(g.dataset.n); var li=ol.querySelector('li[data-n="'+g.dataset.n+'"]'); if(li&&li.scrollIntoView) li.scrollIntoView({block:'nearest',behavior:'smooth'}); });
    var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){ if(es[0].isIntersecting){ io.disconnect(); loadSvg(M.svg,box); } },{rootMargin:'300px'}):null;
    if(io) io.observe(box); else loadSvg(M.svg,box);
    return blk;
  }
  var W=D.world||[], wsec=document.getElementById('w-sections'), wch=document.getElementById('w-chips');
  var MAPS=D.maps||[];
  // «Мир»: один раздел на экране (вкладки-чипы), карточки свёрнуты в строку
  function worldRow(x){
    var d=el('details','card wrow'); var s=el('summary');
    if(x.img&&x.img.src){ var th=el('img','wthumb'); th.loading='lazy'; th.decoding='async'; th.alt=''; th.src=x.img.src; th.addEventListener('error',function(){ th.remove(); }); s.appendChild(th); }
    var h=el('div','wrow-h'); var top=el('div','wtop'); top.appendChild(el('span','when',x.when));
    if(x.ch&&x.ch!=='—'){ nums(x.ch).forEach(function(n){ if(n>CUR) return; top.appendChild(el('span','chl','гл. '+n)); }); }
    h.appendChild(top); h.appendChild(el('h3',null,x.title)); s.appendChild(h); s.appendChild(el('span','wchev','+')); d.appendChild(s);
    var body=el('div','wrow-b'); d.appendChild(body); var filled=false;
    d.addEventListener('toggle',function(){ if(!d.open||filled) return; filled=true; var c=worldCard(x); while(c.firstChild){ var n=c.firstChild; c.removeChild(n); if(n.classList&&(n.classList.contains('wtop')||n.tagName==='H3')) continue; body.appendChild(n); } });
    return d;
  }
  var panels={}, wbtn={}, wcur=null;
  function addTab(id,title,count,build){
    var b=el('button','chip',title); b.type='button'; b.setAttribute('aria-pressed','false'); if(count!=null) b.appendChild(el('span','n',String(count)));
    b.addEventListener('click',function(){ wshow(id,true); }); wch.appendChild(b); wbtn[id]=b;
    var p=el('div','wpanel'); p.hidden=true; p.dataset.build='1'; panels[id]={el:p,build:build}; wsec.appendChild(p);
  }
  function wshow(id,save){ if(!panels[id]) id=Object.keys(panels)[0]; wcur=id;
    Object.keys(panels).forEach(function(k){ var P=panels[k]; var on=k===id; P.el.hidden=!on; wbtn[k].setAttribute('aria-pressed',on?'true':'false');
      if(on&&P.el.dataset.build){ delete P.el.dataset.build; P.build(P.el); } });
    if(save){ try{ localStorage.setItem('eoe-wsec',id); }catch(e){} var t=wbtn[id]; if(t&&t.scrollIntoView) t.scrollIntoView({block:'nearest',inline:'center'}); }
  }
  W.forEach(function(s){
    addTab(s.id,s.title,s.items.length,function(p){ var blk=el('div','block'); blk.id='w-'+s.id; if(s.lead){ var hd=el('header'); hd.appendChild(el('p','lead',s.lead)); blk.appendChild(hd); }
      var l=el('div','wrows'); s.items.slice().sort(function(a,b){ return (nums(b.ch||'0')[0]||0)-(nums(a.ch||'0')[0]||0); }).forEach(function(x){ l.appendChild(worldRow(x)); }); blk.appendChild(l); p.appendChild(blk); });
  });
  if(MAPS.length) addTab('maps','Карты',MAPS.length,function(p){ MAPS.forEach(function(M){ p.appendChild(mapBlock(M)); }); });
  var wsaved=null; try{ wsaved=localStorage.getItem('eoe-wsec'); }catch(e){}
  wshow(wsaved||(W[0]&&W[0].id));
  function worldFor(n){ var out=[]; W.forEach(function(s){ s.items.forEach(function(x){ if(x.ch&&nums(x.ch).indexOf(n)>-1) out.push(x); }); }); return out; }
  var _rc=renderChapter; renderChapter=function(n){ _rc(n); var ws=worldFor(n), wl=document.getElementById('ch-world'); wl.textContent=''; document.getElementById('ch-w-block').hidden=!ws.length; ws.forEach(function(x){ wl.appendChild(worldCard(x)); });
    var mp=document.getElementById('ch-maps'); mp.textContent=''; var any=false;
    MAPS.forEach(function(M){ var ps=M.points.filter(function(p){ return nums(p.ch).indexOf(n)>-1; }); if(!ps.length) return; any=true;
      var a=el('a','map-hint'); a.href='#world'; a.dataset.map=M.id; a.appendChild(el('span','eyebrow',M.title)); a.appendChild(el('span',null,ps.map(function(p){ return p.name; }).join(' · ')+' →')); mp.appendChild(a); });
    if(any) document.getElementById('ch-w-block').hidden=false; };
  document.getElementById('ch-maps').addEventListener('click',function(e){ var a=e.target.closest('a.map-hint'); if(!a) return; e.preventDefault(); var id=a.dataset.map; go('world'); wshow('maps',true);
    setTimeout(function(){ var t=document.getElementById('map-'+id); if(t) t.scrollIntoView({block:'start'}); },150); });


  // ДНЕВНИК РОМАНА (Journal of a Novel): только записи о прочитанных главах
  var JN=(D.journal&&D.journal.entries||[]).filter(function(e){ return !e.ch||nums(e.ch).every(function(n){ return n<=CUR; }); });
  function jCard(e,withCh){
    var c=el('article','card jcard'), top=el('div','jtop'); top.appendChild(el('span','jdate',e.d+' 1951'));
    if(withCh&&e.ch) nums(e.ch).forEach(function(n){ var b=el('a','chl','гл. '+n); b.href='#ch-'+n; top.appendChild(b); });
    c.appendChild(top); c.appendChild(el('h3',null,e.t)); c.appendChild(el('p',null,e.x));
    if(e.q){ var bq=el('blockquote'); bq.appendChild(el('p',null,'«'+e.q+'»')); c.appendChild(bq); }
    if(e.r){ var p=el('p','jr'); p.appendChild(el('span','kind reading','Трактовка')); p.appendChild(document.createTextNode(' '+e.r)); c.appendChild(p); }
    return c;
  }
  (function(){ var jl=document.getElementById('j-list'); if(!jl) return; document.getElementById('j-lead').textContent=(D.journal&&D.journal.lead)||'';
    var pre=JN.filter(function(e){ return !e.ch; }), byCh=JN.filter(function(e){ return e.ch; });
    if(pre.length){ jl.appendChild(el('p','jgroup','О книге в целом')); pre.forEach(function(e){ jl.appendChild(jCard(e,false)); }); }
    if(byCh.length){ jl.appendChild(el('p','jgroup','По главам')); byCh.slice().sort(function(a,b){ return (nums(a.ch)[0]-nums(b.ch)[0])||(a.n-b.n); }).forEach(function(e){ jl.appendChild(jCard(e,true)); }); }
  })();
  var _rc2=renderChapter; renderChapter=function(n){ _rc2(n); var js=JN.filter(function(e){ return e.ch&&nums(e.ch).indexOf(n)>-1; }), l=document.getElementById('ch-journal'); if(!l) return; l.textContent=''; document.getElementById('ch-j-block').hidden=!js.length; js.forEach(function(e){ l.appendChild(jCard(e,false)); }); };

  // «Как писалась глава»: связные рассказы по письмам
  var JS=(D.journal&&D.journal.stories||[]).filter(function(s){ return !s.ch||nums(s.ch).every(function(n){ return n<=CUR; }); });
  function jStory(s,open,withCh){
    var d=el('details','card jstory'); if(open) d.open=true; var sm=el('summary'), h=el('div','jtop');
    h.appendChild(el('span','jdate',s.when+' 1951'));
    if(withCh&&s.ch) nums(s.ch).forEach(function(n){ h.appendChild(el('span','chl','гл. '+n)); });
    sm.appendChild(h); sm.appendChild(el('h3',null,s.t)); sm.appendChild(el('span','wchev','+')); d.appendChild(sm);
    var b=el('div','jbody'); s.p.forEach(function(t){ b.appendChild(el('p',null,t)); }); d.appendChild(b); return d;
  }
  (function(){ var jl=document.getElementById('j-list'); if(!jl||!JS.length) return; var box=el('div','jstories');
    box.appendChild(el('p','jgroup','Как писалась книга: рассказ по письмам'));
    JS.forEach(function(s){ box.appendChild(jStory(s,false,true)); });
    box.appendChild(el('p','jgroup','Цитаты из писем'));
    jl.insertBefore(box,jl.firstChild); })();
  var _rc3=renderChapter; renderChapter=function(n){ _rc3(n); var l=document.getElementById('ch-journal'); if(!l) return;
    var ss=JS.filter(function(s){ return s.ch&&nums(s.ch).indexOf(n)>-1; });
    ss.slice().reverse().forEach(function(s){ l.insertBefore(jStory(s,false,false),l.firstChild); });
    if(ss.length) document.getElementById('ch-j-block').hidden=false; };

  // СТРАНИЦА ГЕРОЯ: #p-id
  function linkName(id){ var p=PID[id]; var a=el('a','plink',p?p.name:id); a.href='#p-'+id; return a; }
  function patRe(p){ try{ return p.pat?new RegExp(p.pat):null; }catch(e){ return null; } }
  function renderPerson(id){ var box=document.getElementById('person'); box.textContent=''; var p=PID[id];
    if(!p){ box.appendChild(el('p','empty','Такого героя нет.')); return; }
    var hd=el('div','block p-head'); var back=el('a','more-link','← Все герои'); back.href='#people'; hd.appendChild(back);
    hd.appendChild(el('p','eyebrow',p.group)); hd.appendChild(el('h2',null,p.name));
    if(p.aka) hd.appendChild(el('p','p-aka','Также: '+p.aka.join(', ')));
    hd.appendChild(el('p','lead',p.short)); var cc=el('div','p-chs'); cc.appendChild(el('span','rl','В главах')); chLinks(p.chs,cc); hd.appendChild(cc); box.appendChild(hd);
    var bio=el('div','block'); bio.appendChild(el('h3',null,'Кто это')); var bc=el('div','card p-bio'); p.bio.forEach(function(t){ bc.appendChild(el('p',null,t)); }); bio.appendChild(bc); box.appendChild(bio);
    var evs=p.ev.filter(function(e){ return nums(e.ch).every(function(n){ return n<=CUR; }); });
    if(evs.length){ var eb=el('div','block'); eb.appendChild(el('h3',null,'По главам')); var ol=el('ol','p-ev card');
      evs.forEach(function(e){ var li=el('li'); var a=el('a','chl','гл. '+e.ch); a.href='#ch-'+nums(e.ch)[0]; li.appendChild(a); li.appendChild(el('span',null,e.t)); ol.appendChild(li); }); eb.appendChild(ol); box.appendChild(eb); }
    if(p.rel&&p.rel.length){ var rb=el('div','block'); rb.appendChild(el('h3',null,'Связи')); var ul=el('ul','p-rel card');
      p.rel.forEach(function(r){ var li=el('li'); li.appendChild(PID[r.id]&&!PID[r.id].nolink||PID[r.id]?linkName(r.id):el('b',null,r.id)); li.appendChild(el('span',null,' — '+r.t)); ul.appendChild(li); }); rb.appendChild(ul); box.appendChild(rb); }
    var re=patRe(p);
    var lines=(D.storylines||[]).filter(function(L){ return re&&re.test(L.title); });
    if(lines.length){ var lb=el('div','block'); lb.appendChild(el('h3',null,'Сюжетные линии')); lines.forEach(function(L){ var a=el('a','card pline'); a.href='#story'; a.appendChild(el('b',null,L.title)); a.appendChild(el('span',null,'Где остановились: '+L.now)); lb.appendChild(a); }); box.appendChild(lb); }
    var qs=re?sorted.filter(function(q){ return chOf(q)<=CUR&&(re.test(q.text)||re.test(q.context||'')); }):[];
    if(qs.length){ var qb=el('div','block'); qb.appendChild(el('h3',null,'Цитаты ('+qs.length+')')); var ql=el('div','quotes'); qs.forEach(function(q){ ql.appendChild(quoteCard(q)); }); qb.appendChild(ql); box.appendChild(qb); }
    var ms=re?(D.meanings||[]).filter(function(m){ return re.test(JSON.stringify(m)); }):[];
    if(ms.length){ var mb=el('div','block'); mb.appendChild(el('h3',null,'Смыслы')); var mm=el('div','mean'); ms.forEach(function(m){ mm.appendChild(meaningCard(m)); }); mb.appendChild(mm); box.appendChild(mb); }
    var js=(typeof JN!=='undefined'?JN:[]).filter(function(e){ return (p.j||[]).indexOf(e.n)>-1; });
    if(js.length){ var jb=el('div','block'); jb.appendChild(el('h3',null,'Стейнбек о герое')); var jl=el('div','jlist nolink'); js.forEach(function(e){ jl.appendChild(jCard(e,true)); }); jb.appendChild(jl); box.appendChild(jb); }
  }
  // «Герои главы» на экране главы
  var _rc4=renderChapter; renderChapter=function(n){ _rc4(n); var b=document.getElementById('ch-people'); if(!b) return; b.textContent='';
    var ps=PROF.filter(function(p){ return nums(p.chs).indexOf(n)>-1; }); document.getElementById('ch-p-block').hidden=!ps.length;
    ps.forEach(function(p){ var a=el('a','chip',p.name); a.href='#p-'+p.id; b.appendChild(a); }); };

  // АВТОССЫЛКИ: имена героев → справка, «гл. N» → глава
  var LP=PROF.filter(function(p){ return p.pat&&!p.nolink; }).map(function(p){ return {id:p.id,re:p.pat}; });
  var BIG=new RegExp('(гл\\.\\s?\\d+(?:[–-]\\d+)?)|'+LP.map(function(x){ return '('+x.re+')'; }).join('|'),'g');
  var SKIP='A,BUTTON,INPUT,TEXTAREA,SCRIPT,STYLE,SUMMARY,H1,H2,NAV,SELECT,OPTION,LABEL';
  function linkify(root,noPeople){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(t){ for(var e=t.parentNode;e&&e!==root.parentNode;e=e.parentNode){ if(e.nodeType===1&&(SKIP.indexOf(e.tagName)>-1||e.classList.contains('nolink'))) return NodeFilter.FILTER_REJECT; } return /\S/.test(t.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT; }}), list=[];
    while(w.nextNode()) list.push(w.currentNode);
    list.forEach(function(t){ var s=t.nodeValue, last=0, frag=null, m; BIG.lastIndex=0;
      while((m=BIG.exec(s))){ var href=null;
        if(m[1]){ var n=nums(m[1])[0]; if(n<=CUR) href='#ch-'+n; }
        else if(!noPeople){ for(var i=0;i<LP.length;i++){ if(m[i+2]){ href='#p-'+LP[i].id; break; } } }
        if(!href) continue; if(!frag) frag=document.createDocumentFragment();
        frag.appendChild(document.createTextNode(s.slice(last,m.index))); var a=document.createElement('a'); a.className='auto'; a.href=href; a.textContent=m[0]; frag.appendChild(a); last=m.index+m[0].length; }
      if(frag){ frag.appendChild(document.createTextNode(s.slice(last))); t.parentNode.replaceChild(frag,t); } });
  }
  function linkAll(){ ['ch-summary','ch-ctx','ch-mean','lines','tl','cast-list','w-sections','ch-world','person','mean','deb','qs','qlist','ch-quotes'].forEach(function(id){ var r=document.getElementById(id); if(r) linkify(r,false); });
    ['j-list','ch-journal'].forEach(function(id){ var r=document.getElementById(id); if(r) linkify(r,true); }); }
  var lt=null; new MutationObserver(function(){ if(lt) return; lt=setTimeout(function(){ lt=null; linkAll(); },30); }).observe(document.querySelector('main'),{childList:true,subtree:true}); linkAll();
  // routing: #chapter, #ch-3, #quotes, #meanings, #people, #story
  var tabs=['chapter','quotes','meanings','people','story','world','journal','person'];
  function show(tab,n){
    tabs.forEach(function(t){ document.getElementById('v-'+t).hidden=(t!==tab); });
    Array.prototype.forEach.call(document.querySelectorAll('nav.tabbar a'),function(a){ if(a.dataset.tab===tab) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    if(tab==='chapter') renderChapter(Math.min(Math.max(n||chState,1),MAXCH));
    if(tab==='person'){ renderPerson(n); var pa=document.querySelector('nav.tabbar a[data-tab="people"]'); if(pa) pa.setAttribute('aria-current','page'); }
  }
  function parse(){ var h=(location.hash||'').slice(1); var m=h.match(/^ch-(\d+)$/); if(m) return ['chapter',+m[1]]; var pm=h.match(/^p-([a-z]+)$/); if(pm) return ['person',pm[1]]; if(tabs.indexOf(h)>-1) return [h,null]; return ['chapter',CUR]; }
  function go(tab,n){ var h=tab==='chapter'&&n?'ch-'+n:(tab==='person'?'p-'+n:tab); if(location.hash.slice(1)===h){ show(tab,n); } else { location.hash=h; } window.scrollTo(0,0); }
  window.addEventListener('hashchange',function(){ var r=parse(); show(r[0],r[1]); window.scrollTo(0,0); });
  var r0=parse(); show(r0[0],r0[1]);
}
  fetch('data.json',{cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(start).catch(function(e){ var m=document.createElement('p'); m.className='wrap empty'; m.textContent='Не удалось загрузить данные дневника ('+e.message+'). Обнови страницу.'; document.querySelector('main').prepend(m); });
})();
