// TAUBENGAME - Treffer- und Todes-Effekte (nur Optik, jeder Spieler berechnet sie selbst)
// - Treffer: Gegner zuckt nach hinten, Blut spritzt in Schussrichtung, Tropfen bleiben am Boden liegen
// - Tod: wird nach hinten geschleudert und faellt um, sackt zusammen, oder zerplatzt in Stuecke (bei viel Ueberschaden / Explosion)
// - Leichen bleiben ein paar Sekunden liegen, Blutlachen und Spritzer bleiben laenger am Boden
const GORE={dec:[],corp:[],gib:[],hp:{}};
const BLOOD=['#7a0000','#9b0a0a','#b81212','#5a0000','#c41e1e'];
const MAXDEC=140,DECLIFE=30,CORPLIFE=8;
function decal(x,y,r,a){const D=GORE.dec;if(D.length>=MAXDEC)D.shift();D.push({x,y,r,g:r,a:a==null?.85:a,b:performance.now()/1000,s:Math.random()*1e3,grow:0})}
function pool(x,y,r){const D=GORE.dec;if(D.length>=MAXDEC)D.shift();D.push({x,y,r:.05,g:r,a:.9,b:performance.now()/1000,s:Math.random()*1e3,grow:1})}
// Blutspritzer in Richtung ang (Weltwinkel), landende Tropfen werden zu Flecken
function spray(x0,y0,z0,ang,n,sp){for(let k=0;k<n&&WPT.length<600;k++){const a=ang+(Math.random()-.5)*1.1,v=sp*(.35+Math.random()*.9);
  WPT.push({x:x0,y:y0,z:z0+(Math.random()-.5)*.15,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:(Math.random()*1.4+.2)*sp*.45,g:7,l:.6+Math.random()*.5,m:.8,c:BLOOD[Math.random()*BLOOD.length|0],s:.03+Math.random()*.035,bl:1})}}
// Bild einer Figur: PNG-Gegner direkt, gezeichnete Gegner (Typ 0/1 usw.) einmal in ein Bild umrechnen
const GIMG={};
function goreImg(t){if(IMG[t])return IMG[t];if(GIMG[t])return GIMG[t];const T=ST[t];if(!T||!T.f)return null;const H=64,W=Math.max(8,Math.round(H*T.w)),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 for(let i=0;i<W;i++)for(const q of T.f((i+.5)/W,{f:0,i:0}))if(q){g.fillStyle=q[2];g.fillRect(i,H*q[0],1,H*(q[1]-q[0])+.5)}
 const sh={};for(let l=2;l<=8;l++){const k=document.createElement('canvas');k.width=W;k.height=H;const q=k.getContext('2d');q.drawImage(c,0,0);q.globalCompositeOperation='source-atop';q.fillStyle='rgba(0,0,0,'+(1-l/8)+')';q.fillRect(0,0,W,H);sh[l]=k}
 return GIMG[t]={sh,w:W,h:H}}
// Wird beim Aktualisieren der Partikel aufgerufen, wenn ein Tropfen den Boden erreicht
function bloodLand(q){if(q.bl==1){q.bl=2;if(Math.random()<.45)decal(q.x,q.y,.025+Math.random()*.05,.8)}}
// Treffer am Gegner (neuer Treffer erkannt ueber e.hn)
function goreHit(e,q,f,now){if(ST[e.t]&&ST[e.t].bird){birdHit(e,q,f,now);return}const ha=e.ha!=null?e.ha:Math.atan2(q.y-me.y,q.x-me.x),big=bossT(e.t)||e.t==10||e.t==19;
 f.ht=now;f.ha=ha;spray(q.x,q.y,.55,ha,big?12:9,1.6);if(typeof painSnd=='function')painSnd(q.x,q.y,e.t);
 for(let k=0;k<4&&WPT.length<600;k++)WPT.push({x:q.x,y:q.y,z:.55,vx:Math.cos(ha+Math.PI+(Math.random()-.5))*.6,vy:Math.sin(ha+Math.PI+(Math.random()-.5))*.6,vz:.6,g:5,l:.25,m:.3,c:'#ff4a3a',s:.05});
 if(Math.random()<.5)decal(q.x+Math.cos(ha)*(.3+Math.random()*.4),q.y+Math.sin(ha)*(.3+Math.random()*.4),.06+Math.random()*.06)}
// Tod: Art waehlen und Leiche / Stuecke erzeugen
function goreDeath(e,q,now){if(ST[e.t]&&ST[e.t].bird){birdDeath(e,q,now);return}
 const I=goreImg(e.t),T=ST[e.t],ka=e.ka!=null?e.ka:Math.atan2(q.y-me.y,q.x-me.x),boss=bossT(e.t)||e.t==10||e.t==19;
 const style=boss?'boss':((e.ov||0)>=35||(e.kd||0)>=60||e.kx)?'gib':((e.id*7)%3==0?'crumple':'back');
 spray(q.x,q.y,.5,ka,boss?50:style=='gib'?40:22,boss?2.4:style=='gib'?3:2);if(typeof deathSnd=='function')deathSnd(q.x,q.y,style,boss,e.t);
 if(style=='gib'&&I&&T){gibs(e,q,I,T,ka);for(let k=0;k<7;k++)decal(q.x+Math.cos(ka+(Math.random()-.5)*2)*Math.random()*1.4,q.y+Math.sin(ka+(Math.random()-.5)*2)*Math.random()*1.4,.08+Math.random()*.14);pool(q.x,q.y,.5);shk=Math.max(shk,1.5);return}
 if(!I||!T)return;
 const C={t:e.t,x:q.x,y:q.y,x0:q.x,y0:q.y,ka,style,b:now,side:Math.random()<.5?-1:1,s:e.id};GORE.corp.push(C);if(GORE.corp.length>24)GORE.corp.shift();
 setTimeout(()=>pool(C.x,C.y,boss?1.1:.55),style=='back'?450:250)}
// Zerplatzen: Bild in 6 Stuecke schneiden, die wegfliegen, sich drehen und liegen bleiben
function gibs(e,q,I,T,ka){const rows=3,cols=2;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=ka+(Math.random()-.5)*2.2,v=1.6+Math.random()*2.6,sw=I.w/cols,sh=I.h/rows;
  GORE.gib.push({t:e.t,sx:c*sw,sy:r*sh,sw,sh,x:q.x+(c-.5)*.15,y:q.y,z:.85-r*.3,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:1.5+Math.random()*2.5,rot:0,vr:(Math.random()-.5)*16,hh:T.s/rows,ww:T.s*T.w/cols,l:CORPLIFE,b:performance.now()/1000,tr:0})}
 for(let k=0;k<6;k++){const a=ka+(Math.random()-.5)*2.6,v=1.5+Math.random()*3;GORE.gib.push({blob:1,x:q.x,y:q.y,z:.5,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:1+Math.random()*2.5,rot:0,vr:0,sc:.035+Math.random()*.04,l:CORPLIFE,b:performance.now()/1000,tr:0})}
 if(GORE.gib.length>90)GORE.gib.splice(0,GORE.gib.length-90)}
// Physik der Stuecke + Leichen-Bewegung; Sprite-Eintraege fuer die Tiefensortierung
function goreSprites(sp,now){
 const G=GORE.gib;for(let i=G.length-1;i>=0;i--){const g=G[i];g.l-=dt;if(g.l<=0){G.splice(i,1);continue}
  if(g.z>0||g.vz>0){const nx=g.x+g.vx*dt,ny=g.y+g.vy*dt;if(sol(nx,g.y))g.vx*=-.4;else g.x=nx;if(sol(g.x,ny))g.vy*=-.4;else g.y=ny;g.vz-=9*dt;g.z+=g.vz*dt;g.rot+=g.vr*dt;
   g.tr-=dt;if(g.tr<=0&&WPT.length<600){g.tr=.03;WPT.push({x:g.x,y:g.y,z:g.z,vx:0,vy:0,vz:0,g:6,l:.5,m:.5,c:BLOOD[Math.random()*5|0],s:.03,bl:1})}
   if(g.z<0){g.z=0;if(Math.abs(g.vz)>1.2){g.vz*=-.3;g.vx*=.5;g.vy*=.5;decal(g.x,g.y,.05+Math.random()*.05)}else{g.vz=0;g.vx=g.vy=0;g.vr=0;decal(g.x,g.y,.09+Math.random()*.06)}}}
  sp.push({x:g.x,y:g.y,t:'G',g})}
 const C=GORE.corp;for(let i=C.length-1;i>=0;i--){const c=C[i],a=now-c.b;if(a>CORPLIFE){C.splice(i,1);continue}
  if(c.style=='back'||c.style=='boss'){const k=Math.min(1,a/.45),e=1-(1-k)*(1-k),d=c.style=='boss'?.3:.75;c.x=c.x0+Math.cos(c.ka)*d*e;c.y=c.y0+Math.sin(c.ka)*d*e;if(sol(c.x,c.y)){c.x=c.x0;c.y=c.y0}}
  sp.push({x:c.x,y:c.y,t:'C',c})}}
// Liste der sichtbaren Spalten einer Breite als Clip-Pfad (damit Waende davor die Figur verdecken)
function clipCols(x0,x1,ty){let any=0,st=-1;x.beginPath();for(let i=Math.max(0,x0|0);i<=Math.min(VW-1,x1|0)+1;i++){const vis=i<=Math.min(VW-1,x1|0)&&Z[i]>ty;if(vis&&st<0)st=i;if(!vis&&st>=0){x.rect(st,0,i-st,VH);any=1;st=-1}}return any}
function goreLv(s){return nlv(Math.max(2,Math.min(8,(8/(1+s.ty*FOG))|0)),s.x,s.y)}
function drawCorpse(s,sz,cxr,gy,now){const c=s.c,I=goreImg(c.t),T=ST[c.t];if(!I||!T)return;const a=now-c.b,h=sz*T.s,w=h*T.w;
 let ang=0,sy=1,dz=0;
 if(c.style=='crumple'){const k=Math.min(1,a/.35);sy=1-.62*k*k;ang=c.side*.35*k}
 else{const k=Math.min(1,a/.5),e=k<.7?(k/.7)**2:1-.12*Math.sin((k-.7)/.3*Math.PI);ang=c.side*1.5708*Math.min(1,e);sy=1-.35*Math.min(1,k*1.4)}
 const fade=a>CORPLIFE-1?CORPLIFE-a:1,R=Math.max(w,h);if(!clipCols(cxr-R,cxr+R,s.ty))return;
 x.save();x.clip();x.globalAlpha=Math.max(0,fade);x.translate(cxr,gy-dz);x.rotate(ang);x.scale(1,sy);
 const src=I.sh[Math.max(2,goreLv(s)-1)]||I.sh[8];x.drawImage(src,-w/2,-h,w,h);x.restore()}
function drawGib(s,sz,cxr,gy){const g=s.g;if(Z[Math.max(0,Math.min(VW-1,cxr|0))]<s.ty)return;const fade=Math.min(1,g.l);
 x.save();x.globalAlpha=fade;x.translate(cxr,gy-g.z*sz);x.rotate(g.rot);
 if(g.blob){const r=Math.max(1,g.sc*sz);x.fillStyle='#8a0a0a';x.beginPath();x.ellipse(0,0,r,r*.8,0,0,7);x.fill();x.fillStyle='#c42020';x.beginPath();x.arc(-r*.25,-r*.25,r*.4,0,7);x.fill()}
 else{const I=goreImg(g.t);if(I){const h=g.hh*sz,w=g.ww*sz;x.drawImage(I.sh[Math.max(2,goreLv(s)-1)]||I.sh[8],g.sx,g.sy,g.sw,g.sh,-w/2,-h/2,w,h);x.fillStyle='rgba(150,0,0,.55)';x.fillRect(-w/2,h/2-Math.max(1,h*.18),w,Math.max(1,h*.18))}}
 x.restore()}
// Blutflecken auf dem Boden (vor allen Figuren gezeichnet)
function drawDecals(px,py,dx,dy,plx,ply,now){const D=GORE.dec;if(!D.length)return;const inv=1/(plx*dy-dx*ply);
 for(let i=D.length-1;i>=0;i--){const d=D[i],age=now-d.b;if(age>DECLIFE){D.splice(i,1);continue}if(d.grow)d.r=Math.min(d.g,d.r+dt*d.g*.7);
  const ax=d.x-px,ay=d.y-py,tx=inv*(dy*ax-dx*ay),ty=inv*(-ply*ax+plx*ay);if(ty<.3)continue;const sz=VH/ty,sx=VW/2*(1+tx/ty),ci=sx|0;if(ci<0||ci>=VW||Z[ci]<ty)continue;
  const gy=HZ+EY*sz,rx=d.r*sz,ry=Math.max(.6,d.r*sz*EY/ty);if(rx<.4)continue;
  const lv=goreLv({ty,x:d.x,y:d.y})/8,al=d.a*Math.min(1,(DECLIFE-age)/4);x.globalAlpha=al;
  x.fillStyle='rgb('+(95*lv|0)+','+(4*lv|0)+','+(4*lv|0)+')';x.beginPath();x.ellipse(sx,gy,rx,ry,0,0,7);x.fill();
  if(rx>2){x.fillStyle='rgb('+(130*lv|0)+','+(10*lv|0)+','+(8*lv|0)+')';for(let k=0;k<3;k++){const o=Math.sin(d.s+k*2.1),p=Math.cos(d.s*1.3+k*1.7);x.beginPath();x.ellipse(sx+o*rx*.55,gy+p*ry*.5,rx*.38,ry*.38,0,0,7);x.fill()}}}
 x.globalAlpha=1}
// Deathmatch: Spieler, die getroffen werden, bluten auch
function goreP(p,q){const o=GORE.hp[p.i];if(o!=null&&p.hp<o-1&&p.al){spray(q.x,q.y,.6,Math.atan2(q.y-me.y,q.x-me.x),8,1.4);if(typeof painSnd=='function')painSnd(q.x,q.y,0)}
 if(GORE.al&&GORE.al[p.i]&&!p.al&&typeof deathSnd=='function')deathSnd(q.x,q.y,'back',0,0);(GORE.al||(GORE.al={}))[p.i]=p.al;GORE.hp[p.i]=p.hp}
// Kill-Anzeige am Fadenkreuz (eigene Kills)
let killM=0,lastSc0=-1;
function killMark(P,gx){if(lastSc0>=0&&(P.sc|0)>lastSc0&&!S.dm){killM=.32}lastSc0=P.sc|0;if(killM<=0)return;killM-=dt;const a=Math.min(1,killM/.15),r=6+(.32-killM)*14;
 x.save();x.globalAlpha=a;x.strokeStyle='#ff2020';x.lineWidth=2;x.beginPath();for(const[u,v]of[[-1,-1],[1,-1],[-1,1],[1,1]]){x.moveTo(gx+u*r*.45,VH/2+v*r*.45);x.lineTo(gx+u*r,VH/2+v*r)}x.stroke();x.restore()}
