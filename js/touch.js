// TAUBENGAME - Handy-Steuerung (Touch). Wird nur auf Geraeten mit Touchscreen aktiv.
// Linke Bildschirmhaelfte: Stick zum Laufen (ganz nach aussen ziehen = rennen). Rechte Haelfte: wischen zum Umschauen.
// Knoepfe: Feuer (beim Halten weiter umschauen), Zielen (an/aus), Springen, Ulti, Waffe wechseln, Karte, Menue.
const TOUCH=matchMedia('(pointer:coarse)').matches||(('ontouchstart' in window)&&!matchMedia('(pointer:fine)').matches);
(function(){
 if(!TOUCH)return;
 document.body.classList.add('touch');
 const el=document.createElement('div');el.id='tc';
 el.innerHTML=`<div id="tc-stick"><div id="tc-knob"></div></div>
  <button class="tb" data-k="menu" id="tb-menu" aria-label="Menü">&#9776;</button>
  <button class="tb" data-k="map" id="tb-map" data-en="MAP" aria-label="Karte">KARTE</button>
  <button class="tb" data-k="wpn" id="tb-wpn" data-en="WEAPON" aria-label="Waffe wechseln">WAFFE</button>
  <button class="tb" data-k="ult" id="tb-ult" data-en="ULT" aria-label="Ulti">ULTI</button>
  <button class="tb" data-k="jump" id="tb-jump" data-en="JUMP" aria-label="Springen">SPRUNG</button>
  <button class="tb" data-k="ads" id="tb-ads" data-en="AIM" aria-label="Zielen">ZIELEN</button>
  <button class="tb" data-k="fire" id="tb-fire" data-en="FIRE" aria-label="Feuer">FEUER</button>`;
 document.body.appendChild(el);
 const rot=document.createElement('div');rot.id='rot';rot.innerHTML='<div><b>&#10227;</b><p data-en="Turn your phone sideways">Handy quer halten</p></div>';document.body.appendChild(rot);
 const stick=el.querySelector('#tc-stick'),knob=el.querySelector('#tc-knob'),T={};   // T: aktive Finger nach identifier
 const sens=()=>SENS*(1-.45*VM.ak),R=()=>Math.min(70,Math.min(innerWidth,innerHeight)*.16);
 const inStoryScreen=()=>S&&S.st&&S.st.ph!='play'&&S.st.ph!='clear';
 const swap=()=>{const L=owned(me.lo||63),k=Math.max(0,L.indexOf(me.w));me.w=L[(k+1)%L.length]};
 el.addEventListener('touchstart',e=>{e.preventDefault();if(!mode||pmOpen)return;TC.on=1;
  for(const t of e.changedTouches){const b=t.target.closest&&t.target.closest('.tb'),k=b?b.dataset.k:null;
   if(k=='menu'){gameMenu(1);continue}
   if(inStoryScreen()){storyConfirm();continue}
   if(b)b.classList.add('on');
   if(k=='fire'){me.f=1;T[t.identifier]={k:'look',lx:t.clientX,ly:t.clientY,b}}
   else if(k=='ads'){me.ads=me.ads?0:1;T[t.identifier]={k,b}}
   else if(k=='jump'){TC.jump=1;T[t.identifier]={k,b}}
   else if(k=='ult'){me.qn=(me.qn|0)+1;T[t.identifier]={k,b}}
   else if(k=='wpn'){swap();T[t.identifier]={k,b}}
   else if(k=='map'){showMap^=1;T[t.identifier]={k,b}}
   else if(t.clientX<innerWidth*.45&&!Object.values(T).some(q=>q.k=='stick')){T[t.identifier]={k:'stick',x0:t.clientX,y0:t.clientY};
    stick.style.left=t.clientX+'px';stick.style.top=t.clientY+'px';knob.style.transform='';stick.classList.add('on')}
   else T[t.identifier]={k:'look',lx:t.clientX,ly:t.clientY}}
 },{passive:false});
 el.addEventListener('touchmove',e=>{e.preventDefault();if(!mode||pmOpen)return;
  for(const t of e.changedTouches){const q=T[t.identifier];if(!q)continue;
   if(q.k=='stick'){const r=R();let dx=t.clientX-q.x0,dy=t.clientY-q.y0;const l=Math.hypot(dx,dy);TC.run=l>r*1.25?1:0;if(l>r){dx*=r/l;dy*=r/l}
    TC.s=dx/r;TC.f=-dy/r;knob.style.transform=`translate(${dx}px,${dy}px)`;stick.classList.toggle('run',!!TC.run)}
   else if(q.k=='look'){const k=sens()*(640/Math.max(480,innerWidth));me.a+=(t.clientX-q.lx)*.0085*k;me.pt=Math.max(-95,Math.min(95,(me.pt||0)-(t.clientY-q.ly)*.75*k));q.lx=t.clientX;q.ly=t.clientY}}
 },{passive:false});
 const end=e=>{e.preventDefault();for(const t of e.changedTouches){const q=T[t.identifier];if(!q)continue;delete T[t.identifier];if(q.b)q.b.classList.remove('on');
   if(q.k=='stick'){TC.f=TC.s=TC.run=0;stick.classList.remove('on','run')}
   if(q.b&&q.b.dataset.k=='fire')me.f=0;if(q.k=='jump')TC.jump=0}};
 el.addEventListener('touchend',end,{passive:false});el.addEventListener('touchcancel',end,{passive:false});
 // Vollbild und Querformat beim Spielstart (nur nach einem Tippen erlaubt)
 const fs=()=>{try{const d=document.documentElement;if(!document.fullscreenElement&&d.requestFullscreen)d.requestFullscreen({navigationUI:'hide'}).then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}catch(e){}};
 document.addEventListener('click',e=>{if(!mode&&e.target.closest&&e.target.closest('button.pri,button.big,#nav button'))fs()},true);
 // Anzeige an/aus, leichte Zielhilfe beim Schiessen (nur Touch)
 let last=performance.now();
 (function tick(){requestAnimationFrame(tick);const now=performance.now(),d=Math.min(.05,(now-last)/1000);last=now;
  const on=!!mode&&!pmOpen;document.body.classList.toggle('ingame',!!mode);el.classList.toggle('on',on);
  if(!on){for(const k in T)delete T[k];TC.f=TC.s=TC.run=TC.jump=0;stick.classList.remove('on','run');el.querySelectorAll('.tb.on').forEach(b=>b.classList.remove('on'));return}
  el.querySelector('#tb-ads').classList.toggle('lit',!!me.ads);
  const P=S&&S.p&&S.p[id];el.querySelector('#tb-ult').classList.toggle('lit',!!(P&&!(P.qc>0)));
  if(me.f&&S&&S.e){let best=null,bd=.1;const tg=S.e.filter(q=>!q.dead).concat(dm?S.p.filter(q=>q.on&&q.al&&q.i!=id):[]);for(const q of tg){const dist=Math.hypot(q.x-me.x,q.y-me.y);if(dist>15)continue;let a=Math.atan2(q.y-me.y,q.x-me.x)-me.a;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)<bd){bd=Math.abs(a);best=a}}
   if(best!==null)me.a+=best*Math.min(1,d*5)}
 })();
})();
