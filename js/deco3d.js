// TAUBENGAME - Feste Deko-Objekte: Autos, Container, Zaeune, Absperrungen, Tische und Aufsteller stehen jetzt fest im Raum
// (echte 3D-Kaesten bzw. Flaechen statt Bilder, die sich mitdrehen). Runde Sachen (Baeume, Laternen, Poller ...) sehen von
// allen Seiten gleich aus und bleiben Bilder. ALLE Deko-Objekte haben jetzt eine feste Hitbox: man laeuft nicht mehr durch.
// Art: box = Kasten (L Laenge, W Breite), plane = flache Wand (beidseitig), cross = zwei gekreuzte Flaechen, round = Bild + runde Hitbox (r)
const CARC={41:'#b9bcc0',42:'#1d2238',43:'#b3242a',44:'#2b2b2e',45:'#e8e8e4'};
// k:'m' = echtes 3D-Modell (siehe MODELS unten), hl/hw = halbe Laenge/Breite der Hitbox, r = runde Hitbox
const D3={41:{k:'m',hl:.82,hw:.38},42:{k:'m',hl:.82,hw:.38},43:{k:'m',hl:.82,hw:.38},44:{k:'m',hl:.82,hw:.38},45:{k:'m',hl:.98,hw:.44},
 47:{k:'m',hl:.52,hw:.06},56:{k:'m',hl:.46,hw:.36},57:{k:'m',hl:.62,hw:.05},59:{k:'m',hl:.18,hw:.14},55:{k:'m',r:.34},46:{k:'m',r:.17},53:{k:'m',r:.08},54:{k:'m',r:.2},
 40:{k:'m',r:.22},48:{k:'m',r:.3},49:{k:'round',r:.08},50:{k:'round',r:.08},51:{k:'round',r:.35},52:{k:'round',r:.28},
 58:{k:'round',r:.08},80:{k:'round',r:.08}};
const BIGB={40:1,41:1,42:1,43:1,44:1,45:1,51:1,56:1};   // grosse Sachen bleiben fuer die Wegsuche der Gegner gesperrt
let OBJ=[],OBC=null;
const mkc=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);return c};
// Front/Heck eines Autos (das Seitenbild gibt es schon)
const ENDS={};
function carEnd(t,T){if(ENDS[t])return ENDS[t];const H=T.c.height,W=Math.round(H*.9),col=CARC[t]||'#888';
 return ENDS[t]=mkc(W,H,g=>{const y0=H*.16;g.fillStyle=col;g.fillRect(1,H*.42,W-2,H*.36);g.fillRect(W*.14,y0,W*.72,H*.28);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(1,H*.42,W-2,H*.36);
  g.fillStyle='#1b2433';g.fillRect(W*.18,y0+H*.04,W*.64,H*.2);g.fillStyle='#ffe9a8';g.fillRect(3,H*.5,W*.2,H*.08);g.fillRect(W*.78-2,H*.5,W*.2,H*.08);
  g.fillStyle='#222';g.fillRect(1,H*.7,W-2,H*.08);g.fillRect(2,H*.78,W*.18,H*.16);g.fillRect(W*.8-2,H*.78,W*.18,H*.16);g.fillStyle='#ddd';g.fillRect(W*.38,H*.62,W*.24,H*.06)})}
const DARK={};function darker(c){if(DARK[c.width+'x'+c.height+':'+(c._id||(c._id=Math.random()))])return DARK[c.width+'x'+c.height+':'+c._id];
 return DARK[c.width+'x'+c.height+':'+c._id]=mkc(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,0,c.width,c.height)})}
// Nach dem Laden einer Karte: Flaechen und Hitboxen bauen
function buildObj(){OBJ=[];OBC=new Array(N*N);
 for(const d of DECO){const T=ST[d.t],S=D3[d.t];if(!T||!S){if(DBLK[d.t])B[(d.y|0)*N+(d.x|0)]=1;continue}
  if(BIGB[d.t])B[(d.y|0)*N+(d.x|0)]=1;
  const r=d.r||0,ca=Math.cos(r),sa=Math.sin(r),H=T.s,L=T.s*T.a,o={d,x:d.x,y:d.y,r,ca,sa,F:[],k:S.k};
  const P=(u,v)=>[d.x+u*ca-v*sa,d.y+u*sa+v*ca];
  if(S.k=='m'){o.M=buildModel(d.t,(u,v)=>{const a=VARS[d.t]?((d.x*3.1+d.y*5.7)%6.28):0,c=Math.cos(a),sn=Math.sin(a);return P(u*c-v*sn,u*sn+v*c)},d);if(S.r)o.rr=S.r;else{o.hl=S.hl;o.hw=S.hw}}
  else if(S.k=='box'){const hl=L/2,hw=S.W/2,c=[P(-hl,-hw),P(hl,-hw),P(hl,hw),P(-hl,hw)],e=S.end=='car'?carEnd(d.t,T):T.c;
   o.F=[{a:c[0],b:c[1],tex:T.c,H},{a:c[1],b:c[2],tex:darker(e),H},{a:c[2],b:c[3],tex:T.c,H,mir:1},{a:c[3],b:c[0],tex:darker(e),H}];o.hl=hl;o.hw=hw}
  else if(S.k=='plane'){const hl=L/2;o.F=[{a:P(-hl,0),b:P(hl,0),tex:T.c,H,two:1}];o.hl=hl;o.hw=S.W/2}
  else if(S.k=='cross'){const hl=L/2;o.F=[{a:P(-hl,0),b:P(hl,0),tex:T.c,H,two:1},{a:P(0,-hl),b:P(0,hl),tex:T.c,H,two:1}];o.rr=S.r}
  else o.rr=S.r;
  d.o=o;OBJ.push(o);
  const ext=o.rr||Math.hypot(o.hl,o.hw);for(let j=Math.floor(d.y-ext);j<=Math.floor(d.y+ext);j++)for(let i=Math.floor(d.x-ext);i<=Math.floor(d.x+ext);i++){if(i<0||j<0||i>=N||j>=N)continue;const k=j*N+i;(OBC[k]||(OBC[k]=[])).push(o)}}
}
// Punkt in einem Objekt? (fuer Geschosse usw.)
function objAt(a,b){if(!OBC)return false;const k=(b|0)*N+(a|0),L=OBC[k];if(!L)return false;for(const o of L)if(inObj(o,a,b,0))return true;return false}
function inObj(o,a,b,rad){const dx=a-o.x,dy=b-o.y;if(o.rr)return dx*dx+dy*dy<(o.rr+rad)*(o.rr+rad);const u=dx*o.ca+dy*o.sa,v=-dx*o.sa+dy*o.ca;
 const cu=Math.max(-o.hl,Math.min(o.hl,u)),cv=Math.max(-o.hw,Math.min(o.hw,v));if(rad<=0)return u===cu&&v===cv;return (u-cu)**2+(v-cv)**2<rad*rad}
// Kreis (Spieler/Gegner) gegen Objekte
function objHit(a,b,rad){if(!OBC)return false;for(let j=Math.floor(b-rad-.01);j<=Math.floor(b+rad+.01);j++)for(let i=Math.floor(a-rad-.01);i<=Math.floor(a+rad+.01);i++){if(i<0||j<0||i>=N||j>=N)continue;const L=OBC[j*N+i];if(L)for(const o of L)if(inObj(o,a,b,rad))return true}return false}
// Eine Flaeche spaltenweise zeichnen (wie eine Wand, mit Verdeckung durch Waende)
function drawFace(f,s){const C=CAM,inv=1/(C.plx*C.dy-C.dx*C.ply);
 const tf=p=>{const ax=p[0]-C.px,ay=p[1]-C.py;return[inv*(C.dy*ax-C.dx*ay),inv*(-C.ply*ax+C.plx*ay)]};let A=tf(f.a),Bp=tf(f.b),u0=0,u1=1;const NZ=.08;
 if(A[1]<NZ&&Bp[1]<NZ)return;if(A[1]<NZ){const t=(NZ-A[1])/(Bp[1]-A[1]);A=[A[0]+(Bp[0]-A[0])*t,NZ];u0=t}else if(Bp[1]<NZ){const t=(NZ-Bp[1])/(A[1]-Bp[1]);Bp=[Bp[0]+(A[0]-Bp[0])*t,NZ];u1=1-t}
 let sa=VW/2*(1+A[0]/A[1]),sb=VW/2*(1+Bp[0]/Bp[1]);if(!f.two&&sa>=sb)return;   // Rueckseite
 let P0=A,P1=Bp,v0=u0,v1=u1;if(sa>sb){[sa,sb]=[sb,sa];P0=Bp;P1=A;v0=u1;v1=u0}
 const i0=Math.max(0,Math.ceil(sa)),i1=Math.min(VW-1,Math.floor(sb));if(i1<i0)return;
 let tex=f.tex;const dmid=(P0[1]+P1[1])/2;if(LMI){tex.sh=tex.sh||decSh({c:tex});tex=tex.sh[nlv(Math.max(1,Math.min(8,(8/(1+dmid*FOG))|0)),s.x,s.y)]}
 const tw=tex.width,th=tex.height,dtx=P1[0]-P0[0],dty=P1[1]-P0[1];
 for(let i=i0;i<=i1;i++){const k=2*(i+.5)/VW-1,den=dtx-k*dty;if(Math.abs(den)<1e-6)continue;const t=Math.max(0,Math.min(1,(k*P0[1]-P0[0])/den)),ty=P0[1]+dty*t;if(Z[i]<ty)continue;
  // perspektivisch korrekt: t ist schon im Raum linear, da aus der Kamera-Geraden geloest
  let u=v0+(v1-v0)*t;if(f.mir)u=1-u;const sz=PV/ty,bot=HZ+EY*sz,top=bot-f.H*sz;x.drawImage(tex,Math.min(tw-1,(u*tw)|0),0,1,th,i,top,1,bot-top)}}
function drawObj(s){const o=s.o;if(!o)return false;if(o.M){drawModel3(o,s);return true}if(!o.F.length)return false;const C=CAM;
 const F=o.F.map(f=>({f,d:((f.a[0]+f.b[0])/2-C.px)**2+((f.a[1]+f.b[1])/2-C.py)**2})).sort((p,q)=>q.d-p.d);for(const q of F)drawFace(q.f,s);return true}

// ===================== Echte 3D-Modelle =====================
// Lokale Koordinaten: u = Laengsrichtung, v = quer, z = Hoehe (Boden 0). Flaechen gegen den Uhrzeigersinn von aussen gesehen.
const hx=c=>{c=c.replace('#','');if(c.length==3)c=c.split('').map(q=>q+q).join('');return[0,2,4].map(i=>parseInt(c.slice(i,i+2),16))};
function MB(){const F=[];const q=(vs,c)=>F.push({v:vs,c:typeof c=='string'?hx(c):c});
 // Kasten mit unterschiedlicher Groesse oben/unten (Pyramidenstumpf): b=[u0,u1,v0,v1] unten, t=[u0,u1,v0,v1] oben
 const fr=(b,t,z0,z1,c,cs)=>{const B=[[b[0],b[2],z0],[b[1],b[2],z0],[b[1],b[3],z0],[b[0],b[3],z0]],T=[[t[0],t[2],z1],[t[1],t[2],z1],[t[1],t[3],z1],[t[0],t[3],z1]],S=cs||{};
  q([T[0],T[1],T[2],T[3]],S.top||c);q([B[0],B[1],T[1],T[0]],S.s1||c);q([B[1],B[2],T[2],T[1]],S.fr||c);q([B[2],B[3],T[3],T[2]],S.s2||c);q([B[3],B[0],T[0],T[3]],S.bk||c)};
 const bx=(u0,u1,v0,v1,z0,z1,c,cs)=>fr([u0,u1,v0,v1],[u0,u1,v0,v1],z0,z1,c,cs);
 // Zylinder: senkrecht (ax='z') oder quer liegend (ax='v', fuer Raeder)
 const cy=(cu,cv,cz,r,h,n,c,ax,cap)=>{const P=[];for(let k=0;k<n;k++){const a=k/n*6.2832;P.push([Math.cos(a)*r,Math.sin(a)*r])}
  if(ax=='v'){for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];q([[cu+a[0],cv,cz+a[1]],[cu+a[0],cv+h,cz+a[1]],[cu+b[0],cv+h,cz+b[1]],[cu+b[0],cv,cz+b[1]]],c)}
   q(P.map(p=>[cu+p[0],cv+h,cz+p[1]]).reverse(),cap||c);q(P.map(p=>[cu+p[0],cv,cz+p[1]]),cap||c)}
  else{for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];q([[cu+a[0],cv+a[1],cz],[cu+b[0],cv+b[1],cz],[cu+b[0],cv+b[1],cz+h],[cu+a[0],cv+a[1],cz+h]],c)}q(P.map(p=>[cu+p[0],cv+p[1],cz+h]),cap||c)}};
 // Kegel(-stumpf) senkrecht
 const cone=(cu,cv,z0,r0,z1,r1,n,c)=>{for(let k=0;k<n;k++){const a=k/n*6.2832,b=(k+1)/n*6.2832;q([[cu+Math.cos(a)*r0,cv+Math.sin(a)*r0,z0],[cu+Math.cos(b)*r0,cv+Math.sin(b)*r0,z0],[cu+Math.cos(b)*r1,cv+Math.sin(b)*r1,z1],[cu+Math.cos(a)*r1,cv+Math.sin(a)*r1,z1]].filter((p,i,A)=>i<2||r1>0||i==2),c)}};
 // Kugel grob (Eiskugel)
 const ball=(cu,cv,cz,r,c)=>{const n=8,m=4;for(let j=0;j<m;j++){const a0=-1.5708+j/m*3.1416,a1=-1.5708+(j+1)/m*3.1416;for(let k=0;k<n;k++){const b0=k/n*6.2832,b1=(k+1)/n*6.2832,p=(a,b)=>[cu+Math.cos(a)*Math.cos(b)*r,cv+Math.cos(a)*Math.sin(b)*r,cz+Math.sin(a)*r];
  q(j==0?[p(a0,b0),p(a1,b1),p(a1,b0)]:j==m-1?[p(a0,b0),p(a0,b1),p(a1,b0)]:[p(a0,b0),p(a0,b1),p(a1,b1),p(a1,b0)],c)}}};
 // flaches Rechteck auf einer Seite (Lichter, Schilder): an Flaeche u=const (Richtung du) oder v=const (dv)
 const decU=(u,du,v0,v1,z0,z1,c)=>q(du>0?[[u,v0,z0],[u,v1,z0],[u,v1,z1],[u,v0,z1]]:[[u,v1,z0],[u,v0,z0],[u,v0,z1],[u,v1,z1]],c);
 const decV=(v,dv,u0,u1,z0,z1,c)=>q(dv<0?[[u0,v,z0],[u1,v,z0],[u1,v,z1],[u0,v,z1]]:[[u1,v,z0],[u0,v,z0],[u0,v,z1],[u1,v,z1]],c);
 return{F,q,fr,bx,cy,cone,ball,decU,decV}}
const shadeC=(c,k)=>c.map(v=>Math.min(255,v*k|0));
const MODELS={
 car(col){const m=MB(),c=hx(col),dk=shadeC(c,.7),gl=[40,52,70],ch=[205,208,212];
  m.bx(-.82,.82,-.36,.36,.1,.3,c,{fr:c,bk:c});                                  // Unterteil
  m.fr([-.48,.4,-.35,.35],[-.32,.16,-.3,.3],.3,.55,gl,{top:c});                  // Kabine mit Scheiben, Dach in Wagenfarbe
  m.bx(-.84,-.8,-.34,.34,.08,.16,[40,40,44]);m.bx(.8,.84,-.34,.34,.08,.16,[40,40,44]); // Stossstangen
  for(const u of[-.52,.52])for(const v of[-.39,.32])m.cy(u,v,.11,.11,.07,7,[22,22,24],'v',[150,150,156]);
  m.decU(.821,1,.18,.32,.2,.26,[255,240,190]);m.decU(.821,1,-.32,-.18,.2,.26,[255,240,190]);   // Scheinwerfer
  m.decU(-.821,-1,.18,.32,.2,.26,[200,30,30]);m.decU(-.821,-1,-.32,-.18,.2,.26,[200,30,30]);    // Ruecklichter
  m.decU(-.821,-1,-.08,.08,.13,.17,[230,230,200]);                                             // Nummernschild
  m.decV(-.361,-1,-.1,.1,.24,.26,ch);m.decV(.361,1,-.1,.1,.24,.26,ch);                          // Tuergriffe
  return m.F},
 van(){const m=MB(),c=hx('#e8e8e4'),gl=[40,52,70];
  m.bx(-.98,.62,-.42,.42,.1,.78,c);m.fr([.62,.98,-.42,.42],[.62,.8,-.4,.4],.1,.62,c,{top:c,fr:gl});m.bx(.62,.98,-.42,.42,.1,.36,c);
  m.decV(-.421,-1,.66,.9,.42,.6,gl);m.decV(.421,1,.66,.9,.42,.6,gl);m.decV(-.421,-1,-.9,.5,.5,.56,[200,40,40]);m.decV(.421,1,-.9,.5,.5,.56,[200,40,40]);
  for(const u of[-.62,.62])for(const v of[-.46,.39])m.cy(u,v,.12,.12,.07,7,[22,22,24],'v',[150,150,156]);
  m.decU(.981,1,.22,.38,.2,.28,[255,240,190]);m.decU(.981,1,-.38,-.22,.2,.28,[255,240,190]);m.decU(-.981,-1,.26,.38,.2,.32,[200,30,30]);m.decU(-.981,-1,-.38,-.26,.2,.32,[200,30,30]);
  return m.F},
 container(){const m=MB(),c=[143,147,153],t=[169,173,179];m.bx(-.44,.44,-.34,.34,.03,.56,c,{top:t});m.fr([-.44,.44,-.34,.34],[-.4,.4,-.3,.3],.56,.64,t);
  for(const s of[-1,1])for(let k=0;k<4;k++){const col=k&1?[240,240,240]:[200,30,30],z0=.08+k*.12;m.decV(-.341,-1,s<0?-.44:.36,s<0?-.36:.44,z0,z0+.12,col);m.decV(.341,1,s<0?-.44:.36,s<0?-.36:.44,z0,z0+.12,col)}
  m.decV(-.341,-1,-.18,.18,.42,.46,[40,42,46]);m.decV(.341,1,-.18,.18,.42,.46,[40,42,46]);m.bx(-.44,.44,-.34,.34,0,.03,[90,94,99]);return m.F},
 fence(){const m=MB(),w=[90,65,40];for(const u of[-.58,0,.58])m.bx(u-.03,u+.03,-.03,.03,0,.3,w,{top:[110,80,52]});m.bx(-.62,.62,-.015,.015,.2,.23,[111,115,119]);return m.F},
 barrier(){const m=MB(),p=[90,90,95];for(const u of[-.45,.45])m.bx(u-.03,u+.03,-.05,.05,0,.5,p);for(let k=0;k<5;k++){const u0=-.52+k*.208;m.bx(u0,u0+.208,-.02,.02,.32,.46,k&1?[240,240,240]:[210,30,30])}
  m.bx(-.52,.52,-.02,.02,.14,.18,[240,240,240]);return m.F},
 aboard(){const m=MB(),b=[29,79,154];m.fr([-.17,.17,-.13,.13],[-.17,.17,-.02,.02],0,.5,b,{top:b,fr:b,bk:b});m.decV(-.0751,-1,-.11,.11,.22,.42,[232,238,248]);
  m.q([[-.1,-.0752,.25],[.1,-.0752,.25],[.1,-.0752,.27],[-.1,-.0752,.27]].map(p=>[p[0],p[1]-.002,p[2]]),[29,79,154]);return m.F},
 table(){const m=MB(),d=[28,29,32];m.cy(0,0,.37,.18,.03,10,[38,39,43]);m.cy(0,0,0,.03,.37,6,d);m.cy(0,0,0,.1,.02,6,d);
  for(const s of[-1,1]){const v=s*.3;m.bx(-.11,.11,v-.1,v+.1,.22,.25,d);m.bx(-.11,.11,s<0?v-.12:v+.09,s<0?v-.09:v+.12,.25,.5,d);for(const a of[-.09,.09])for(const b of[-.08,.08])m.bx(a-.012,a+.012,v+b-.012,v+b+.012,0,.22,d)}return m.F},
 bin(){const m=MB();m.cy(0,0,0,.15,.4,10,[38,39,43]);m.cy(0,0,.4,.16,.05,10,[232,194,26]);m.decV(-.151,-1,-.05,.05,.22,.3,[220,220,220]);return m.F},
 bollard(){const m=MB(),g=[154,158,164];m.cy(0,0,0,.045,.36,8,g);m.cy(0,0,.11,.047,.04,8,[220,40,40]);m.cy(0,0,.36,.05,.03,8,[216,218,221]);return m.F},
 tree(vr){const m=MB(),R=k=>{const v=Math.sin(vr*91.7+k*12.9898)*43758.5453;return v-Math.floor(v)};const tr=[74,54,38],G=[[35,90,30],[47,116,38],[63,143,48],[88,168,62]];
  m.bx(-.11,.11,-.11,.11,0,1.6,tr,{top:tr});m.bx(-.04,.3,-.05,.05,1.1,1.2,tr);m.bx(-.28,.04,-.05,.05,1.25,1.33,tr);
  const C=[[0,0,1.55,.62],[.42,.15,1.75,.42],[-.4,-.2,1.8,.44],[.1,-.42,1.9,.4],[-.15,.4,1.95,.42],[0,0,2.35,.5],[.25,.2,2.7,.32],[-.2,-.15,2.75,.3]];
  C.forEach((c,i)=>{const r=c[3]*(.85+.3*R(i)),g=G[(i+(vr|0))%4];m.bx(c[0]-r,c[0]+r,c[1]-r,c[1]+r,c[2]-r*.6,c[2]+r*.9,g,{top:shadeC(g,1.15)})});return m.F},
 bush(vr){const m=MB(),G=[[35,90,30],[47,116,38],[63,143,48]];m.bx(-.32,.3,-.26,.26,0,.32,G[vr%3],{top:G[(vr+1)%3]});m.bx(-.2,.22,-.18,.2,.25,.45,G[(vr+1)%3],{top:G[(vr+2)%3]});m.bx(.1,.36,-.1,.2,.05,.3,G[(vr+2)%3]);return m.F},
 cone(){const m=MB();m.bx(-.14,.14,-.14,.14,0,.05,[210,34,34]);m.cone(0,0,.05,.02,.42,.13,10,[232,162,31]);m.ball(0,0,.5,.13,[246,208,224]);m.ball(0,0,.62,.1,[138,209,154]);m.ball(0,0,.72,.05,[230,50,50]);return m.F}};
const MODFOR={41:()=>MODELS.car('#b9bcc0'),42:()=>MODELS.car('#1d2238'),43:()=>MODELS.car('#b3242a'),44:()=>MODELS.car('#2b2b2e'),45:()=>MODELS.van(),56:()=>MODELS.container(),
 57:()=>MODELS.fence(),47:()=>MODELS.barrier(),59:()=>MODELS.aboard(),55:()=>MODELS.table(),46:()=>MODELS.bin(),53:()=>MODELS.bollard(),54:()=>MODELS.cone(),40:v=>MODELS.tree(v),48:v=>MODELS.bush(v)};
const VARS={40:3,48:3};   // Baeume und Buesche gibt es in mehreren Varianten
const MCACHE={};
function buildModel(t,P,d){const vr=VARS[t]?Math.abs(((d.x*7.3+d.y*13.1)|0))%VARS[t]:0,key=t+':'+vr,F=MCACHE[key]||(MCACHE[key]=MODFOR[t](vr));   // lokale Flaechen -> Welt
 return F.map(f=>{const v=f.v.map(p=>{const w=P(p[0],p[1]);return[w[0],w[1],p[2]]});const a=v[0],b=v[1],c=v[2],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],wx=c[0]-a[0],wy=c[1]-a[1],wz=c[2]-a[2];
  let n=[uy*wz-uz*wy,uz*wx-ux*wz,ux*wy-uy*wx];const l=Math.hypot(...n)||1;n=n.map(q=>q/l);return{v,c:f.c,n,cx:v.reduce((s,p)=>s+p[0],0)/v.length,cy:v.reduce((s,p)=>s+p[1],0)/v.length,cz:v.reduce((s,p)=>s+p[2],0)/v.length}})}
const SUN=(()=>{const v=[.45,.3,.85],l=Math.hypot(...v);return v.map(q=>q/l)})();
function drawModel3(o,s){const C=CAM,inv=1/(C.plx*C.dy-C.dx*C.ply),NZ=.06,ez=EY;
 const T=p=>{const ax=p[0]-C.px,ay=p[1]-C.py;return[inv*(C.dy*ax-C.dx*ay),inv*(-C.ply*ax+C.plx*ay),p[2]]};
 const night=!!LMI,lv=night?nlv(Math.max(1,Math.min(8,(8/(1+s.ty*FOG))|0)),s.x,s.y)/8:1,amb=night?.55:.62,dif=night?.25:.5;
 const vis=[];let x0=1e9,x1=-1e9;
 for(const f of o.M){const vx=C.px-f.cx,vy=C.py-f.cy,vz=ez-f.cz;if(f.n[0]*vx+f.n[1]*vy+f.n[2]*vz<=0)continue;   // Rueckseite
  let P=f.v.map(T);if(P.every(p=>p[1]<NZ))continue;
  if(P.some(p=>p[1]<NZ)){const R=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],ia=a[1]>=NZ,ib=b[1]>=NZ;if(ia)R.push(a);if(ia!=ib){const t=(NZ-a[1])/(b[1]-a[1]);R.push([a[0]+(b[0]-a[0])*t,NZ,a[2]+(b[2]-a[2])*t])}}P=R;if(P.length<3)continue}
  const S=P.map(p=>[VW/2*(1+p[0]/p[1]),HZ+(EY-p[2])*PV/p[1]]);for(const p of S){if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0]}
  const d=P.reduce((a,p)=>a+p[1],0)/P.length,k=(amb+dif*Math.max(0,f.n[0]*SUN[0]+f.n[1]*SUN[1]+f.n[2]*SUN[2]))*lv;vis.push({S,d,col:'rgb('+shadeC(f.c,k).join(',')+')'})}
 if(!vis.length)return;if(x1<0||x0>=VW)return;
 if(!clipCols(x0-1,x1+1,s.ty))return;x.save();x.clip();vis.sort((a,b)=>b.d-a.d);
 for(const f of vis){x.fillStyle=f.col;x.strokeStyle=f.col;x.lineWidth=.6;x.beginPath();x.moveTo(f.S[0][0],f.S[0][1]);for(let i=1;i<f.S.length;i++)x.lineTo(f.S[i][0],f.S[i][1]);x.closePath();x.fill();x.stroke()}
 x.restore()}
