// ---------- Fliegende Tauben ----------
// 90 = Taube: kreist ueber dem Spieler, kackt von oben, stoesst ab und zu herab und pickt
// 91 = Riesentaube (Boss): groesser, Kackregen, ruft kleine Tauben, wird unter 50 % wuetend
// 92 = Taubenkacke (faellt von oben, macht Schaden und verschmiert kurz das Bild)
const BIRD=90,BIRDB=91,POOP=92;

// Sprite: Taube von der Seite, Fluegel schlagen mit s.ph. Spalten von oben (0) nach unten (1)
function pigeonCols(boss){
 const B=boss?['#5d6375','#4a4f5f','#3a3e4b','#2a2d36']:['#9aa3b5','#7d869a','#5d6476','#454b5a'],EYE=boss?'#ff2a2a':'#ff8a1a';
 return (u,s)=>{const r=[],f=s&&s.f,c=k=>f?'#ffffff':B[k],ph=(s&&s.ph)||0,w=Math.sin(ph);
  if(u>.06&&u<.24){const k=(u-.06)/.18;r.push([.5+.06*k,.66-.02*k,c(3)])}                       // Schwanz
  {const d=(u-.48)/.3;if(Math.abs(d)<1){const h=Math.sqrt(1-d*d)*.19;r.push([.6-h,.6+h,c(1)]);r.push([.6-h*.55,.6+h*.2,c(0)])}}  // Koerper
  if(u>.66&&u<.8)r.push([.42,.6,f?'#fff':(u<.73?'#4f8f72':'#7a5a9a')]);                      // schillernder Hals
  {const d=(u-.82)/.1;if(Math.abs(d)<1){const h=Math.sqrt(1-d*d)*.1;r.push([.4-h,.4+h,c(0)])}}  // Kopf
  if(u>.9&&u<.97)r.push([.39,.44,f?'#fff':'#e2b55c']);                                         // Schnabel
  if(u>.83&&u<.87)r.push([.36,.4,f?'#fff':EYE]);                                               // Auge
  if(u>.3&&u<.66){const t=(u-.3)/.36,span=.45*(1-Math.abs(t-.45)*1.2);                         // Fluegel
   if(w>0)r.push([.56-span*w,.58,c(2)]);else r.push([.56,.58+span*.7*-w,c(2)]);
   if(u>.44&&u<.5)r.push(w>0?[.56-span*w*.9,.57,c(3)]:[.57,.58+span*.6*-w,c(3)])}
  if(boss&&u>.76&&u<.88)r.push([.24,.3,f?'#fff':'#e8c21a']);                                  // Krone der Riesentaube
  return r}}
ST[BIRD]={s:.5,w:1.6,z:0,bird:1,f:pigeonCols(0)};
ST[BIRDB]={s:1.3,w:1.6,z:0,bird:1,f:pigeonCols(1)};
ST[POOP]={s:.13,w:1,z:0,f:u=>{const d=u-.5;if(Math.abs(d)>.5)return[];const h=Math.sqrt(.25-d*d);return[[.5-h,.5+h,'#e9e9dc'],[.5-h*.5,.5+h*.3,'#8a8f6a']]}};

function birdTop(boss){return OUT?(boss?1.4:1.15):(boss?.02:.55)}
function mkBird(t,at){const boss=t==BIRDB,s=at||ESP[Math.random()*4|0],w=wave||1;
 const hp=boss?(1400+w*90)*dif:(30+w*2.5)*dif;
 E.push({id:++EID,x:s[0],y:s[1],t,bird:1,hp,mh:hp,r:boss?.55:.3,sp:boss?2.2:3.3,fl:0,cd:2+Math.random()*2,dead:0,ph:Math.random()*6,z:birdTop(boss)+(OUT?.3:0),st:0,ca:Math.random()*6.28,dir:Math.random()<.5?1:-1})}

function birdAI(e,tp,bd,ux,uy,los,dt){
 const boss=e.t==BIRDB,top=birdTop(boss);
 e.ph+=dt*(e.st==1?22:14);
 if(boss&&!e.en&&e.hp<e.mh*.5){e.en=1;e.sp*=1.3;e.at=.3;ev(5)}
 if(e.st==1){                                                       // Sturzflug auf den Spieler
  move(e,ux,uy,e.sp*1.9*dt);e.z+=(.28-e.z)*Math.min(1,dt*3.2);e.dt2=(e.dt2||0)+dt;
  if(bd<.75&&e.z<.6&&!(tp.z>.5)){hurtP(tp,12);e.at=.3;e.st=0;e.cd=2.5+Math.random()*2;e.dt2=0}
  else if(e.dt2>2.6||!los){e.st=0;e.cd=1.5;e.dt2=0}
  return}
 e.ca+=dt*e.dir*(boss?.32:.55);const R=boss?5.5:4.2;                // um den Spieler kreisen
 const gx=tp.x+Math.cos(e.ca)*R,gy=tp.y+Math.sin(e.ca)*R,dx=gx-e.x,dy=gy-e.y,d=Math.hypot(dx,dy);
 if(d>.08)move(e,dx/d,dy/d,Math.min(d,e.sp*dt));
 if(d>.08&&Math.hypot(e.x-gx,e.y-gy)>d-.001)e.ca+=e.dir*dt*1.5;    // haengt an einer Wand: weiter drehen
 e.z+=(top+Math.sin(e.ph*.08)*.07-e.z)*Math.min(1,dt*2);
 if(e.cd<=0&&los){
  if(!boss&&Math.random()<.4){e.st=1;e.dt2=0}
  else{poop(e,tp,boss?16:9);e.at=.3;e.cd=boss?(e.en?.7:1.1):2.2+Math.random()*1.6}}
 if(boss){e.rb=(e.rb==null?6:e.rb)-dt;
  if(e.rb<=0&&los){for(let k=0;k<(e.en?10:7);k++){const a=Math.random()*6.28,r=Math.random()*2.2;poop({x:e.x,y:e.y,z:e.z},{x:tp.x+Math.cos(a)*r,y:tp.y+Math.sin(a)*r},14)}
   if(E.filter(o=>!o.dead&&o.t==BIRD).length<4){mkBird(BIRD,[e.x,e.y]);if(e.en)mkBird(BIRD,[e.x,e.y])}
   e.rb=e.en?4:6.5;ev(5)}}
}
// Kacke faellt von der Taube genau dahin, wo der Spieler gerade steht
function poop(e,tp,dmg){const T=Math.sqrt(2*Math.max(.2,e.z)/9.5);J.push({x:e.x,y:e.y,vx:(tp.x-e.x)/T,vy:(tp.y-e.y)/T,fz:Math.max(.2,e.z),vz:0,pp:1,t:POOP,o:-1,l:5,d:dmg})}
// im Geschoss-Update: true = weiterfliegen
function poopStep(j,dt){j.vz-=9.5*dt;j.fz+=j.vz*dt;j.x+=j.vx*dt;j.y+=j.vy*dt;if(j.fz>0&&j.l>0){j.l-=dt;return true}
 for(const p of players)if(p.on&&p.al&&!(p.z>.45)&&Math.hypot(p.x-j.x,p.y-j.y)<.7){hurtP(p,j.d||9);p.pb=1.6}
 return false}
// Spritzer beim Aufprall (laeuft beim Zeichnen, also auch bei Mitspielern)
function poopFx(j){if(j.t!=POOP||j.fz>.18)return;const k='pp'+j.x.toFixed(0)+'_'+j.y.toFixed(0);if(!FXS[k])puff(j.x,j.y,.05,10,['#e9e9dc','#d9dac6','#8a8f6a'],1.1,{g:7,l:.45,m:.5,s:.03});(FXS[k]=FXS[k]||{}).u=frameN}

// ---------- Effekte auf dem Bildschirm ----------
const PB={v:0,sp:[]};
function poopHud(P,dt){const v=P&&P.pb>0?Math.min(1,P.pb/1.2):0;
 if(v>0&&PB.v<=0){PB.sp=[];for(let k=0;k<7;k++)PB.sp.push([VW*(.15+Math.random()*.7),VH*(.1+Math.random()*.6),8+Math.random()*18,Math.random()*6]);
  try{nz(.18,'lowpass',900,200,.5);tone(180,90,.12,'sine',.2,.02)}catch(e){}}
 PB.v=v;if(v<=0)return;
 for(const[a,b,r,o]of PB.sp){x.globalAlpha=Math.min(.92,v*1.2);x.fillStyle='#e8e8d8';x.beginPath();x.arc(a,b,r,0,6.3);x.fill();
  x.fillStyle='#d9dac6';for(let k=0;k<5;k++){const q=o+k*1.3;x.beginPath();x.arc(a+Math.cos(q)*r*.9,b+Math.sin(q)*r*.9,r*.35,0,6.3);x.fill()}
  x.fillStyle='#8d9070';x.beginPath();x.arc(a+r*.15,b-r*.1,r*.35,0,6.3);x.fill();
  x.fillRect(a-r*.08,b,r*.16,r*(1.2+(1-v)*1.5))}
 x.globalAlpha=1}

// Treffer / Tod der Taube: Federn statt Schreie
function birdSnd(x0,y0,dead){try{const d=Math.hypot(x0-me.x,y0-me.y),v=Math.max(.05,1-d/18);
 if(dead){tone(900,300,.18,'square',.08*v);tone(700,1400,.08,'square',.05*v,.05)}else{tone(520,380,.09,'triangle',.07*v);tone(380,420,.07,'triangle',.05*v,.08)}}catch(e){}}
function birdHit(e,q,f,now){const ha=e.ha!=null?e.ha:Math.atan2(q.y-me.y,q.x-me.x),z=(e.z||0)+ST[e.t].s*.5;f.ht=now;f.ha=ha;
 spray(q.x,q.y,z,ha,6,1.2);puff(q.x,q.y,z,6,['#9aa3b5','#c7cdd8','#fff'],.8,{g:.7,l:.9,m:1,s:.03});birdSnd(q.x,q.y,0)}
function birdDeath(e,q,now){const I=goreImg(e.t),T=ST[e.t],ka=e.ka!=null?e.ka:Math.atan2(q.y-me.y,q.x-me.x),z=(e.z||0)+T.s*.5,boss=e.t==BIRDB;
 spray(q.x,q.y,z,ka,boss?40:16,2);puff(q.x,q.y,z,boss?60:24,['#9aa3b5','#c7cdd8','#fff','#7d869a'],boss?2.2:1.3,{g:.6,l:1.6,m:1.8,s:.035});birdSnd(q.x,q.y,1);
 if(boss){shk=Math.max(shk,3);if(typeof deathSnd=='function')deathSnd(q.x,q.y,'boss',1,e.t)}
 if(I&&T)GORE.gib.push({t:e.t,sx:0,sy:0,sw:I.w,sh:I.h,x:q.x,y:q.y,z:e.z||0,vx:Math.cos(ka)*1.2,vy:Math.sin(ka)*1.2,vz:.6,rot:0,vr:(Math.random()-.5)*10,hh:T.s,ww:T.s*T.w,l:CORPLIFE,b:now,tr:0});
 setTimeout(()=>decal(q.x,q.y,boss?.3:.12),700)}
