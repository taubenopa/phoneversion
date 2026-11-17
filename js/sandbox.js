// TAUBENGAME - Sandbox: frei spielen ohne Wellen. Alle Waffen, Gegner und Bosse selbst spawnen, Unverwundbar, volle Munition usw.
// Start: Koop & Deathmatch -> Modus "Sandbox". Im Spiel: B (Controller: Select, Handy: Knopf SANDBOX) oeffnet die Werkzeuge.
// Coins und Rekorde gibt es in der Sandbox nicht.
var SBX=0,sbOpen=0;
const SB={god:1,ammo:1,ult:1,freeze:0,slow:0};
const SBE=[[0,'Mensch','Human'],[1,'Schwerer','Heavy'],[13,'Werwolf','Werewolf'],[14,'Flitzer','Runner'],[15,'Schütze','Shooter'],[16,'Werfer','Thrower'],[17,'Panzer','Tank']];
// Wird jedes Bild vom Host aufgerufen
function sbTick(dt){const all=131071;
 for(const p of players){if(!p.on&&p.i!==0)continue;p.lo=all;if(SB.ammo&&p.am)for(let w=1;w<WP.length;w++)p.am[w]=MX[w]||p.am[w];if(SB.ult)p.qc=0}
 me.lo=all;
 if(SB.freeze)for(const e of E)if(!e.dead)e.sn=Math.max(e.sn||0,.15)}
// Spawn vor dem Spieler (3-5 Felder), sonst an einem normalen Spawnpunkt
function sbSpot(k){const p=players[0];for(let tr=0;tr<12;tr++){const d=3+Math.random()*2.5,a=p.a+(Math.random()-.5)*(.9+k*.15),x0=p.x+Math.cos(a)*d,y0=p.y+Math.sin(a)*d;if(can(x0,y0,.4))return[x0,y0]}return null}
function sbSpawn(t,n){for(let k=0;k<n;k++){const at=sbSpot(k);if(t==null){const q=SBE[Math.random()*SBE.length|0];mk(q[0],at||undefined)}else mk(t,at||undefined)}sbRender()}
function sbBoss(t){E.filter(e=>!e.dead&&isBoss(e)).forEach(e=>e.dead=1);mk(t,sbSpot(0)||undefined);sbToggle(0)}
function sbKill(){for(const e of E)if(!e.dead)hurtE(e,1e9,0);sbRender()}
function sbClear(){E=[];J=[];sbRender()}
const sbT=(de,en)=>typeof LANG!='undefined'&&LANG=='en'?en:de;
function sbRender(){const box=document.getElementById('sbx');if(!box)return;const alive=E.filter(e=>!e.dead).length;
 const tg=(k,de,en)=>'<button class="sbt'+(SB[k]?' on':'')+'" data-k="'+k+'">'+sbT(de,en)+'</button>';
 box.innerHTML='<div class="sbh"><b>Sandbox</b><span>'+alive+' '+sbT('Gegner','enemies')+'</span><button class="sbx-c" data-a="close" aria-label="Schließen">✕</button></div>'+
  '<h5>'+sbT('Gegner spawnen','Spawn enemies')+'</h5><div class="sbg">'+SBE.map(q=>'<button data-e="'+q[0]+'">'+sbT(q[1],q[2])+'</button>').join('')+'<button data-r="5">'+sbT('5 zufällig','5 random')+'</button><button data-r="15">'+sbT('15 zufällig','15 random')+'</button></div>'+
  '<h5>'+sbT('Boss','Boss')+'</h5><div class="sbg">'+CB.filter((t,i,A)=>A.indexOf(t)==i).map(t=>'<button data-b="'+t+'">'+bossName(t)+'</button>').join('')+'</div>'+
  '<h5>'+sbT('Einstellungen','Settings')+'</h5><div class="sbg">'+tg('god','Unverwundbar','God mode')+tg('ammo','Volle Munition','Infinite ammo')+tg('ult','Ulti ohne Wartezeit','No ult cooldown')+tg('freeze','Gegner einfrieren','Freeze enemies')+'</div>'+
  '<div class="sbg sbr"><button data-a="kill">'+sbT('Alle Gegner töten','Kill all enemies')+'</button><button data-a="clear">'+sbT('Alle entfernen','Remove all')+'</button><button data-a="heal">'+sbT('Heilen','Heal')+'</button></div>'}
function sbToggle(on){if(!SBX||story||mode!=1)return;sbOpen=on==null?!sbOpen:!!on;const box=document.getElementById('sbx');box.classList.toggle('on',!!sbOpen);
 if(sbOpen){sbRender();try{document.exitPointerLock()}catch(e){}me.f=0}else{try{if(!TOUCH)cv.requestPointerLock()}catch(e){}}}
(function(){
 const box=document.createElement('div');box.id='sbx';document.body.appendChild(box);
 box.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.e!=null)sbSpawn(+d.e,1);else if(d.r)sbSpawn(null,+d.r);else if(d.b)sbBoss(+d.b);
  else if(d.k){SB[d.k]=SB[d.k]?0:1;sbRender()}else if(d.a=='kill')sbKill();else if(d.a=='clear')sbClear();else if(d.a=='heal'){const p=players[0];p.hp=100;p.al=true;sbRender()}else if(d.a=='close')sbToggle(0)});
 addEventListener('keydown',e=>{if(e.code=='KeyB'&&mode==1&&SBX&&!pmOpen){sbToggle();e.preventDefault()}else if(e.code=='Escape'&&sbOpen){sbToggle(0);e.preventDefault()}});
 // Handy-Knopf
 const tb=document.createElement('button');tb.className='tb';tb.id='tb-sbx';tb.dataset.k='sbx';tb.textContent='SANDBOX';tb.setAttribute('aria-label','Sandbox');
 const add=()=>{const tc=document.getElementById('tc');if(tc&&!document.getElementById('tb-sbx')){tc.appendChild(tb);tb.addEventListener('touchstart',ev=>{ev.preventDefault();ev.stopPropagation();sbToggle(1)},{passive:false})}};add();setTimeout(add,500);
 // Controller: Select-Taste (Button 8)
 let lastSel=0;setInterval(()=>{const g=navigator.getGamepads&&[...navigator.getGamepads()].find(q=>q);const v=g&&g.buttons[8]&&g.buttons[8].pressed;if(v&&!lastSel&&mode==1&&SBX)sbToggle();lastSel=v;
  const t=document.getElementById('tb-sbx');if(t)t.style.display=SBX&&mode==1&&!story?'grid':'none';if(sbOpen&&(mode!=1||!SBX))sbToggle(0);if(sbOpen){const sp=document.querySelector('#sbx .sbh span');if(sp)sp.textContent=E.filter(e=>!e.dead).length+' '+sbT('Gegner','enemies')}},250);
})();
